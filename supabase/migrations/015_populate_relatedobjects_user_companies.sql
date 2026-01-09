-- ============================================================================
-- Migration: 015 - Populate relatedObjects in user_companies table
-- Description: Pobla el campo relatedObjects con datos denormalizados de
--              profiles (email) y companies (name) para búsquedas rápidas
-- Dependencies: 006_create_user_companies.sql, 014_add_primary_key_user_companies.sql
-- ============================================================================

-- IMPORTANTE: Esta migration es necesaria para poblar relatedObjects en
-- registros existentes. Los nuevos registros se crearán con relatedObjects
-- ya poblado desde el frontend.

-- ============================================================================
-- Poblar relatedObjects en user_companies existentes
-- ============================================================================

UPDATE user_companies uc
SET "relatedObjects" = jsonb_build_object(
  'profiles', p.email,
  'companies', c.name
)
FROM profiles p, companies c
WHERE uc.profile_id = p.id
  AND uc.company_id = c.id
  AND uc."relatedObjects" IS NULL;

-- Verificación: Query para confirmar que relatedObjects está poblado
-- SELECT
--   id,
--   profile_id,
--   company_id,
--   "relatedObjects",
--   "relatedObjects"->>'profiles' as profile_email,
--   "relatedObjects"->>'companies' as company_name
-- FROM user_companies
-- WHERE enabled = true;
-- Todos los registros deben tener relatedObjects con formato:
-- {"profiles": "email@example.com", "companies": "nombre-empresa"}

-- Query para verificar que NO hay registros sin relatedObjects
-- SELECT COUNT(*) as registros_sin_relatedobjects
-- FROM user_companies
-- WHERE "relatedObjects" IS NULL
--   AND enabled = true;
-- Debe retornar: 0
