-- Fix RLS policies for user_profiles to allow viewing all users in same tenant
-- Problem: Users can only see their own profile, not all profiles in their tenant
-- Solution: Consolidate policies and ensure tenant-based visibility works

-- Drop existing SELECT policies
DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can view profiles from their tenant" ON user_profiles;

-- Create single, clear policy for viewing profiles in same tenant
-- This includes viewing your own profile (since you're in your own tenant)
CREATE POLICY "Users can view all profiles in their tenant"
  ON user_profiles FOR SELECT
  USING (
    -- Allow if user is in the same tenant
    tenant_id = (
      SELECT tenant_id
      FROM user_profiles
      WHERE id = auth.uid()
    )
    OR
    -- Allow if user is sysadmin (bypass tenant isolation)
    EXISTS (
      SELECT 1
      FROM user_profiles
      WHERE id = auth.uid()
      AND is_sysadmin = true
    )
  );

-- Keep the update policy unchanged
-- (Users can still only update their own profile)
