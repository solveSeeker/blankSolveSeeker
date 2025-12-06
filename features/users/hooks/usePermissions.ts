import { useMemo } from 'react'
import { userCompanyService } from '@/features/companies/services'
import { ROLE_HIERARCHY, type CompanyRole } from '@/features/companies/types'
import {
  ROLE_PERMISSIONS,
  type PermissionAction,
  type PermissionResource,
} from '../types'

interface UsePermissionsProps {
  userId: string
  companyId: string
  userRole: CompanyRole
}

export function usePermissions({ userId, companyId, userRole }: UsePermissionsProps) {
  const permissions = useMemo(() => {
    return ROLE_PERMISSIONS[userRole] || {}
  }, [userRole])

  /**
   * Check if user can perform an action on a resource
   */
  const can = (action: PermissionAction, resource: PermissionResource): boolean => {
    const resourcePermissions = permissions[resource]
    if (!resourcePermissions) return false
    return resourcePermissions.includes(action)
  }

  /**
   * Check if user cannot perform an action on a resource
   */
  const cannot = (action: PermissionAction, resource: PermissionResource): boolean => {
    return !can(action, resource)
  }

  /**
   * Check if user has any of the specified roles
   */
  const hasRole = (...roles: CompanyRole[]): boolean => {
    return roles.includes(userRole)
  }

  /**
   * Check if user has a role higher than or equal to the specified role
   */
  const hasRoleOrHigher = (role: CompanyRole): boolean => {
    return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[role]
  }

  /**
   * Check if user is owner
   */
  const isOwner = useMemo(() => userRole === 'owner', [userRole])

  /**
   * Check if user is admin or owner
   */
  const isAdmin = useMemo(() => hasRoleOrHigher('admin'), [userRole])

  /**
   * Check if user is manager or higher
   */
  const isManager = useMemo(() => hasRoleOrHigher('manager'), [userRole])

  /**
   * Get all permissions for current role
   */
  const getAllPermissions = () => permissions

  return {
    can,
    cannot,
    hasRole,
    hasRoleOrHigher,
    isOwner,
    isAdmin,
    isManager,
    role: userRole,
    permissions,
    getAllPermissions,
  }
}
