'use client'

import { useState } from 'react'
import { useCurrentUserProfile } from '@/features/users/hooks/useCurrentUserProfile'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { User } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'

export function ProfilePage() {
  const { profile } = useCurrentUserProfile()
  const [fullName, setFullName] = useState(profile?.fullName || '')
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatarUrl || '')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // TODO: Implementar actualización de perfil
      console.log('Updating profile:', { fullName, avatarUrl })
    } catch (error) {
      console.error('Error updating profile:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const formatMemberSince = (date: string | null | undefined) => {
    if (!date) return '-'
    const dateObj = new Date(date)
    const month = dateObj.toLocaleDateString('es-ES', { month: 'short' })
    const year = dateObj.getFullYear()
    return `${month}/${year}`
  }

  const formatLastUpdate = (date: string | null | undefined) => {
    if (!date) return '-'
    const dateObj = new Date(date)
    const day = dateObj.getDate().toString().padStart(2, '0')
    const month = (dateObj.getMonth() + 1).toString().padStart(2, '0')
    const year = dateObj.getFullYear()
    return `${day}/${month}/${year}`
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Información General */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">
          Información General
        </h2>

        <div className="flex flex-col items-center space-y-4">
          <Avatar className="h-32 w-32">
            <AvatarFallback className="bg-gray-100">
              <User className="h-16 w-16 text-gray-600" />
            </AvatarFallback>
          </Avatar>

          <div className="text-center">
            <h3 className="text-xl font-semibold text-gray-900">
              {profile?.fullName || 'Sin nombre'}
            </h3>
            <p className="text-sm text-gray-500">
              {profile?.email}
            </p>
          </div>

          <div className="bg-gray-100 px-4 py-1 rounded-full">
            <span className="text-sm text-gray-700">Usuario</span>
          </div>
        </div>

        <div className="mt-8 space-y-4 border-t border-gray-200 pt-6">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Miembro desde</span>
            <span className="text-sm font-medium text-gray-900">
              {formatMemberSince(profile?.createdAt)}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Última actualización</span>
            <span className="text-sm font-medium text-gray-900">
              {formatLastUpdate(profile?.updatedAt)}
            </span>
          </div>
        </div>
      </div>

      {/* Editar Perfil */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-2">
          Editar Perfil
        </h2>
        <p className="text-sm text-gray-500 mb-6">
          Actualiza tu información personal
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="email">Correo electrónico</Label>
            <Input
              id="email"
              type="email"
              value={profile?.email || ''}
              disabled
              className="bg-gray-50"
            />
            <p className="text-xs text-gray-500">
              El correo electrónico no se puede cambiar
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="fullName">Nombre completo</Label>
            <Input
              id="fullName"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Tu nombre completo"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="avatarUrl">URL del avatar</Label>
            <Input
              id="avatarUrl"
              type="url"
              value={avatarUrl}
              onChange={(e) => setAvatarUrl(e.target.value)}
              placeholder="https://ejemplo.com/avatar.jpg"
            />
            <p className="text-xs text-gray-500">
              Opcional: URL de tu imagen de perfil
            </p>
          </div>

          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={isLoading}
              className="bg-gray-900 hover:bg-gray-800 text-white"
            >
              {isLoading ? 'Guardando...' : 'Guardar cambios'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
