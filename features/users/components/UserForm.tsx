'use client'

import { useState } from 'react'
import { userService } from '../services'
import type { UpdateProfileInput, UserProfile } from '../types'
import type { CompanyRole } from '@/features/companies/types'

interface UserFormProps {
  user: UserProfile
  companyId: string
  onSuccess?: (user: UserProfile) => void
  onCancel?: () => void
}

const ROLES: CompanyRole[] = ['owner', 'admin', 'manager', 'user', 'viewer']

export function UserForm({ user, companyId, onSuccess, onCancel }: UserFormProps) {
  const [formData, setFormData] = useState({
    role: user.role,
    is_active: user.is_active,
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const input: UpdateProfileInput = {
        id: user.id,
        role: formData.role,
        is_active: formData.is_active,
      }

      await userService.update(input)

      // Reload user data
      const updated = await userService.getById(user.id, companyId)
      if (updated) {
        onSuccess?.({ ...user, ...updated })
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error updating user')
    } finally {
      setIsLoading(false)
    }
  }

  const getRoleDescription = (role: string): string => {
    const descriptions: Record<string, string> = {
      owner: 'Acceso total, puede gestionar todo',
      admin: 'Puede gestionar usuarios, productos y pedidos',
      manager: 'Puede gestionar pedidos y productos',
      user: 'Puede crear pedidos',
      viewer: 'Solo puede ver información',
    }
    return descriptions[role] || ''
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      <div className="bg-gray-50 p-4 rounded-lg">
        <div className="flex items-center gap-3 mb-2">
          {user.user_metadata?.avatar_url ? (
            <img
              src={user.user_metadata.avatar_url}
              alt={user.user_metadata.full_name || user.email || ''}
              className="w-12 h-12 rounded-full object-cover"
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 font-medium text-lg">
              {(user.user_metadata?.full_name || user.email || 'U').charAt(0).toUpperCase()}
            </div>
          )}
          <div>
            <div className="font-medium text-gray-900">
              {user.user_metadata?.full_name || 'Sin nombre'}
            </div>
            <div className="text-sm text-gray-600">{user.email}</div>
          </div>
        </div>
      </div>

      <div>
        <label htmlFor="role" className="block text-sm font-medium text-gray-900 mb-2">
          Rol del usuario *
        </label>
        <select
          id="role"
          value={formData.role}
          onChange={(e) => setFormData({ ...formData, role: e.target.value })}
          required
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400"
        >
          {ROLES.map((role) => (
            <option key={role} value={role}>
              {role.charAt(0).toUpperCase() + role.slice(1)}
            </option>
          ))}
        </select>
        <p className="text-sm text-gray-500 mt-1">{getRoleDescription(formData.role)}</p>
      </div>

      <div className="flex items-center gap-3">
        <input
          id="is_active"
          type="checkbox"
          checked={formData.is_active}
          onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
          className="w-4 h-4 text-black border-gray-300 rounded focus:ring-gray-400"
        />
        <label htmlFor="is_active" className="text-sm font-medium text-gray-900">
          Usuario activo
        </label>
      </div>

      <div className="flex gap-3 pt-4">
        <button
          type="submit"
          disabled={isLoading}
          className="flex-1 px-6 py-3 bg-black text-white rounded-full hover:bg-gray-900 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
        >
          {isLoading ? 'Guardando...' : 'Actualizar usuario'}
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
