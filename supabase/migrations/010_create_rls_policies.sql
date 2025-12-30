-- ============================================================================
-- Migration: 010 - Create Row Level Security (RLS) Policies
-- Description: Configura políticas RLS para todas las tablas
-- Dependencies: 003-007 (tablas), 008 (funciones helper)
-- ============================================================================

-- ============================================================================
-- RLS POLICIES FOR: profiles
-- ============================================================================

-- SELECT: SysAdmins can view all profiles, users with roles can view non-sysadmin profiles
CREATE POLICY "Users view profiles by role"
  ON profiles FOR SELECT
  TO authenticated
  USING (
    get_current_user_is_sysadmin() = true
    OR (get_current_user_has_any_role() = true AND is_sysadmin = false)
  );

-- INSERT: SysAdmins or users with roles can insert profiles
CREATE POLICY "SysAdmins or users with roles can insert profiles"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (
    get_current_user_is_sysadmin() = true
    OR get_current_user_has_any_role() = true
  );

-- UPDATE: SysAdmins or users with roles can update profiles (but cannot change email)
CREATE POLICY "SysAdmins or users with roles can update profiles"
  ON profiles FOR UPDATE
  TO authenticated
  USING (
    get_current_user_is_sysadmin() = true
    OR get_current_user_has_any_role() = true
  )
  WITH CHECK (
    (get_current_user_is_sysadmin() = true OR get_current_user_has_any_role() = true)
    AND email = (SELECT p.email FROM profiles p WHERE p.id = profiles.id LIMIT 1)
  );

-- DELETE: Only super admin can delete profiles (except their own)
CREATE POLICY "Super admin deletes profiles except own"
  ON profiles FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE users.id = auth.uid()
      AND users.email = 'solve.seeker.dev@gmail.com'
    )
    AND email <> 'solve.seeker.dev@gmail.com'
  );

-- ============================================================================
-- RLS POLICIES FOR: companies
-- ============================================================================

-- SELECT: All authenticated users can view companies
CREATE POLICY "Authenticated users can read all companies"
  ON companies FOR SELECT
  TO authenticated
  USING (true);

-- INSERT: All authenticated users can create companies
CREATE POLICY "Authenticated users can create companies"
  ON companies FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- UPDATE: All authenticated users can update companies
CREATE POLICY "Authenticated users can update companies"
  ON companies FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- DELETE: Only super admin can delete companies
CREATE POLICY "Only sysAdmin can delete companies"
  ON companies FOR DELETE
  TO authenticated
  USING (auth.jwt() ->> 'email' = 'solve.seeker.dev@gmail.com');

-- ============================================================================
-- RLS POLICIES FOR: roles
-- ============================================================================

-- SELECT: All authenticated users can view roles
CREATE POLICY "Authenticated users can read all roles"
  ON roles FOR SELECT
  TO authenticated
  USING (true);

-- INSERT: All authenticated users can create roles
CREATE POLICY "Authenticated users can create roles"
  ON roles FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- UPDATE: All authenticated users can update roles
CREATE POLICY "Authenticated users can update roles"
  ON roles FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- DELETE: Only super admin can delete roles
CREATE POLICY "Only sysAdmin can delete roles"
  ON roles FOR DELETE
  TO authenticated
  USING (auth.jwt() ->> 'email' = 'solve.seeker.dev@gmail.com');

-- ============================================================================
-- RLS POLICIES FOR: user_companies
-- ============================================================================

-- SELECT: All authenticated users can view user-company relationships
CREATE POLICY "Authenticated users can read relationships"
  ON user_companies FOR SELECT
  TO authenticated
  USING (true);

-- INSERT: All authenticated users can create relationships
CREATE POLICY "Authenticated users can insert relationships"
  ON user_companies FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- UPDATE: All authenticated users can update relationships
CREATE POLICY "Authenticated users can update relationships"
  ON user_companies FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- DELETE: Only super admin can delete relationships
CREATE POLICY "Only super admin can delete relationships"
  ON user_companies FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid()
      AND p.email = 'solve.seeker.dev@gmail.com'
    )
  );

-- ============================================================================
-- RLS POLICIES FOR: user_roles
-- ============================================================================

-- SELECT: All authenticated users can view user-role relationships
CREATE POLICY "Authenticated users can read all user roles"
  ON user_roles FOR SELECT
  TO authenticated
  USING (true);

-- INSERT: All authenticated users can create user-role relationships
CREATE POLICY "Authenticated users can create user roles"
  ON user_roles FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- UPDATE: All authenticated users can update user-role relationships
CREATE POLICY "Authenticated users can update user roles"
  ON user_roles FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- DELETE: Only super admin can delete user-role relationships
CREATE POLICY "Only sysAdmin can delete user roles"
  ON user_roles FOR DELETE
  TO authenticated
  USING (auth.jwt() ->> 'email' = 'solve.seeker.dev@gmail.com');

-- ============================================================================
-- RLS POLICIES FOR: auditLog
-- ============================================================================

-- SELECT: Only SysAdmins can view audit logs
CREATE POLICY "SysAdmin can view all audit logs"
  ON "auditLog" FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_sysadmin = true
    )
  );

-- INSERT: All authenticated users can insert audit logs (via trigger)
CREATE POLICY "Authenticated users can insert audit logs"
  ON "auditLog" FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- UPDATE: DENY - Audit logs should NEVER be updated
CREATE POLICY "Deny all updates on audit logs"
  ON "auditLog" FOR UPDATE
  TO anon, authenticated
  USING (false)
  WITH CHECK (false);

-- DELETE: DENY - Audit logs should NEVER be deleted
CREATE POLICY "Deny all deletes on audit logs"
  ON "auditLog" FOR DELETE
  TO anon, authenticated
  USING (false);
