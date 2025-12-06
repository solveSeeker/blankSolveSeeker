import { createClient } from '@/shared/lib/supabase/client'
import type { Profile, CreateProfileInput, UpdateProfileInput, UserProfile } from '../types'

const supabase = createClient()

export const userService = {
  /**
   * Get all profiles for a company
   */
  async getByCompanyId(companyId: string): Promise<UserProfile[]> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*, user:auth.users(email, user_metadata)')
      .eq('company_id', companyId)
      .eq('is_active', true)

    if (error) throw error

    // Transform the data to include user email and metadata
    return (
      data?.map((profile: any) => ({
        ...profile,
        email: profile.user?.email,
        user_metadata: profile.user?.user_metadata,
      })) || []
    )
  },

  /**
   * Get a single profile by user ID and company ID
   */
  async getById(userId: string, companyId: string): Promise<Profile | null> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .eq('company_id', companyId)
      .single()

    if (error) throw error
    return data
  },

  /**
   * Create a new profile
   */
  async create(input: CreateProfileInput): Promise<Profile> {
    const { data, error } = await supabase
      .from('profiles')
      .insert({
        id: input.id,
        company_id: input.company_id,
        role: input.role || 'user',
        is_active: input.is_active ?? true,
      })
      .select()
      .single()

    if (error) throw error
    return data
  },

  /**
   * Update a profile
   */
  async update(input: UpdateProfileInput): Promise<Profile> {
    const { id, ...updates } = input

    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  },

  /**
   * Deactivate a profile (soft delete)
   */
  async deactivate(userId: string, companyId: string): Promise<void> {
    const { error } = await supabase
      .from('profiles')
      .update({ is_active: false })
      .eq('id', userId)
      .eq('company_id', companyId)

    if (error) throw error
  },

  /**
   * Delete a profile (hard delete)
   */
  async delete(userId: string, companyId: string): Promise<void> {
    const { error } = await supabase
      .from('profiles')
      .delete()
      .eq('id', userId)
      .eq('company_id', companyId)

    if (error) throw error
  },

  /**
   * Get current user's profile
   */
  async getCurrentUserProfile(companyId: string): Promise<Profile | null> {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return null

    return this.getById(user.id, companyId)
  },
}
