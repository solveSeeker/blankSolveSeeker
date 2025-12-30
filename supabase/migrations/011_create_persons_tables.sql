-- ============================================================================
-- Migration: 011 - Create Persons Tables (Optional)
-- Description: Crea tablas para personas naturales y jurídicas
-- Dependencies: 002_create_sysensts.sql
-- Note: Estas tablas son opcionales y están preparadas para uso futuro
-- ============================================================================

-- ============================================================================
-- Table: persons (Base persons table)
-- ============================================================================
-- Purpose: Tabla base para personas (naturales y jurídicas)
-- Inheritance: Hereda de sysEnts
-- Note: Esta tabla es abstracta, no se usa directamente
-- ============================================================================

CREATE TABLE persons (
  -- No additional fields, all inherited from sysEnts
) INHERITS ("sysEnts");

COMMENT ON TABLE persons IS 'Base table for persons (individuals and legal entities). Inherits all base properties from sysEnts.';

-- Create indexes
CREATE INDEX idx_persons_enabled ON persons(enabled) WHERE enabled = true;
CREATE INDEX idx_persons_visible ON persons(visible) WHERE visible = true;
CREATE INDEX idx_persons_created ON persons(created DESC);

-- Enable Row Level Security
ALTER TABLE persons ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- Table: naturalPersons (Natural persons / Individuals)
-- ============================================================================
-- Purpose: Personas naturales (individuos, personas físicas)
-- Inheritance: Hereda de persons → sysEnts
-- ============================================================================

CREATE TABLE "naturalPersons" (
  -- Person information
  "firstName" TEXT,
  "lastName" TEXT
) INHERITS (persons);

COMMENT ON TABLE "naturalPersons" IS 'Natural persons (individuals, people). Inherits all base properties from persons and sysEnts.';
COMMENT ON COLUMN "naturalPersons"."firstName" IS 'First name of the natural person';
COMMENT ON COLUMN "naturalPersons"."lastName" IS 'Last name of the natural person';

-- Create indexes
CREATE INDEX idx_naturalPersons_firstName ON "naturalPersons"("firstName");
CREATE INDEX idx_naturalPersons_lastName ON "naturalPersons"("lastName");
CREATE INDEX idx_naturalPersons_enabled ON "naturalPersons"(enabled) WHERE enabled = true;

-- Enable Row Level Security
ALTER TABLE "naturalPersons" ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- Table: legalPersons (Legal persons / Companies)
-- ============================================================================
-- Purpose: Personas jurídicas (empresas, organizaciones)
-- Inheritance: Hereda de persons → sysEnts
-- ============================================================================

CREATE TABLE "legalPersons" (
  -- Legal entity information
  company TEXT
) INHERITS (persons);

COMMENT ON TABLE "legalPersons" IS 'Legal persons (companies, organizations). Inherits all base properties from persons and sysEnts.';
COMMENT ON COLUMN "legalPersons".company IS 'Company name or legal business name';

-- Create indexes
CREATE INDEX idx_legalPersons_company ON "legalPersons"(company);
CREATE INDEX idx_legalPersons_enabled ON "legalPersons"(enabled) WHERE enabled = true;

-- Enable Row Level Security
ALTER TABLE "legalPersons" ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- RLS POLICIES FOR PERSONS TABLES
-- ============================================================================

-- Persons
CREATE POLICY "Authenticated users can read persons"
  ON persons FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert persons"
  ON persons FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update persons"
  ON persons FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Only super admin can delete persons"
  ON persons FOR DELETE
  TO authenticated
  USING (auth.jwt() ->> 'email' = 'solve.seeker.dev@gmail.com');

-- Natural Persons
CREATE POLICY "Authenticated users can read naturalPersons"
  ON "naturalPersons" FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert naturalPersons"
  ON "naturalPersons" FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update naturalPersons"
  ON "naturalPersons" FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Only super admin can delete naturalPersons"
  ON "naturalPersons" FOR DELETE
  TO authenticated
  USING (auth.jwt() ->> 'email' = 'solve.seeker.dev@gmail.com');

-- Legal Persons
CREATE POLICY "Authenticated users can read legalPersons"
  ON "legalPersons" FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert legalPersons"
  ON "legalPersons" FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update legalPersons"
  ON "legalPersons" FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Only super admin can delete legalPersons"
  ON "legalPersons" FOR DELETE
  TO authenticated
  USING (auth.jwt() ->> 'email' = 'solve.seeker.dev@gmail.com');
