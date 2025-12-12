import { createClient } from '@/shared/lib/supabase/client'
import { Role, CreateRoleInput, UpdateRoleInput } from '../types'

const supabase = createClient()

export const roleService = {
  async getRoles(): Promise<Role[]> {
    const { data, error } = await supabase
      .from('roles')
      .select('*')
      .order('created', { ascending: false })

    if (error) {
      throw error
    }

    return data || []
  },

  async createRole(input: CreateRoleInput): Promise<Role> {
    const { data, error} = await supabase
      .from('roles')
      .insert([{
        key: input.name.toLowerCase().replace(/\s+/g, '-'),
        name: input.name,
        description: input.description
      }])
      .select()
      .single()

    if (error) {
      throw error
    }

    return data
  },

  async updateRole(id: string, input: UpdateRoleInput): Promise<Role> {
    const updateData: any = {}
    if (input.name) {
      updateData.name = input.name
      updateData.key = input.name.toLowerCase().replace(/\s+/g, '-')
    }
    if (input.description) {
      updateData.description = input.description
    }

    const { data, error } = await supabase
      .from('roles')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      throw error
    }

    return data
  },

  async deleteRole(id: string): Promise<void> {
    const { error } = await supabase
      .from('roles')
      .delete()
      .eq('id', id)

    if (error) {
      throw error
    }
  }
}
