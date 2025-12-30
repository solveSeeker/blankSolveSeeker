-- ============================================================================
-- Migration: 007 - Create User Roles Table
-- Description: Crea tabla de relación usuario-rol (many-to-many)
-- Dependencies: 002_create_sysensts.sql, 005_create_roles.sql
-- ============================================================================

-- ============================================================================
-- Table: user_roles (User-Role relationship)
-- ============================================================================
-- Purpose: Mapea usuarios a roles (relación muchos-a-muchos)
-- Inheritance: Hereda de sysEnts (incluye id, created, enabled, visible, key, etc.)
-- Note: enabled=false indica una asignación deshabilitada (se muestra en grids, no en selectores)
-- ============================================================================

CREATE TABLE user_roles (
  -- Relationship fields
  user_id UUID NOT NULL,
  role_id UUID NOT NULL,

  -- Constraint for unique assignment
  CONSTRAINT unique_user_role UNIQUE (user_id, role_id)
) INHERITS ("sysEnts");

-- Add foreign key constraints
ALTER TABLE user_roles
  ADD CONSTRAINT fk_user_roles_user
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE user_roles
  ADD CONSTRAINT fk_user_roles_role
  FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE;

-- Add comments for documentation
COMMENT ON TABLE user_roles IS 'Maps users to roles within companies. Inherits from sysEnts.';
COMMENT ON COLUMN user_roles.user_id IS 'Reference to the user (auth.users.id)';
COMMENT ON COLUMN user_roles.role_id IS 'Reference to the role';
COMMENT ON COLUMN user_roles.enabled IS 'Whether this role assignment is active (false = disabled assignment, shown in grids but not in selectors)';

-- Create indexes for common queries
CREATE INDEX idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX idx_user_roles_role_id ON user_roles(role_id);
CREATE INDEX idx_user_roles_enabled ON user_roles(enabled) WHERE enabled = true;
CREATE INDEX idx_user_roles_user_role ON user_roles(user_id, role_id);
CREATE INDEX idx_user_roles_created ON user_roles(created DESC);

-- Enable Row Level Security
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

-- RLS policies will be added in migration 010
