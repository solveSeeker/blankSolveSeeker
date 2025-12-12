export interface Role {
  id: string
  name: string
  description: string
  created_at: string
  // Legacy fields for compatibility
  created?: string
  key?: string
  hashUpdate?: string
  visible?: boolean
  enabled?: boolean
  updated?: string | null
  creator?: string | null
  updater?: string | null
  permissions?: Record<string, unknown>
  dataVersion?: number
}

export interface CreateRoleInput {
  name: string
  description: string
}

export interface UpdateRoleInput {
  name?: string
  description?: string
}
