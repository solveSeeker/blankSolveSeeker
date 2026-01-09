-- ============================================================================
-- Migration: 014 - Add PRIMARY KEY to user_companies table
-- Description: Agrega PRIMARY KEY al campo id de user_companies para que
--              pg_graphql exponga user_companiesCollection correctamente
-- Dependencies: 006_create_user_companies.sql
-- ============================================================================

-- IMPORTANTE: Esta migration es necesaria porque pg_graphql SOLO expone
-- tablas que tienen PRIMARY KEY definido.

-- ============================================================================
-- Agregar PRIMARY KEY al campo id
-- ============================================================================

ALTER TABLE user_companies
  ADD CONSTRAINT user_companies_pkey PRIMARY KEY (id);

-- Agregar comentario sobre la tabla
COMMENT ON TABLE user_companies IS 'Junction table for user-company relationships. Inherits from sysRelated. PRIMARY KEY required for pg_graphql exposure.';

-- Verificación: Query para confirmar que el PRIMARY KEY existe
-- SELECT
--   conname AS constraint_name,
--   contype AS constraint_type,
--   a.attname AS column_name
-- FROM pg_constraint c
-- JOIN pg_attribute a ON a.attnum = ANY(c.conkey) AND a.attrelid = c.conrelid
-- WHERE c.conrelid = 'user_companies'::regclass
--   AND c.contype = 'p';
-- Debe retornar: user_companies_pkey | p | id
