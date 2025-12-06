'use client'

import { ReactNode } from 'react'
import { usePermissions } from '@/features/users/hooks'
import type { CompanyRole } from '@/features/companies/types'

interface RoleGuardProps {
  children: ReactNode
  userId: string
  companyId: string
  userRole: CompanyRole
  allowedRoles: CompanyRole[]
  fallback?: ReactNode
}

export function RoleGuard({
  children,
  userId,
  companyId,
  userRole,
  allowedRoles,
  fallback = null,
}: RoleGuardProps) {
  const permissions = usePermissions({ userId, companyId, userRole })

  if (!permissions.hasRole(...allowedRoles)) {
    return <>{fallback}</>
  }

  return <>{children}</>
}
