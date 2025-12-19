-- Add RLS policies for profiles table
-- This migration adds proper RLS policies to allow:
-- 1. Users to view profiles in their tenant
-- 2. Users to update their own profile
-- 3. SysAdmins to update any profile

-- Enable RLS on profiles table (if not already enabled)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Drop any existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can view profiles from their tenant" ON profiles;
DROP POLICY IF EXISTS "Users can view all profiles in their tenant" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "SysAdmins can update any profile" ON profiles;

-- SELECT Policy: Users can view all profiles in their tenant OR if they are sysadmin
CREATE POLICY "Users can view all profiles in their tenant"
  ON profiles FOR SELECT
  USING (
    -- Allow if user is in the same tenant
    tenant_id = (
      SELECT tenant_id
      FROM profiles
      WHERE id = auth.uid()
    )
    OR
    -- Allow if user is sysadmin (bypass tenant isolation)
    EXISTS (
      SELECT 1
      FROM profiles
      WHERE id = auth.uid()
      AND is_sysadmin = true
    )
  );

-- UPDATE Policy: Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- UPDATE Policy: SysAdmins can update any profile
CREATE POLICY "SysAdmins can update any profile"
  ON profiles FOR UPDATE
  USING (
    EXISTS (
      SELECT 1
      FROM profiles
      WHERE id = auth.uid()
      AND is_sysadmin = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM profiles
      WHERE id = auth.uid()
      AND is_sysadmin = true
    )
  );
