import { createClient } from '@/shared/lib/supabase/client'
import { Company } from '../types/company.types'

const supabase = createClient()

export const companyService = {
  async updateVisibility(id: string, visible: boolean): Promise<Company> {
    const { data, error } = await supabase
      .from('companies')
      .update({ visible })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      throw error
    }

    return data
  },

  async updateEnabled(id: string, enabled: boolean): Promise<Company> {
    const { data, error } = await supabase
      .from('companies')
      .update({ enabled })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      throw error
    }

    return data
  },

  async hideCompany(id: string): Promise<Company> {
    return this.updateVisibility(id, false)
  },

  async deleteCompany(id: string): Promise<void> {
    const { error } = await supabase
      .from('companies')
      .delete()
      .eq('id', id)

    if (error) {
      throw error
    }
  }
}
