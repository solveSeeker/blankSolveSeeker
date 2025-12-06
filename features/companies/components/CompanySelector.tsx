'use client'

import { useState, useEffect, useRef } from 'react'
import { useCompanies } from '../hooks'
import type { Company } from '../types'

interface CompanySelectorProps {
  onSelect?: (company: Company) => void
}

export function CompanySelector({ onSelect }: CompanySelectorProps) {
  const { companies, activeCompany, setActiveCompany, isLoading } = useCompanies()
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSelect = (company: Company) => {
    setActiveCompany(company)
    onSelect?.(company)
    setIsOpen(false)
  }

  if (isLoading) {
    return (
      <div className="px-4 py-2 bg-gray-100 rounded-lg text-gray-500 text-sm">
        Cargando...
      </div>
    )
  }

  if (companies.length === 0) {
    return (
      <div className="px-4 py-2 bg-gray-100 rounded-lg text-gray-500 text-sm">
        No hay empresas disponibles
      </div>
    )
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors min-w-[200px]"
      >
        {activeCompany ? (
          <>
            {activeCompany.logo_url ? (
              <img
                src={activeCompany.logo_url}
                alt={activeCompany.name}
                className="w-6 h-6 rounded object-cover"
              />
            ) : (
              <div
                className="w-6 h-6 rounded flex items-center justify-center text-white text-xs font-bold"
                style={{ backgroundColor: activeCompany.primary_color }}
              >
                {activeCompany.name.charAt(0)}
              </div>
            )}
            <span className="flex-1 text-left font-medium text-gray-900">
              {activeCompany.name}
            </span>
          </>
        ) : (
          <span className="flex-1 text-left text-gray-500">Seleccionar empresa</span>
        )}
        <svg
          className={`w-4 h-4 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-[300px] overflow-y-auto">
          {companies.map((company) => (
            <button
              key={company.id}
              onClick={() => handleSelect(company)}
              className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors ${
                activeCompany?.id === company.id ? 'bg-gray-100' : ''
              }`}
            >
              {company.logo_url ? (
                <img
                  src={company.logo_url}
                  alt={company.name}
                  className="w-8 h-8 rounded object-cover"
                />
              ) : (
                <div
                  className="w-8 h-8 rounded flex items-center justify-center text-white text-sm font-bold"
                  style={{ backgroundColor: company.primary_color }}
                >
                  {company.name.charAt(0)}
                </div>
              )}
              <div className="flex-1 text-left">
                <div className="font-medium text-gray-900">{company.name}</div>
                <div className="text-xs text-gray-500">/{company.slug}</div>
              </div>
              {activeCompany?.id === company.id && (
                <svg
                  className="w-5 h-5 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
