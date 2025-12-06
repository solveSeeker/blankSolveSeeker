import { createClient } from '@/shared/lib/supabase/client'
import type {
  UserCompany,
  CreateUserCompanyInput,
  UpdateUserCompanyInput,
  UserCompanyWithDetails,
  CompanyRole,
} from '../types'

const supabase = createClient()

export const userCompanyService = {
  /**
   * Get all user-company relationships for a user
   */
  async getByUserId(userId: string): Promise<UserCompanyWithDetails[]> {
    const { data, error } = await supabase
      .from('user_companies')
      .select(`
        *,
        company:companies (
          id,
          name,
          slug,
          logo_url
        )
      `)
      .eq('profile_id', userId)
      .eq('is_active', true)
      .eq('visible', true)
      .eq('enabled', true)

    if (error) throw error
    return data || []
  },

  /**
   * Get all users for a company
   */
  async getByCompanyId(companyId: string): Promise<UserCompanyWithDetails[]> {
    const { data, error } = await supabase
      .from('user_companies')
      .select(`
        *,
        profile:profiles (
          id
        )
      `)
      .eq('company_id', companyId)
      .eq('is_active', true)
      .eq('visible', true)
      .eq('enabled', true)

    if (error) throw error
    return data || []
  },

  /**
   * Get user's role in a specific company
   */
  async getUserRole(userId: string, companyId: string): Promise<CompanyRole | null> {
    const { data, error } = await supabase
      .rpc('get_user_company_role', {
        p_profile_id: userId,
        p_company_id: companyId,
      })

    if (error) throw error
    return data
  },

  /**
   * Create a new user-company relationship
   */
  async create(input: CreateUserCompanyInput): Promise<UserCompany> {
    const { data, error } = await supabase
      .from('user_companies')
      .insert({
        profile_id: input.profile_id,
        company_id: input.company_id,
        role: input.role,
        key: input.key,
        is_active: input.is_active ?? true,
      })
      .select()
      .single()

    if (error) throw error
    return data
  },

  /**
   * Update user-company relationship
   */
  async update(input: UpdateUserCompanyInput): Promise<UserCompany> {
    const { id, ...updates } = input

    const { data, error } = await supabase
      .from('user_companies')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  },

  /**
   * Remove user from company (soft delete)
   */
  async removeUser(id: string): Promise<void> {
    const { error } = await supabase
      .from('user_companies')
      .update({ is_active: false, visible: false })
      .eq('id', id)

    if (error) throw error
  },

  /**
   * Hard delete user-company relationship
   */
  async hardDelete(id: string): Promise<void> {
    const { error } = await supabase
      .from('user_companies')
      .delete()
      .eq('id', id)

    if (error) throw error
  },

  /**
   * Check if user has access to company
   */
  async hasAccess(userId: string, companyId: string): Promise<boolean> {
    const { data, error } = await supabase
      .from('user_companies')
      .select('id')
      .eq('profile_id', userId)
      .eq('company_id', companyId)
      .eq('is_active', true)
      .eq('visible', true)
      .eq('enabled', true)
      .single()

    if (error) return false
    return !!data
  },
}
