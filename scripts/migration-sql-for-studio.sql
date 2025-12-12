-- ============================================
-- MIGRACIÓN: Eliminar company_id de user_roles
-- ============================================
-- Instrucciones:
-- 1. Ve a Supabase Studio: https://supabase.com/dashboard/project/sryamrzbgqbzyvlqltjm/editor
-- 2. Abre el SQL Editor
-- 3. Copia y pega este SQL completo
-- 4. Ejecuta (Run)
-- ============================================

-- Step 1: Drop the company_id column if it exists
ALTER TABLE user_roles DROP COLUMN IF EXISTS company_id;

-- Step 2: Drop any indexes related to company_id
DROP INDEX IF EXISTS idx_user_roles_company_id;

-- Step 3: Update unique constraints
ALTER TABLE user_roles DROP CONSTRAINT IF EXISTS user_roles_user_id_role_id_company_id_key;
ALTER TABLE user_roles DROP CONSTRAINT IF EXISTS user_roles_user_id_role_id_key;
ALTER TABLE user_roles ADD CONSTRAINT user_roles_user_id_role_id_key UNIQUE(user_id, role_id);

-- Step 4: Recreate RLS policies without company_id references
DROP POLICY IF EXISTS "Users can view own roles" ON user_roles;
DROP POLICY IF EXISTS "Admins can manage user roles" ON user_roles;

CREATE POLICY "Users can view own roles"
  ON user_roles FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Admins can manage user roles"
  ON user_roles FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid() AND r.name = 'admin'
    )
  );

-- Step 5: Verify the structure
SELECT
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'user_roles'
ORDER BY ordinal_position;
