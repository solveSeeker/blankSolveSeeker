-- ============================================================================
-- Migration: 006 - Create User Companies Table
-- Description: Crea tabla de relación usuario-empresa (many-to-many)
-- Dependencies: 002_create_sysensts.sql, 003_create_profiles.sql, 004_create_companies.sql
-- ============================================================================

-- ============================================================================
-- Table: user_companies (User-Company relationship)
-- ============================================================================
-- Purpose: Mapea usuarios a empresas (relación muchos-a-muchos)
-- Inheritance: Hereda de sysEnts (incluye id, created, enabled, visible, key, etc.)
-- Note: enabled=false indica una asignación deshabilitada (se muestra en grids, no en selectores)
-- ============================================================================

CREATE TABLE user_companies (
  -- Relationship fields
  profile_id UUID NOT NULL,
  company_id UUID NOT NULL,

  -- Constraint for unique assignment
  CONSTRAINT unique_user_company UNIQUE (profile_id, company_id)
) INHERITS ("sysEnts");

-- Add foreign key constraints
ALTER TABLE user_companies
  ADD CONSTRAINT fk_user_companies_profile
  FOREIGN KEY (profile_id) REFERENCES profiles(id) ON DELETE CASCADE;

ALTER TABLE user_companies
  ADD CONSTRAINT fk_user_companies_company
  FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE;

-- Add comments for documentation
COMMENT ON TABLE user_companies IS 'Maps user profiles to companies with specific roles (many-to-many). Inherits from sysEnts.';
COMMENT ON COLUMN user_companies.profile_id IS 'Reference to the user profile (profiles.id)';
COMMENT ON COLUMN user_companies.company_id IS 'Reference to the company (companies.id)';
COMMENT ON COLUMN user_companies.enabled IS 'Whether this assignment is active (false = disabled assignment, shown in grids but not in selectors)';

-- Create indexes for common queries
CREATE INDEX idx_user_companies_profile_id ON user_companies(profile_id);
CREATE INDEX idx_user_companies_company_id ON user_companies(company_id);
CREATE INDEX idx_user_companies_enabled ON user_companies(enabled) WHERE enabled = true;
CREATE INDEX idx_user_companies_profile_company ON user_companies(profile_id, company_id);
CREATE INDEX idx_user_companies_created ON user_companies(created DESC);

-- Enable Row Level Security
ALTER TABLE user_companies ENABLE ROW LEVEL SECURITY;

-- RLS policies will be added in migration 010
