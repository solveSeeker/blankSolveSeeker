-- ============================================================================
-- BACKUP DE ESQUEMA DE BASE DE DATOS
-- Fecha: 2025-12-30
-- Propósito: Respaldo antes de reorganizar migraciones
-- ============================================================================

-- NOTA: Este archivo contiene la estructura actual de la base de datos
-- incluyendo tablas, funciones, triggers y políticas RLS.

-- ============================================================================
-- TABLAS PRINCIPALES
-- ============================================================================

-- Tabla base: ents
-- Proporciona campos comunes para todas las entidades del sistema
CREATE TABLE IF NOT EXISTS ents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created TIMESTAMPTZ DEFAULT NOW(),
  "hashUpdate" UUID DEFAULT uuid_generate_v4(),
  visible BOOLEAN DEFAULT TRUE,
  enabled BOOLEAN DEFAULT TRUE,
  creator UUID DEFAULT auth.uid(),
  updater UUID,
  updated TIMESTAMPTZ
);

-- Tabla: sysEnts (hereda de ents)
-- Entidades del sistema con key única
CREATE TABLE IF NOT EXISTS "sysEnts" (
  key TEXT UNIQUE
) INHERITS (ents);

-- Tabla: profiles
-- Perfiles de usuarios (no hereda, tabla independiente)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  is_active BOOLEAN DEFAULT TRUE,
  created TIMESTAMPTZ DEFAULT NOW(),
  email TEXT,
  "fullName" TEXT,
  "avatarURL" TEXT,
  is_sysadmin BOOLEAN DEFAULT FALSE,
  creator UUID,
  updated TIMESTAMPTZ,
  updater UUID,
  "hashUpdate" UUID DEFAULT gen_random_uuid()
);

-- Tabla: companies (hereda de sysEnts)
CREATE TABLE IF NOT EXISTS companies (
  name TEXT,
  slug TEXT UNIQUE,
  logo_url TEXT,
  primary_color TEXT DEFAULT '#001f3f',
  secondary_color TEXT DEFAULT '#0074D9',
  accent_color TEXT DEFAULT '#FF4136',
  settings JSONB DEFAULT '{}'::jsonb
) INHERITS ("sysEnts");

-- Tabla: roles (hereda de sysEnts)
CREATE TABLE IF NOT EXISTS roles (
  name TEXT UNIQUE,
  description TEXT,
  permissions JSONB DEFAULT '{}'::jsonb,
  hrchy SMALLINT
) INHERITS ("sysEnts");

-- Tabla: user_companies (hereda de sysEnts)
-- Relación muchos-a-muchos entre usuarios y empresas
CREATE TABLE IF NOT EXISTS user_companies (
  profile_id UUID REFERENCES profiles(id),
  company_id UUID REFERENCES companies(id)
) INHERITS ("sysEnts");

-- Tabla: user_roles (hereda de sysEnts)
-- Relación muchos-a-muchos entre usuarios y roles
CREATE TABLE IF NOT EXISTS user_roles (
  user_id UUID REFERENCES auth.users(id),
  role_id UUID REFERENCES roles(id)
) INHERITS ("sysEnts");

-- Tabla: auditLog
-- Registro de auditoría de cambios
CREATE TABLE IF NOT EXISTS "auditLog" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "nameTable" TEXT,
  updated TIMESTAMP,
  "userIdentifier" TEXT,
  "beforeUpdate" JSONB,
  "idObject" UUID,
  "afterUpdate" JSONB,
  diff JSONB,
  "userId" UUID,
  "currentUser" TEXT
);

-- Tablas: persons, legalPersons, naturalPersons
CREATE TABLE IF NOT EXISTS persons () INHERITS ("sysEnts");
CREATE TABLE IF NOT EXISTS "legalPersons" (company TEXT) INHERITS (persons);
CREATE TABLE IF NOT EXISTS "naturalPersons" ("firstName" TEXT, "lastName" TEXT) INHERITS (persons);

-- ============================================================================
-- FUNCIONES
-- ============================================================================

-- Función: jsonb_custom_diff_recursive
-- Calcula diferencias recursivas entre dos objetos JSONB
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
  FOR key IN SELECT jsonb_object_keys(new_data)
  LOOP
    old_val := old_data -> key;
    new_val := new_data -> key;

    IF old_val IS NULL OR old_val <> new_val THEN
      IF jsonb_typeof(old_val) = 'object' AND jsonb_typeof(new_val) = 'object' THEN
        diff := diff || jsonb_build_object(key, jsonb_custom_diff_recursive(old_val, new_val));
      ELSE
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

-- Función: auditLogBeforeUpdate
-- Trigger function para auditoría de cambios
CREATE OR REPLACE FUNCTION "auditLogBeforeUpdate"()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
    diff jsonb;
    user_identifier text;
    user_id uuid;
BEGIN
    NEW.updated = NOW();
    NEW.updater = auth.uid();
    NEW."hashUpdate" = uuid_generate_v4();

    diff := jsonb_custom_diff_recursive(row_to_json(OLD)::JSONB, row_to_json(NEW)::JSONB);

    user_identifier := coalesce(
        auth.jwt() ->> 'email',
        current_user
    );

    user_id := (auth.jwt() ->> 'sub')::uuid;

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

-- Función: get_current_user_is_sysadmin
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

-- Función: get_current_user_has_any_role
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

-- ============================================================================
-- TRIGGERS
-- ============================================================================

CREATE TRIGGER "auditLogCompanies" BEFORE UPDATE ON companies
  FOR EACH ROW EXECUTE FUNCTION "auditLogBeforeUpdate"();

CREATE TRIGGER "auditLogProfiles" BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION "auditLogBeforeUpdate"();

CREATE TRIGGER "auditLogRoles" BEFORE UPDATE ON roles
  FOR EACH ROW EXECUTE FUNCTION "auditLogBeforeUpdate"();

CREATE TRIGGER "auditLogUserCompanies" BEFORE UPDATE ON user_companies
  FOR EACH ROW EXECUTE FUNCTION "auditLogBeforeUpdate"();

CREATE TRIGGER "auditLogUserRoles" BEFORE UPDATE ON user_roles
  FOR EACH ROW EXECUTE FUNCTION "auditLogBeforeUpdate"();

-- ============================================================================
-- POLÍTICAS RLS (Row Level Security)
-- ============================================================================

-- Companies
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read all companies"
  ON companies FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can create companies"
  ON companies FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update companies"
  ON companies FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Only sysAdmin can delete companies"
  ON companies FOR DELETE
  TO authenticated
  USING (auth.jwt() ->> 'email' = 'solve.seeker.dev@gmail.com');

-- Profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view profiles by role"
  ON profiles FOR SELECT
  TO authenticated
  USING (
    get_current_user_is_sysadmin() = true
    OR (get_current_user_has_any_role() = true AND is_sysadmin = false)
  );

CREATE POLICY "SysAdmins or users with roles can insert profiles"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (
    get_current_user_is_sysadmin() = true
    OR get_current_user_has_any_role() = true
  );

CREATE POLICY "SysAdmins or users with roles can update profiles"
  ON profiles FOR UPDATE
  TO authenticated
  USING (
    get_current_user_is_sysadmin() = true
    OR get_current_user_has_any_role() = true
  )
  WITH CHECK (
    (get_current_user_is_sysadmin() = true OR get_current_user_has_any_role() = true)
    AND email = (SELECT p.email FROM profiles p WHERE p.id = profiles.id LIMIT 1)
  );

CREATE POLICY "Super admin deletes profiles except own"
  ON profiles FOR DELETE
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM auth.users WHERE users.id = auth.uid() AND users.email = 'solve.seeker.dev@gmail.com')
    AND email <> 'solve.seeker.dev@gmail.com'
  );

-- Roles
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read all roles"
  ON roles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can create roles"
  ON roles FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update roles"
  ON roles FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Only sysAdmin can delete roles"
  ON roles FOR DELETE
  TO authenticated
  USING (auth.jwt() ->> 'email' = 'solve.seeker.dev@gmail.com');

-- User Companies
ALTER TABLE user_companies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read relationships"
  ON user_companies FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert relationships"
  ON user_companies FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update relationships"
  ON user_companies FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Only super admin can delete relationships"
  ON user_companies FOR DELETE
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.email = 'solve.seeker.dev@gmail.com')
  );

-- User Roles
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read all user roles"
  ON user_roles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can create user roles"
  ON user_roles FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update user roles"
  ON user_roles FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Only sysAdmin can delete user roles"
  ON user_roles FOR DELETE
  TO authenticated
  USING (auth.jwt() ->> 'email' = 'solve.seeker.dev@gmail.com');

-- Audit Log
ALTER TABLE "auditLog" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "SysAdmin can view all audit logs"
  ON "auditLog" FOR SELECT
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_sysadmin = true)
  );

CREATE POLICY "Authenticated users can insert audit logs"
  ON "auditLog" FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Deny all updates on audit logs"
  ON "auditLog" FOR UPDATE
  TO anon, authenticated
  USING (false)
  WITH CHECK (false);

CREATE POLICY "Deny all deletes on audit logs"
  ON "auditLog" FOR DELETE
  TO anon, authenticated
  USING (false);
