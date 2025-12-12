'use client'

import { useEffect, useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createClient } from '@/shared/lib/supabase/client'
import { type Profile } from '@/features/users/hooks/useProfiles'

interface UserDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  user?: Profile | null
  onSaved: () => void
}

export function UserDialog({ open, onOpenChange, user, onSaved }: UserDialogProps) {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [role, setRole] = useState('usuario')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (user) {
      setFullName(user.fullName || '')
      setEmail(user.email || '')
      setRole('usuario')
    } else {
      setFullName('')
      setEmail('')
      setRole('usuario')
    }
    setError(null)
  }, [user, open])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const supabase = createClient()

      if (user) {
        // Update
        const { error: updateError } = await supabase
          .from('profiles')
          .update({
            full_name: fullName,
            role: role,
          })
          .eq('id', user.id)

        if (updateError) throw updateError
      } else {
        // Create
        const { error: insertError } = await supabase
          .from('profiles')
          .insert({
            full_name: fullName,
            email: email,
            role: role,
          })

        if (insertError) throw insertError
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

          <div className="space-y-2">
            <Label htmlFor="role">Rol</Label>
            <select
              id="role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full px-3 py-2 border border-input rounded-md bg-background"
            >
              <option value="usuario">Usuario</option>
              <option value="admin">Administrador</option>
              <option value="vendedor">Vendedor</option>
            </select>
          </div>

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
