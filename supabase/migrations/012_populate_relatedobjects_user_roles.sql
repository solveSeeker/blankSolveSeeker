-- ============================================================================
-- Migration: 012 - Populate relatedObjects in user_roles
-- Description: Pobla el campo relatedObjects en user_roles existentes
--              con formato JSON: {"profiles": "email", "roles": "name"}
-- Dependencies: Cambios estructurales previos (profile_id, relatedObjects)
-- ============================================================================

-- IMPORTANTE: Esta migration asume que:
-- 1. El campo profile_id ya existe en user_roles (renombrado de user_id)
-- 2. El campo relatedObjects ya existe en user_roles (tipo JSON)
-- 3. La herencia cambió de sysObjects → sysRelated

-- ============================================================================
-- Poblar relatedObjects en registros existentes
-- ============================================================================

UPDATE user_roles ur
SET "relatedObjects" = jsonb_build_object(
  'profiles', p.email,
  'roles', r.name
)
FROM profiles p, roles r
WHERE ur.profile_id = p.id
  AND ur.role_id = r.id
  AND ur."relatedObjects" IS NULL;

-- Agregar comentario sobre el campo relatedObjects
COMMENT ON COLUMN user_roles."relatedObjects" IS 'JSON object storing denormalized references: {"profiles": "email", "roles": "name"}';

-- Verificación: Query para confirmar que todos tienen relatedObjects
-- SELECT
--   id,
--   profile_id,
--   role_id,
--   "relatedObjects"->>'profiles' as profile_email,
--   "relatedObjects"->>'roles' as role_name,
--   enabled
-- FROM user_roles
-- WHERE "relatedObjects" IS NOT NULL;
