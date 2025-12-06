'use client'

import { useState } from 'react'
import { CompanyList, CompanyForm, CompanySelector } from '@/features/companies/components'
import type { Company } from '@/features/companies/types'

export default function CompaniesPage() {
  const [showForm, setShowForm] = useState(false)
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null)

  const handleEdit = (company: Company) => {
    setSelectedCompany(company)
    setShowForm(true)
  }

  const handleSuccess = () => {
    setShowForm(false)
    setSelectedCompany(null)
    // Reload companies
    window.location.reload()
  }

  const handleCancel = () => {
    setShowForm(false)
    setSelectedCompany(null)
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Empresas</h1>
              <p className="text-gray-600 mt-1">Gestiona las empresas del sistema</p>
            </div>
            <button
              onClick={() => setShowForm(true)}
              className="px-6 py-3 bg-black text-white rounded-full hover:bg-gray-900 font-medium"
            >
              + Nueva Empresa
            </button>
          </div>

          {/* Company Selector */}
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-600">Empresa activa:</span>
            <CompanySelector />
          </div>
        </div>

        {/* Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                {selectedCompany ? 'Editar Empresa' : 'Nueva Empresa'}
              </h2>
              <CompanyForm
                company={selectedCompany || undefined}
                onSuccess={handleSuccess}
                onCancel={handleCancel}
              />
            </div>
          </div>
        )}

        {/* Company List */}
        <CompanyList onEdit={handleEdit} />
      </div>
    </div>
  )
}
