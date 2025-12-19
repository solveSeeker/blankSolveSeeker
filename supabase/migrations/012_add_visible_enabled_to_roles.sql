-- Add visible and enabled columns to roles table
ALTER TABLE roles
ADD COLUMN IF NOT EXISTS visible BOOLEAN DEFAULT true NOT NULL,
ADD COLUMN IF NOT EXISTS enabled BOOLEAN DEFAULT true NOT NULL,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Create trigger to update updated_at
CREATE OR REPLACE FUNCTION update_roles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_roles_updated_at ON roles;
CREATE TRIGGER set_roles_updated_at
  BEFORE UPDATE ON roles
  FOR EACH ROW
  EXECUTE FUNCTION update_roles_updated_at();

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_roles_visible ON roles(visible);
CREATE INDEX IF NOT EXISTS idx_roles_enabled ON roles(enabled);
