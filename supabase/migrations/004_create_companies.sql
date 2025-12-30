-- ============================================================================
-- Migration: 004 - Create Companies Table
-- Description: Crea tabla de empresas/organizaciones del sistema multi-tenant
-- Dependencies: 002_create_sysensts.sql
-- ============================================================================

-- ============================================================================
-- Table: companies (Companies/Organizations)
-- ============================================================================
-- Purpose: Almacena empresas u organizaciones en el sistema multi-tenant
-- Inheritance: Hereda de sysEnts (incluye id, created, enabled, visible, key, etc.)
-- ============================================================================

CREATE TABLE companies (
  -- Company information
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,

  -- Branding
  logo_url TEXT,
  primary_color TEXT DEFAULT '#001f3f',
  secondary_color TEXT DEFAULT '#0074D9',
  accent_color TEXT DEFAULT '#FF4136',

  -- Configuration
  settings JSONB DEFAULT '{}'::jsonb
) INHERITS ("sysEnts");

-- Add comments for documentation
COMMENT ON TABLE companies IS 'Companies/Organizations in the multi-tenant system. Inherits from sysEnts.';
COMMENT ON COLUMN companies.name IS 'Company display name';
COMMENT ON COLUMN companies.slug IS 'URL-friendly unique identifier';
COMMENT ON COLUMN companies.logo_url IS 'URL to company logo stored in Supabase Storage';
COMMENT ON COLUMN companies.primary_color IS 'Primary brand color (hex)';
COMMENT ON COLUMN companies.secondary_color IS 'Secondary brand color (hex)';
COMMENT ON COLUMN companies.accent_color IS 'Accent brand color (hex)';
COMMENT ON COLUMN companies.settings IS 'JSON configuration for company-specific settings (features, limits, etc.)';

-- Create indexes for common queries
CREATE INDEX idx_companies_slug ON companies(slug);
CREATE INDEX idx_companies_name ON companies(name);
CREATE INDEX idx_companies_enabled ON companies(enabled) WHERE enabled = true;
CREATE INDEX idx_companies_visible ON companies(visible) WHERE visible = true;
CREATE INDEX idx_companies_created ON companies(created DESC);

-- Enable Row Level Security
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;

-- RLS policies will be added in migration 010
