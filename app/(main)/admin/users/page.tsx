'use client'

import { useState, useEffect } from 'react'
import { UserList, UserForm } from '@/features/users/components'
import { CompanySelector } from '@/features/companies/components'
import { useCompanies } from '@/features/companies/hooks'
import type { UserProfile } from '@/features/users/types'

export default function UsersPage() {
  const [showForm, setShowForm] = useState(false)
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null)
  const { activeCompany } = useCompanies()

  const handleEdit = (user: UserProfile) => {
    setSelectedUser(user)
    setShowForm(true)
  }

  const handleSuccess = () => {
    setShowForm(false)
    setSelectedUser(null)
    // Reload users
    window.location.reload()
  }

  const handleCancel = () => {
    setShowForm(false)
    setSelectedUser(null)
  }

  if (!activeCompany) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white border border-gray-200 rounded-lg p-8 text-center">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Selecciona una empresa
            </h2>
            <p className="text-gray-600 mb-6">
              Debes seleccionar una empresa para ver sus usuarios
            </p>
            <CompanySelector />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Usuarios</h1>
              <p className="text-gray-600 mt-1">
                Gestiona los usuarios de {activeCompany.name}
              </p>
            </div>
          </div>

          {/* Company Selector */}
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-600">Empresa:</span>
            <CompanySelector />
          </div>
        </div>

        {/* Form Modal */}
        {showForm && selectedUser && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Editar Usuario</h2>
              <UserForm
                user={selectedUser}
                companyId={activeCompany.id}
                onSuccess={handleSuccess}
                onCancel={handleCancel}
              />
            </div>
          </div>
        )}

        {/* User List */}
        <UserList companyId={activeCompany.id} onEdit={handleEdit} />
      </div>
    </div>
  )
}
