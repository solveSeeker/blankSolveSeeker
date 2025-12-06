// Base Company type matching the database schema
export interface Company {
  // Inherited from sysEnts
  id: string
  created: string
  hashUpdate: string
  visible: boolean
  enabled: boolean
  updated: string | null
  creator: string | null
  updater: string | null
  key: string

  // Company specific fields
  name: string
  slug: string
  logo_url: string | null
  primary_color: string
  secondary_color: string
  accent_color: string
  settings: CompanySettings
}

// Company settings structure (stored as JSONB)
export interface CompanySettings {
  features?: {
    enableOrders?: boolean
    enableProducts?: boolean
    enableCustomers?: boolean
    enableReports?: boolean
    enableBranding?: boolean
  }
  limits?: {
    maxUsers?: number
    maxOrders?: number
    maxProducts?: number
  }
  notifications?: {
    email?: boolean
    sms?: boolean
    push?: boolean
  }
  branding?: {
    companyName?: string
    tagline?: string
    website?: string
    phone?: string
    address?: string
  }
  // Extensible for future settings
  [key: string]: unknown
}

// Input type for creating a new company
export interface CreateCompanyInput {
  name: string
  slug: string
  key: string
  logo_url?: string
  primary_color?: string
  secondary_color?: string
  accent_color?: string
  settings?: CompanySettings
}

// Input type for updating a company
export interface UpdateCompanyInput {
  id: string
  name?: string
  slug?: string
  logo_url?: string
  primary_color?: string
  secondary_color?: string
  accent_color?: string
  settings?: CompanySettings
  visible?: boolean
  enabled?: boolean
}

// Simplified company data for selectors/lists
export interface CompanyListItem {
  id: string
  name: string
  slug: string
  logo_url: string | null
  primary_color: string
  enabled: boolean
}
