'use client'

import { useEffect, useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { createClient } from '@/shared/lib/supabase/client'
import { type Profile } from '@/features/users/hooks/useProfiles'
import { useCurrentUserProfile } from '@/features/users/hooks/useCurrentUserProfile'

interface UserDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  user?: Profile | null
  onSaved: () => void
}

export function UserDialog({ open, onOpenChange, user, onSaved }: UserDialogProps) {
  const { isSysAdmin } = useCurrentUserProfile()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [isSysAdminUser, setIsSysAdminUser] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (user) {
      setFullName(user.fullName || '')
      setEmail(user.email || '')
    } else {
      setFullName('')
      setEmail('')
      setIsSysAdminUser(false)
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
          .from('profiles')
          .update({
            fullName: fullName,
          })
          .eq('id', user.id)

        if (updateError) throw updateError
      } else {
        // Create new user - usar API route que crea auth.users + perfil
        const response = await fetch('/api/admin/users', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email,
            fullName,
            isSysAdmin: isSysAdminUser,
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

          {!user && isSysAdmin && (
            <div className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer" onClick={() => setIsSysAdminUser(!isSysAdminUser)}>
              <Checkbox
                id="isSysAdmin"
                checked={isSysAdminUser}
                onCheckedChange={(checked) => setIsSysAdminUser(checked === true)}
              />
              <label htmlFor="isSysAdmin" className="cursor-pointer text-sm font-medium">
                Este usuario es SysAdmin
              </label>
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
