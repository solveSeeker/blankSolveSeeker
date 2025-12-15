export interface Company {
  id: string
  name: string
  slug: string
  key: string | null
  logo_url: string | null
  primary_color: string
  secondary_color: string
  accent_color: string
  settings: Record<string, any>
  visible: boolean
  enabled: boolean
  created: string
  updated: string | null
}

export interface CreateCompanyInput {
  name: string
  slug: string
  logo_url?: string
  primary_color?: string
  secondary_color?: string
  accent_color?: string
  settings?: Record<string, any>
}

export interface UpdateCompanyInput {
  name?: string
  slug?: string
  logo_url?: string
  primary_color?: string
  secondary_color?: string
  accent_color?: string
  settings?: Record<string, any>
  visible?: boolean
  enabled?: boolean
}
