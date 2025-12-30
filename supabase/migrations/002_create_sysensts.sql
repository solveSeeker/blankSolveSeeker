-- ============================================================================
-- Migration: 002 - Create System Entities Table
-- Description: Crea tabla sysEnts que hereda de ents y agrega campo 'key'
-- Dependencies: 001_enable_extensions_create_ents.sql
-- ============================================================================

-- ============================================================================
-- Table: sysEnts (System entities)
-- ============================================================================
-- Purpose: Entidades del sistema que requieren un identificador único de texto
-- Inheritance: Hereda todos los campos de 'ents'
-- Additional Fields: key (identificador único de texto)
-- ============================================================================

CREATE TABLE "sysEnts" (
  -- Unique text identifier (slug, handle, etc.)
  key TEXT NOT NULL UNIQUE
) INHERITS (ents);

-- Add comments for documentation
COMMENT ON TABLE "sysEnts" IS 'System entities table. Inherits all base properties from ents and adds a unique key identifier.';
COMMENT ON COLUMN "sysEnts".key IS 'Unique text identifier for the system entity (e.g., slug, handle)';

-- Create indexes for common queries
CREATE INDEX idx_sysensts_key ON "sysEnts"(key);
CREATE INDEX idx_sysensts_enabled ON "sysEnts"(enabled) WHERE enabled = true;
CREATE INDEX idx_sysensts_visible ON "sysEnts"(visible) WHERE visible = true;

-- Enable Row Level Security
ALTER TABLE "sysEnts" ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Allow authenticated users to read all system entities
CREATE POLICY "Authenticated users can read sysEnts"
  ON "sysEnts" FOR SELECT
  TO authenticated
  USING (true);

-- RLS Policy: Allow authenticated users to insert system entities
CREATE POLICY "Authenticated users can insert sysEnts"
  ON "sysEnts" FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- RLS Policy: Allow authenticated users to update system entities
CREATE POLICY "Authenticated users can update sysEnts"
  ON "sysEnts" FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- RLS Policy: Only super admin can delete system entities
CREATE POLICY "Only super admin can delete sysEnts"
  ON "sysEnts" FOR DELETE
  TO authenticated
  USING (auth.jwt() ->> 'email' = 'solve.seeker.dev@gmail.com');
