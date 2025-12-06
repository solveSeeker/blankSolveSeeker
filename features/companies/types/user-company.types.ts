// Company role enum matching database enum
export type CompanyRole = 'owner' | 'admin' | 'manager' | 'user' | 'viewer'

// Role hierarchy for permission checks
export const ROLE_HIERARCHY: Record<CompanyRole, number> = {
  owner: 5,
  admin: 4,
  manager: 3,
  user: 2,
  viewer: 1,
}

// UserCompany type matching the database schema
export interface UserCompany {
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

  // UserCompany specific fields
  profile_id: string
  company_id: string
  role: CompanyRole
  is_active: boolean
}

// Input type for creating user-company relationship
export interface CreateUserCompanyInput {
  profile_id: string
  company_id: string
  role: CompanyRole
  key: string
  is_active?: boolean
}

// Input type for updating user-company relationship
export interface UpdateUserCompanyInput {
  id: string
  role?: CompanyRole
  is_active?: boolean
  visible?: boolean
  enabled?: boolean
}

// Extended user-company with related data
export interface UserCompanyWithDetails extends UserCompany {
  company?: {
    id: string
    name: string
    slug: string
    logo_url: string | null
  }
  profile?: {
    id: string
    // Add more profile fields as needed
  }
}

// Helper type for permission checks
export interface UserPermissions {
  companyId: string
  role: CompanyRole
  canCreate: boolean
  canRead: boolean
  canUpdate: boolean
  canDelete: boolean
  canManageUsers: boolean
  canManageSettings: boolean
}
