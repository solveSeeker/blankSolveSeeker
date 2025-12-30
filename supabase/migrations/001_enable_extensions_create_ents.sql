-- ============================================================================
-- Migration: 001 - Enable Extensions & Create Base Table 'ents'
-- Description: Habilita extensiones necesarias y crea tabla base para entidades
-- Dependencies: None
-- ============================================================================

-- Enable UUID extension for generating UUIDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- Table: ents (Base entities table)
-- ============================================================================
-- Purpose: Tabla base que proporciona campos comunes para todas las entidades
-- Inheritance: Esta tabla será heredada por sysEnts y otras tablas
-- ============================================================================

CREATE TABLE ents (
  -- Primary identifier
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Timestamps
  created TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated TIMESTAMPTZ,

  -- Change tracking
  "hashUpdate" UUID NOT NULL DEFAULT uuid_generate_v4(),

  -- Soft delete and visibility flags
  visible BOOLEAN NOT NULL DEFAULT TRUE,  -- Soft delete: false = logically deleted
  enabled BOOLEAN NOT NULL DEFAULT TRUE,  -- Visibility: false = hidden in selectors/dropdowns

  -- User tracking
  creator UUID NOT NULL DEFAULT auth.uid(),
  updater UUID
);

-- Add comments for documentation
COMMENT ON TABLE ents IS 'Base table for all system entities. Provides common fields for tracking, visibility, and audit.';
COMMENT ON COLUMN ents.id IS 'Unique identifier for the entity';
COMMENT ON COLUMN ents.created IS 'Timestamp when the entity was created';
COMMENT ON COLUMN ents.updated IS 'Timestamp when the entity was last updated';
COMMENT ON COLUMN ents."hashUpdate" IS 'Hash for tracking updates and optimistic locking';
COMMENT ON COLUMN ents.visible IS 'Soft delete flag: true=exists, false=logically deleted (not shown anywhere)';
COMMENT ON COLUMN ents.enabled IS 'Visibility flag: true=shown everywhere, false=shown only in admin grids, hidden in selectors/dropdowns';
COMMENT ON COLUMN ents.creator IS 'User ID who created the entity';
COMMENT ON COLUMN ents.updater IS 'User ID who last updated the entity';

-- Create indexes for common queries
CREATE INDEX idx_ents_created ON ents(created DESC);
CREATE INDEX idx_ents_enabled ON ents(enabled) WHERE enabled = true;
CREATE INDEX idx_ents_visible ON ents(visible) WHERE visible = true;
CREATE INDEX idx_ents_creator ON ents(creator);

-- Enable Row Level Security
ALTER TABLE ents ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Allow authenticated users to read all entities
CREATE POLICY "Authenticated users can read ents"
  ON ents FOR SELECT
  TO authenticated
  USING (true);

-- RLS Policy: Allow authenticated users to insert entities
CREATE POLICY "Authenticated users can insert ents"
  ON ents FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- RLS Policy: Allow authenticated users to update entities
CREATE POLICY "Authenticated users can update ents"
  ON ents FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- RLS Policy: Only super admin can delete entities
CREATE POLICY "Only super admin can delete ents"
  ON ents FOR DELETE
  TO authenticated
  USING (auth.jwt() ->> 'email' = 'solve.seeker.dev@gmail.com');
