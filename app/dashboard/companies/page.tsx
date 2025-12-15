'use client'

import { CompaniesTable } from '@/features/companies/components'

export default function CompaniesPage() {
  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-3xl font-semibold text-gray-900">Empresas</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Gestiona las empresas del sistema multi-tenant
        </p>
      </div>
      <CompaniesTable />
    </div>
  )
}
