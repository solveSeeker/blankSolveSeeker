-- Migration: RLS Policies for Companies Table
-- Purpose: Allow authenticated users to manage companies

-- Enable RLS on companies table (if not already enabled)
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any (to avoid conflicts)
DROP POLICY IF EXISTS "Users can view all companies" ON companies;
DROP POLICY IF EXISTS "Authenticated users can insert companies" ON companies;
DROP POLICY IF EXISTS "Authenticated users can update companies" ON companies;
DROP POLICY IF EXISTS "Authenticated users can delete companies" ON companies;

-- Policy 1: SELECT - All authenticated users can view all companies
CREATE POLICY "Users can view all companies"
  ON companies
  FOR SELECT
  TO authenticated
  USING (true);

-- Policy 2: INSERT - Authenticated users can insert companies
CREATE POLICY "Authenticated users can insert companies"
  ON companies
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Policy 3: UPDATE - Authenticated users can update companies
CREATE POLICY "Authenticated users can update companies"
  ON companies
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Policy 4: DELETE - Authenticated users can delete companies
CREATE POLICY "Authenticated users can delete companies"
  ON companies
  FOR DELETE
  TO authenticated
  USING (true);
