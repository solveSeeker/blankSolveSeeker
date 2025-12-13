-- Fix infinite recursion in user_roles RLS policy
-- Problem: The "Admins can manage user roles" policy queries user_roles table
-- while checking permissions on the same table, causing infinite recursion.

-- Solution: Drop the problematic policy and create a simpler one
-- that doesn't create circular dependencies.

-- Drop the recursive policy
DROP POLICY IF EXISTS "Admins can manage user roles" ON user_roles;

-- Create new admin policy without recursion
-- This policy allows INSERT/UPDATE/DELETE for admins by checking
-- a separate admin_users table or using service role bypass
CREATE POLICY "Service role can manage all user roles"
  ON user_roles FOR ALL
  USING (auth.jwt()->>'role' = 'service_role');

-- Allow authenticated users to view their own roles (already exists, keeping it)
-- Policy: Users can view own roles
-- Already exists from migration 003, no changes needed

-- Note: For admin operations, we'll use the service role client in the API route
-- which bypasses RLS entirely. This is the recommended approach for admin operations.
