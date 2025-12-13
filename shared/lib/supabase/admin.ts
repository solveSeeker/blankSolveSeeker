import { createClient } from '@supabase/supabase-js'

/**
 * Creates a Supabase client with service role key for admin operations
 *
 * SECURITY WARNING:
 * - This client bypasses Row Level Security (RLS) policies
 * - ONLY use in server-side code (API routes, server actions)
 * - NEVER import in client-side components
 * - Has full access to auth.admin API for user management
 */
export function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL environment variable')
  }

  if (!serviceRoleKey) {
    throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY environment variable')
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })
}
