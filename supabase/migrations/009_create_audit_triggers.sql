-- ============================================================================
-- Migration: 009 - Create Audit Triggers
-- Description: Crea triggers de auditoría para tablas principales
-- Dependencies: 008_create_auditlog_and_functions.sql
-- ============================================================================

-- ============================================================================
-- IMPORTANT NOTE: auditLog table is excluded from auditing
-- ============================================================================
-- The auditLog table itself should NEVER have audit triggers to avoid
-- infinite recursion and circular dependencies.
-- ============================================================================

-- ============================================================================
-- Trigger: Audit for profiles table
-- ============================================================================

CREATE TRIGGER "auditLogProfiles"
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION "auditLogBeforeUpdate"();

COMMENT ON TRIGGER "auditLogProfiles" ON profiles IS 'Logs all updates to the profiles table';

-- ============================================================================
-- Trigger: Audit for companies table
-- ============================================================================

CREATE TRIGGER "auditLogCompanies"
  BEFORE UPDATE ON companies
  FOR EACH ROW
  EXECUTE FUNCTION "auditLogBeforeUpdate"();

COMMENT ON TRIGGER "auditLogCompanies" ON companies IS 'Logs all updates to the companies table';

-- ============================================================================
-- Trigger: Audit for roles table
-- ============================================================================

CREATE TRIGGER "auditLogRoles"
  BEFORE UPDATE ON roles
  FOR EACH ROW
  EXECUTE FUNCTION "auditLogBeforeUpdate"();

COMMENT ON TRIGGER "auditLogRoles" ON roles IS 'Logs all updates to the roles table';

-- ============================================================================
-- Trigger: Audit for user_companies table
-- ============================================================================

CREATE TRIGGER "auditLogUserCompanies"
  BEFORE UPDATE ON user_companies
  FOR EACH ROW
  EXECUTE FUNCTION "auditLogBeforeUpdate"();

COMMENT ON TRIGGER "auditLogUserCompanies" ON user_companies IS 'Logs all updates to the user_companies table';

-- ============================================================================
-- Trigger: Audit for user_roles table
-- ============================================================================

CREATE TRIGGER "auditLogUserRoles"
  BEFORE UPDATE ON user_roles
  FOR EACH ROW
  EXECUTE FUNCTION "auditLogBeforeUpdate"();

COMMENT ON TRIGGER "auditLogUserRoles" ON user_roles IS 'Logs all updates to the user_roles table';
