-- ============================================================================
-- Migration: 005 - Create Roles Table
-- Description: Crea tabla de roles del sistema
-- Dependencies: 002_create_sysensts.sql
-- ============================================================================

-- ============================================================================
-- Table: roles (User roles)
-- ============================================================================
-- Purpose: Define roles de usuario en el sistema con permisos y jerarquía
-- Inheritance: Hereda de sysEnts (incluye id, created, enabled, visible, key, etc.)
-- ============================================================================

CREATE TABLE roles (
  -- Role information
  name TEXT NOT NULL UNIQUE,
  description TEXT,

  -- Permissions and hierarchy
  permissions JSONB DEFAULT '{}'::jsonb,
  hrchy SMALLINT
) INHERITS ("sysEnts");

-- Add comments for documentation
COMMENT ON TABLE roles IS 'User roles in the system. Inherits from sysEnts.';
COMMENT ON COLUMN roles.name IS 'Unique role name (e.g., owner, admin, manager, user, viewer)';
COMMENT ON COLUMN roles.description IS 'Description of the role and its permissions';
COMMENT ON COLUMN roles.permissions IS 'JSON object defining permissions for this role';
COMMENT ON COLUMN roles.hrchy IS 'Hierarchy level (lower number = higher privilege)';

-- Create indexes for common queries
CREATE INDEX idx_roles_name ON roles(name);
CREATE INDEX idx_roles_hrchy ON roles(hrchy);
CREATE INDEX idx_roles_enabled ON roles(enabled) WHERE enabled = true;
CREATE INDEX idx_roles_visible ON roles(visible) WHERE visible = true;
CREATE INDEX idx_roles_created ON roles(created DESC);

-- Enable Row Level Security
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;

-- RLS policies will be added in migration 010
