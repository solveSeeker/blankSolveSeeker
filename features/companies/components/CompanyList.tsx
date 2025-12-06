'use client'

import { useEffect, useState } from 'react'
import { companyService } from '../services'
import type { Company } from '../types'

interface CompanyListProps {
  onSelect?: (company: Company) => void
  onEdit?: (company: Company) => void
  onDelete?: (company: Company) => void
}

export function CompanyList({ onSelect, onEdit, onDelete }: CompanyListProps) {
  const [companies, setCompanies] = useState<Company[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadCompanies()
  }, [])

  const loadCompanies = async () => {
    try {
      setIsLoading(true)
      const data = await companyService.getAll()
      setCompanies(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error loading companies')
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-500">Cargando empresas...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
        {error}
      </div>
    )
  }

  if (companies.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 mb-4">No hay empresas registradas</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {companies.map((company) => (
        <div
          key={company.id}
          className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
        >
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              {company.logo_url ? (
                <img
                  src={company.logo_url}
                  alt={company.name}
                  className="w-12 h-12 rounded-lg object-cover"
                />
              ) : (
                <div
                  className="w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold"
                  style={{ backgroundColor: company.primary_color }}
                >
                  {company.name.charAt(0)}
                </div>
              )}
              <div>
                <h3 className="font-semibold text-gray-900">{company.name}</h3>
                <p className="text-sm text-gray-500">/{company.slug}</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 mb-4">
            <div
              className="w-4 h-4 rounded-full"
              style={{ backgroundColor: company.primary_color }}
              title="Color primario"
            />
            <div
              className="w-4 h-4 rounded-full"
              style={{ backgroundColor: company.secondary_color }}
              title="Color secundario"
            />
            <div
              className="w-4 h-4 rounded-full"
              style={{ backgroundColor: company.accent_color }}
              title="Color de acento"
            />
          </div>

          <div className="flex gap-2">
            {onSelect && (
              <button
                onClick={() => onSelect(company)}
                className="flex-1 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors text-sm font-medium"
              >
                Seleccionar
              </button>
            )}
            {onEdit && (
              <button
                onClick={() => onEdit(company)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
              >
                Editar
              </button>
            )}
            {onDelete && (
              <button
                onClick={() => onDelete(company)}
                className="px-4 py-2 border border-red-300 text-red-700 rounded-lg hover:bg-red-50 transition-colors text-sm font-medium"
              >
                Eliminar
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
