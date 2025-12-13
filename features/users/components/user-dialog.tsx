'use client'

import { useEffect, useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createClient } from '@/shared/lib/supabase/client'
import { type Profile } from '@/features/users/hooks/useProfiles'

interface Role {
  id: string
  name: string
  description: string
}

interface UserDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  user?: Profile | null
  onSaved: () => void
}

export function UserDialog({ open, onOpenChange, user, onSaved }: UserDialogProps) {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [selectedRoleId, setSelectedRoleId] = useState('')
  const [roles, setRoles] = useState<Role[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Cargar roles disponibles cuando el dialog se abre
  useEffect(() => {
    if (open && !user) {
      // Solo cargar roles al crear un nuevo usuario
      fetch('/api/roles')
        .then((res) => res.json())
        .then((data) => {
          setRoles(data)
          // Seleccionar 'vendedor' por defecto
          const vendedorRole = data.find((r: Role) => r.name === 'vendedor')
          if (vendedorRole) {
            setSelectedRoleId(vendedorRole.id)
          }
        })
        .catch((err) => {
          console.error('Error loading roles:', err)
        })
    }
  }, [open, user])

  useEffect(() => {
    if (user) {
      setFullName(user.fullName || '')
      setEmail(user.email || '')
    } else {
      setFullName('')
      setEmail('')
    }
    setError(null)
  }, [user, open])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      if (user) {
        // Update existing user - solo actualizar perfil
        const supabase = createClient()
        const { error: updateError } = await supabase
          .from('user_profiles')
          .update({
            full_name: fullName,
          })
          .eq('id', user.id)

        if (updateError) throw updateError
      } else {
        // Create new user - usar API route que crea auth.users + perfil + rol
        const response = await fetch('/api/admin/users', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email,
            fullName,
            roleId: selectedRoleId,
          }),
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || 'Error al crear usuario')
        }

        // Success - mostrar mensaje con contraseña temporal
        const data = await response.json()
        alert(
          `Usuario creado exitosamente.\n\nEmail: ${email}\nContraseña temporal: CambiaTuClave\n\nEl usuario debe cambiar su contraseña en el primer login.`
        )
      }

      onOpenChange(false)
      onSaved()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar usuario')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-white">
        <DialogHeader>
          <DialogTitle>
            {user ? 'Editar Usuario' : 'Crear Usuario'}
          </DialogTitle>
          <DialogDescription>
            {user ? 'Actualiza los datos del usuario' : 'Crea un nuevo usuario en el sistema'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSave} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fullName">Nombre Completo</Label>
            <Input
              id="fullName"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Juan Pérez"
              required
            />
          </div>

          {!user && (
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="juan@ejemplo.com"
                required
              />
            </div>
          )}

          {!user && (
            <div className="space-y-2">
              <Label htmlFor="role">Rol</Label>
              <select
                id="role"
                value={selectedRoleId}
                onChange={(e) => setSelectedRoleId(e.target.value)}
                className="w-full px-3 py-2 border border-input rounded-md bg-background"
                required
              >
                {roles.length === 0 ? (
                  <option value="">Cargando roles...</option>
                ) : (
                  roles.map((role) => (
                    <option key={role.id} value={role.id}>
                      {role.name.charAt(0).toUpperCase() + role.name.slice(1)}
                    </option>
                  ))
                )}
              </select>
            </div>
          )}

          {error && (
            <div className="text-destructive text-sm">
              {error}
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading} className="bg-gray-900 hover:bg-gray-800 text-white">
              {loading ? 'Guardando...' : user ? 'Actualizar' : 'Crear'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
