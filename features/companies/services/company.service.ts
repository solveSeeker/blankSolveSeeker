import { createClient } from '@/shared/lib/supabase/client'
import type {
  Company,
  CreateCompanyInput,
  UpdateCompanyInput,
  CompanyListItem,
} from '../types'

const supabase = createClient()

export const companyService = {
  /**
   * Get all companies
   */
  async getAll(): Promise<Company[]> {
    const { data, error } = await supabase
      .from('companies')
      .select('*')
      .eq('visible', true)
      .eq('enabled', true)
      .order('name', { ascending: true })

    if (error) throw error
    return data || []
  },

  /**
   * Get companies as list items (simplified)
   */
  async getAllListItems(): Promise<CompanyListItem[]> {
    const { data, error } = await supabase
      .from('companies')
      .select('id, name, slug, logo_url, primary_color, enabled')
      .eq('visible', true)
      .eq('enabled', true)
      .order('name', { ascending: true })

    if (error) throw error
    return data || []
  },

  /**
   * Get a single company by ID
   */
  async getById(id: string): Promise<Company | null> {
    const { data, error } = await supabase
      .from('companies')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error
    return data
  },

  /**
   * Get a company by slug
   */
  async getBySlug(slug: string): Promise<Company | null> {
    const { data, error } = await supabase
      .from('companies')
      .select('*')
      .eq('slug', slug)
      .eq('visible', true)
      .eq('enabled', true)
      .single()

    if (error) throw error
    return data
  },

  /**
   * Create a new company
   */
  async create(input: CreateCompanyInput): Promise<Company> {
    const { data, error } = await supabase
      .from('companies')
      .insert({
        name: input.name,
        slug: input.slug,
        key: input.key,
        logo_url: input.logo_url || null,
        primary_color: input.primary_color || '#001f3f',
        secondary_color: input.secondary_color || '#0074D9',
        accent_color: input.accent_color || '#FF4136',
        settings: input.settings || {},
      })
      .select()
      .single()

    if (error) throw error
    return data
  },

  /**
   * Update an existing company
   */
  async update(input: UpdateCompanyInput): Promise<Company> {
    const { id, ...updates } = input

    const { data, error } = await supabase
      .from('companies')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  },

  /**
   * Soft delete a company (set visible/enabled to false)
   */
  async softDelete(id: string): Promise<void> {
    const { error } = await supabase
      .from('companies')
      .update({ visible: false, enabled: false })
      .eq('id', id)

    if (error) throw error
  },

  /**
   * Hard delete a company (permanently remove)
   */
  async hardDelete(id: string): Promise<void> {
    const { error } = await supabase
      .from('companies')
      .delete()
      .eq('id', id)

    if (error) throw error
  },

  /**
   * Check if a slug is available
   */
  async isSlugAvailable(slug: string, excludeId?: string): Promise<boolean> {
    let query = supabase
      .from('companies')
      .select('id')
      .eq('slug', slug)

    if (excludeId) {
      query = query.neq('id', excludeId)
    }

    const { data, error } = await query

    if (error) throw error
    return !data || data.length === 0
  },

  /**
   * Get companies for a specific user
   */
  async getByUserId(userId: string): Promise<Company[]> {
    const { data, error } = await supabase
      .from('user_companies')
      .select(`
        company:companies (*)
      `)
      .eq('profile_id', userId)
      .eq('is_active', true)
      .eq('visible', true)
      .eq('enabled', true)

    if (error) throw error

    // Extract companies from the join result
    return data?.map((item: any) => item.company).filter(Boolean) || []
  },
}
