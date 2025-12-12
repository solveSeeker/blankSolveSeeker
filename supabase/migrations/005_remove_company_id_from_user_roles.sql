-- Remove company_id field from user_roles table
-- This migration removes the multi-tenancy feature that was causing RLS recursion issues

-- Drop the column if it exists
ALTER TABLE user_roles
DROP COLUMN IF EXISTS company_id;

-- Drop any indexes related to company_id on user_roles
DROP INDEX IF EXISTS idx_user_roles_company_id;

-- Update the unique constraint to only user_id and role_id
-- First drop the existing constraint if it includes company_id
ALTER TABLE user_roles
DROP CONSTRAINT IF EXISTS user_roles_user_id_role_id_company_id_key;

-- Ensure the correct unique constraint exists (user can have each role only once)
ALTER TABLE user_roles
DROP CONSTRAINT IF EXISTS user_roles_user_id_role_id_key;

ALTER TABLE user_roles
ADD CONSTRAINT user_roles_user_id_role_id_key
UNIQUE(user_id, role_id);

-- Recreate basic RLS policies without company_id references
DROP POLICY IF EXISTS "Users can view own roles" ON user_roles;
DROP POLICY IF EXISTS "Admins can manage user roles" ON user_roles;

-- Policy: Users can view their own roles (simplified)
CREATE POLICY "Users can view own roles"
  ON user_roles FOR SELECT
  USING (user_id = auth.uid());

-- Policy: Admins can manage all user roles (simplified, no company check)
CREATE POLICY "Admins can manage user roles"
  ON user_roles FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid() AND r.name = 'admin'
    )
  );

-- Verify the table structure
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'user_roles'
ORDER BY ordinal_position;
