'use client'

import { useState, useEffect } from 'react'
import { companyService } from '../services'
import type { Company, CreateCompanyInput, UpdateCompanyInput } from '../types'

interface CompanyFormProps {
  company?: Company
  onSuccess?: (company: Company) => void
  onCancel?: () => void
}

export function CompanyForm({ company, onSuccess, onCancel }: CompanyFormProps) {
  const [formData, setFormData] = useState({
    name: company?.name || '',
    slug: company?.slug || '',
    key: company?.key || '',
    logo_url: company?.logo_url || '',
    primary_color: company?.primary_color || '#001f3f',
    secondary_color: company?.secondary_color || '#0074D9',
    accent_color: company?.accent_color || '#FF4136',
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
  }

  const generateKey = (name: string) => {
    return `company_${Date.now()}_${name.toLowerCase().replace(/\s+/g, '_')}`
  }

  const handleNameChange = (name: string) => {
    setFormData((prev) => ({
      ...prev,
      name,
      slug: prev.slug || generateSlug(name),
      key: prev.key || generateKey(name),
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      if (company) {
        // Update existing company
        const input: UpdateCompanyInput = {
          id: company.id,
          ...formData,
        }
        const updated = await companyService.update(input)
        onSuccess?.(updated)
      } else {
        // Create new company
        const input: CreateCompanyInput = formData
        const created = await companyService.create(input)
        onSuccess?.(created)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error saving company')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-900 mb-2">
          Nombre de la empresa *
        </label>
        <input
          id="name"
          type="text"
          value={formData.name}
          onChange={(e) => handleNameChange(e.target.value)}
          required
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400"
          placeholder="Mi Empresa"
        />
      </div>

      <div>
        <label htmlFor="slug" className="block text-sm font-medium text-gray-900 mb-2">
          Slug (URL) *
        </label>
        <input
          id="slug"
          type="text"
          value={formData.slug}
          onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
          required
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400"
          placeholder="mi-empresa"
        />
        <p className="text-sm text-gray-500 mt-1">
          URL amigable para la empresa (ej: mi-empresa)
        </p>
      </div>

      <div>
        <label htmlFor="key" className="block text-sm font-medium text-gray-900 mb-2">
          Key (Identificador del sistema) *
        </label>
        <input
          id="key"
          type="text"
          value={formData.key}
          onChange={(e) => setFormData({ ...formData, key: e.target.value })}
          required
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400"
          placeholder="company_mi_empresa"
        />
      </div>

      <div>
        <label htmlFor="logo_url" className="block text-sm font-medium text-gray-900 mb-2">
          URL del logo
        </label>
        <input
          id="logo_url"
          type="url"
          value={formData.logo_url}
          onChange={(e) => setFormData({ ...formData, logo_url: e.target.value })}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400"
          placeholder="https://example.com/logo.png"
        />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <label htmlFor="primary_color" className="block text-sm font-medium text-gray-900 mb-2">
            Color primario
          </label>
          <div className="flex items-center gap-2">
            <input
              id="primary_color"
              type="color"
              value={formData.primary_color}
              onChange={(e) => setFormData({ ...formData, primary_color: e.target.value })}
              className="w-12 h-12 rounded-lg cursor-pointer"
            />
            <input
              type="text"
              value={formData.primary_color}
              onChange={(e) => setFormData({ ...formData, primary_color: e.target.value })}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
              placeholder="#001f3f"
            />
          </div>
        </div>

        <div>
          <label htmlFor="secondary_color" className="block text-sm font-medium text-gray-900 mb-2">
            Color secundario
          </label>
          <div className="flex items-center gap-2">
            <input
              id="secondary_color"
              type="color"
              value={formData.secondary_color}
              onChange={(e) => setFormData({ ...formData, secondary_color: e.target.value })}
              className="w-12 h-12 rounded-lg cursor-pointer"
            />
            <input
              type="text"
              value={formData.secondary_color}
              onChange={(e) => setFormData({ ...formData, secondary_color: e.target.value })}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
              placeholder="#0074D9"
            />
          </div>
        </div>

        <div>
          <label htmlFor="accent_color" className="block text-sm font-medium text-gray-900 mb-2">
            Color de acento
          </label>
          <div className="flex items-center gap-2">
            <input
              id="accent_color"
              type="color"
              value={formData.accent_color}
              onChange={(e) => setFormData({ ...formData, accent_color: e.target.value })}
              className="w-12 h-12 rounded-lg cursor-pointer"
            />
            <input
              type="text"
              value={formData.accent_color}
              onChange={(e) => setFormData({ ...formData, accent_color: e.target.value })}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
              placeholder="#FF4136"
            />
          </div>
        </div>
      </div>

      <div className="flex gap-3 pt-4">
        <button
          type="submit"
          disabled={isLoading}
          className="flex-1 px-6 py-3 bg-black text-white rounded-full hover:bg-gray-900 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
        >
          {isLoading ? 'Guardando...' : company ? 'Actualizar empresa' : 'Crear empresa'}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-full hover:bg-gray-50 font-medium"
          >
            Cancelar
          </button>
        )}
      </div>
    </form>
  )
}
