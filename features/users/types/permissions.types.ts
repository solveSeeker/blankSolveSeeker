import type { CompanyRole } from '@/features/companies/types'

// Permission actions
export type PermissionAction =
  | 'create'
  | 'read'
  | 'update'
  | 'delete'
  | 'manage_users'
  | 'manage_settings'
  | 'manage_orders'
  | 'manage_products'
  | 'view_reports'

// Permission resource types
export type PermissionResource =
  | 'company'
  | 'user'
  | 'order'
  | 'product'
  | 'customer'
  | 'settings'
  | 'report'

// Permission check result
export interface Permission {
  resource: PermissionResource
  action: PermissionAction
  allowed: boolean
}

// User permissions context
export interface UserPermissionsContext {
  userId: string
  companyId: string
  role: CompanyRole
  permissions: Permission[]
}

// Permission matrix by role
export const ROLE_PERMISSIONS: Record<CompanyRole, Partial<Record<PermissionResource, PermissionAction[]>>> = {
  owner: {
    company: ['create', 'read', 'update', 'delete', 'manage_settings'],
    user: ['create', 'read', 'update', 'delete', 'manage_users'],
    order: ['create', 'read', 'update', 'delete', 'manage_orders'],
    product: ['create', 'read', 'update', 'delete', 'manage_products'],
    customer: ['create', 'read', 'update', 'delete'],
    settings: ['read', 'update', 'manage_settings'],
    report: ['read', 'view_reports'],
  },
  admin: {
    company: ['read', 'update', 'manage_settings'],
    user: ['create', 'read', 'update', 'manage_users'],
    order: ['create', 'read', 'update', 'delete', 'manage_orders'],
    product: ['create', 'read', 'update', 'delete', 'manage_products'],
    customer: ['create', 'read', 'update', 'delete'],
    settings: ['read', 'update'],
    report: ['read', 'view_reports'],
  },
  manager: {
    user: ['read'],
    order: ['create', 'read', 'update', 'manage_orders'],
    product: ['create', 'read', 'update', 'manage_products'],
    customer: ['create', 'read', 'update'],
    report: ['read', 'view_reports'],
  },
  user: {
    order: ['create', 'read'],
    product: ['read'],
    customer: ['read'],
  },
  viewer: {
    order: ['read'],
    product: ['read'],
    customer: ['read'],
    report: ['read'],
  },
}
