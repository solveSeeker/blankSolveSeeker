'use client'

import { ReactNode } from 'react'
import { usePermissions } from '@/features/users/hooks'
import type { CompanyRole } from '@/features/companies/types'
import type { PermissionAction, PermissionResource } from '@/features/users/types'

interface PermissionGuardProps {
  children: ReactNode
  userId: string
  companyId: string
  userRole: CompanyRole
  action?: PermissionAction
  resource?: PermissionResource
  requiredRole?: CompanyRole
  fallback?: ReactNode
}

export function PermissionGuard({
  children,
  userId,
  companyId,
  userRole,
  action,
  resource,
  requiredRole,
  fallback = null,
}: PermissionGuardProps) {
  const permissions = usePermissions({ userId, companyId, userRole })

  // Check if user has required role
  if (requiredRole && !permissions.hasRoleOrHigher(requiredRole)) {
    return <>{fallback}</>
  }

  // Check if user can perform action on resource
  if (action && resource && permissions.cannot(action, resource)) {
    return <>{fallback}</>
  }

  return <>{children}</>
}
