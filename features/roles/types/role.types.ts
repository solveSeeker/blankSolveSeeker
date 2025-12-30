export interface Role {
  id: string
  name: string
  description: string
  created: string
  hrchy?: number | null
  key?: string
  hashUpdate?: string
  visible: boolean
  enabled: boolean
  updated?: string | null
  creator?: string | null
  updater?: string | null
  permissions?: Record<string, unknown>
}

export interface CreateRoleInput {
  name: string
  description: string
  hrchy?: number | null
}

export interface UpdateRoleInput {
  name?: string
  description?: string
  hrchy?: number | null
}

export interface UpdateRoleVisibilityInput {
  visible: boolean
}

export interface UpdateRoleEnabledInput {
  enabled: boolean
}
