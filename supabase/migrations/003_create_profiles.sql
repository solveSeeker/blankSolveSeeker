-- ============================================================================
-- Migration: 003 - Create Profiles Table
-- Description: Crea tabla de perfiles de usuario
-- Dependencies: 001_enable_extensions_create_ents.sql
-- ============================================================================

-- ============================================================================
-- Table: profiles (User profiles)
-- ============================================================================
-- Purpose: Almacena información de perfil de usuarios del sistema
-- Inheritance: NO hereda de ents (tabla independiente con estructura propia)
-- Note: Esta tabla está vinculada a auth.users para autenticación
-- ============================================================================

CREATE TABLE profiles (
  -- Primary identifier (references auth.users)
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,

  -- User information
  email TEXT NOT NULL,
  "fullName" TEXT,
  "avatarURL" TEXT,

  -- Status flags
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  is_sysadmin BOOLEAN NOT NULL DEFAULT FALSE,

  -- Timestamps
  created TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated TIMESTAMPTZ,

  -- Audit tracking
  "hashUpdate" UUID NOT NULL DEFAULT gen_random_uuid(),
  creator UUID,
  updater UUID
);

-- Add comments for documentation
COMMENT ON TABLE profiles IS 'User profiles with authentication and authorization information';
COMMENT ON COLUMN profiles.id IS 'User ID, references auth.users.id';
COMMENT ON COLUMN profiles.email IS 'User email address (denormalized from auth.users for easier queries)';
COMMENT ON COLUMN profiles."fullName" IS 'Full name of the user';
COMMENT ON COLUMN profiles."avatarURL" IS 'URL to user avatar image';
COMMENT ON COLUMN profiles.is_active IS 'Whether the user account is currently active';
COMMENT ON COLUMN profiles.is_sysadmin IS 'Whether the user has system administrator privileges';
COMMENT ON COLUMN profiles.created IS 'Timestamp when the profile was created';
COMMENT ON COLUMN profiles.updated IS 'Timestamp when the profile was last updated';
COMMENT ON COLUMN profiles."hashUpdate" IS 'Hash for tracking updates';
COMMENT ON COLUMN profiles.creator IS 'User ID who created this profile';
COMMENT ON COLUMN profiles.updater IS 'User ID who last updated this profile';

-- Create indexes for common queries
CREATE INDEX idx_profiles_email ON profiles(email);
CREATE INDEX idx_profiles_is_active ON profiles(is_active) WHERE is_active = true;
CREATE INDEX idx_profiles_is_sysadmin ON profiles(is_sysadmin) WHERE is_sysadmin = true;
CREATE INDEX idx_profiles_created ON profiles(created DESC);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- RLS policies will be added in migration 010
