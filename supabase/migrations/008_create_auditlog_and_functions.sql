-- ============================================================================
-- Migration: 008 - Create Audit Log and Helper Functions
-- Description: Crea tabla de auditoría y funciones auxiliares
-- Dependencies: None (independiente)
-- ============================================================================

-- ============================================================================
-- Table: auditLog (Audit trail)
-- ============================================================================
-- Purpose: Registro de todos los cambios en las tablas del sistema
-- Note: Esta tabla NO debe ser modificada ni eliminada una vez creada
-- ============================================================================

CREATE TABLE "auditLog" (
  -- Primary identifier
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Audit information
  "nameTable" TEXT,
  "idObject" UUID,
  updated TIMESTAMP,

  -- User information
  "userId" UUID,
  "userIdentifier" TEXT,
  "currentUser" TEXT,

  -- Change tracking
  "beforeUpdate" JSONB,
  "afterUpdate" JSONB,
  diff JSONB
);

-- Add comments for documentation
COMMENT ON TABLE "auditLog" IS 'Audit log for tracking all changes in the system. NEVER modify or delete records.';
COMMENT ON COLUMN "auditLog".id IS 'Unique identifier for the audit log entry';
COMMENT ON COLUMN "auditLog"."nameTable" IS 'Name of the table that was modified';
COMMENT ON COLUMN "auditLog"."idObject" IS 'ID of the record that was modified';
COMMENT ON COLUMN "auditLog".updated IS 'Timestamp when the modification occurred';
COMMENT ON COLUMN "auditLog"."userId" IS 'UUID of the user who made the change';
COMMENT ON COLUMN "auditLog"."userIdentifier" IS 'Email or identifier of the user';
COMMENT ON COLUMN "auditLog"."currentUser" IS 'Database user (technical field)';
COMMENT ON COLUMN "auditLog"."beforeUpdate" IS 'State of the record before the update';
COMMENT ON COLUMN "auditLog"."afterUpdate" IS 'State of the record after the update';
COMMENT ON COLUMN "auditLog".diff IS 'Calculated differences between before and after';

-- Create indexes for common queries
CREATE INDEX idx_auditlog_nametable ON "auditLog"("nameTable");
CREATE INDEX idx_auditlog_idobject ON "auditLog"("idObject");
CREATE INDEX idx_auditlog_userid ON "auditLog"("userId");
CREATE INDEX idx_auditlog_updated ON "auditLog"(updated DESC);

-- ============================================================================
-- Function: jsonb_custom_diff_recursive
-- ============================================================================
-- Purpose: Calcula diferencias recursivas entre dos objetos JSONB
-- Used by: auditLogBeforeUpdate trigger function
-- ============================================================================

CREATE OR REPLACE FUNCTION jsonb_custom_diff_recursive(old_data JSONB, new_data JSONB)
RETURNS JSONB
LANGUAGE plpgsql
IMMUTABLE
AS $$
DECLARE
  diff JSONB := '{}'::JSONB;
  key TEXT;
  old_val JSONB;
  new_val JSONB;
BEGIN
  -- Iterate through all keys in new_data
  FOR key IN SELECT jsonb_object_keys(new_data)
  LOOP
    old_val := old_data -> key;
    new_val := new_data -> key;

    -- If key doesn't exist in old_data or values are different
    IF old_val IS NULL OR old_val <> new_val THEN
      -- If both are objects, recurse
      IF jsonb_typeof(old_val) = 'object' AND jsonb_typeof(new_val) = 'object' THEN
        diff := diff || jsonb_build_object(key, jsonb_custom_diff_recursive(old_val, new_val));
      ELSE
        -- Store the change with old and new values
        diff := diff || jsonb_build_object(
          key,
          jsonb_build_object(
            'old', old_val,
            'new', new_val
          )
        );
      END IF;
    END IF;
  END LOOP;

  -- Check for keys that were removed (exist in old but not in new)
  FOR key IN SELECT jsonb_object_keys(old_data)
  LOOP
    IF new_data -> key IS NULL THEN
      diff := diff || jsonb_build_object(
        key,
        jsonb_build_object(
          'old', old_data -> key,
          'new', NULL
        )
      );
    END IF;
  END LOOP;

  RETURN diff;
END;
$$;

COMMENT ON FUNCTION jsonb_custom_diff_recursive IS 'Calculates recursive differences between two JSONB objects for audit trail';

-- ============================================================================
-- Function: auditLogBeforeUpdate
-- ============================================================================
-- Purpose: Trigger function que registra cambios antes de actualizar un registro
-- Note: Se ejecuta ANTES de UPDATE en tablas configuradas
-- ============================================================================

CREATE OR REPLACE FUNCTION "auditLogBeforeUpdate"()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
    diff JSONB;
    user_identifier TEXT;
    user_id UUID;
BEGIN
    -- Update audit fields
    NEW.updated = NOW();
    NEW.updater = auth.uid();
    NEW."hashUpdate" = uuid_generate_v4();

    -- Calculate differences
    diff := jsonb_custom_diff_recursive(row_to_json(OLD)::JSONB, row_to_json(NEW)::JSONB);

    -- Get user information
    user_identifier := COALESCE(
        auth.jwt() ->> 'email',
        current_user
    );

    user_id := (auth.jwt() ->> 'sub')::uuid;

    -- Insert audit log entry
    INSERT INTO "auditLog" (
        "nameTable",
        updated,
        "userIdentifier",
        "beforeUpdate",
        "idObject",
        "afterUpdate",
        diff,
        "userId",
        "currentUser"
    ) VALUES (
        TG_TABLE_NAME,
        NOW(),
        user_identifier,
        row_to_json(OLD),
        OLD.id,
        row_to_json(NEW),
        diff,
        user_id,
        current_user
    );

    RETURN NEW;
END;
$$;

COMMENT ON FUNCTION "auditLogBeforeUpdate" IS 'Trigger function that logs changes before updating a record';

-- ============================================================================
-- Helper Functions for RLS
-- ============================================================================

-- Function: get_current_user_is_sysadmin
CREATE OR REPLACE FUNCTION get_current_user_is_sysadmin()
RETURNS BOOLEAN
LANGUAGE SQL
STABLE SECURITY DEFINER
AS $$
  SELECT COALESCE(
    (SELECT is_sysadmin FROM public.profiles WHERE id = auth.uid() LIMIT 1),
    false
  );
$$;

COMMENT ON FUNCTION get_current_user_is_sysadmin IS 'Returns true if current user is a system administrator';

-- Function: get_current_user_has_any_role
CREATE OR REPLACE FUNCTION get_current_user_has_any_role()
RETURNS BOOLEAN
LANGUAGE SQL
STABLE SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = auth.uid()
    AND enabled = true
  );
$$;

COMMENT ON FUNCTION get_current_user_has_any_role IS 'Returns true if current user has any active role assigned';

-- Enable Row Level Security on auditLog
ALTER TABLE "auditLog" ENABLE ROW LEVEL SECURITY;

-- RLS policies for auditLog will be added in migration 010
