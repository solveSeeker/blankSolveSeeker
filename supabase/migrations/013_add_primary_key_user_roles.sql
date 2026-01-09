-- ============================================================================
-- Migration: 013 - Add PRIMARY KEY to user_roles table
-- Description: Agrega PRIMARY KEY al campo id de user_roles para que
--              pg_graphql exponga user_rolesCollection correctamente
-- Dependencies: 007_create_user_roles.sql
-- ============================================================================

-- IMPORTANTE: Esta migration es necesaria porque pg_graphql SOLO expone
-- tablas que tienen PRIMARY KEY definido.

-- ============================================================================
-- Agregar PRIMARY KEY al campo id
-- ============================================================================

ALTER TABLE user_roles
  ADD CONSTRAINT user_roles_pkey PRIMARY KEY (id);

-- Agregar comentario sobre la tabla
COMMENT ON TABLE user_roles IS 'Junction table for user-role relationships. Inherits from sysRelated. PRIMARY KEY required for pg_graphql exposure.';

-- Verificación: Query para confirmar que el PRIMARY KEY existe
-- SELECT
--   conname AS constraint_name,
--   contype AS constraint_type,
--   a.attname AS column_name
-- FROM pg_constraint c
-- JOIN pg_attribute a ON a.attnum = ANY(c.conkey) AND a.attrelid = c.conrelid
-- WHERE c.conrelid = 'user_roles'::regclass
--   AND c.contype = 'p';
-- Debe retornar: user_roles_pkey | p | id
