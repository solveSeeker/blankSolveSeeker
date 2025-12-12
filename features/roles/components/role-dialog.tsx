'use client'

import { useEffect, useState } from 'react'
import { Role, CreateRoleInput } from '@/features/roles/types'
import { roleService } from '@/features/roles/services'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface RoleDialogProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  role: Role | null
  onSuccess: () => void
}

export function RoleDialog({ isOpen, onOpenChange, role, onSuccess }: RoleDialogProps) {
  const [formData, setFormData] = useState<CreateRoleInput>({
    name: '',
    description: ''
  })
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (role) {
      setFormData({
        name: role.name,
        description: role.description
      })
    } else {
      setFormData({
        name: '',
        description: ''
      })
    }
    setError(null)
  }, [role, isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!formData.name.trim()) {
      setError('El nombre del rol es obligatorio')
      return
    }

    try {
      setIsSaving(true)

      if (role) {
        await roleService.updateRole(role.id, formData)
      } else {
        await roleService.createRole(formData)
      }

      onSuccess()
      onOpenChange(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar el rol')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="bg-white">
        <DialogHeader>
          <DialogTitle>
            {role ? 'Editar Rol' : 'Crear Rol'}
          </DialogTitle>
          <DialogDescription>
            {role ? 'Actualiza la información del rol' : 'Agrega un nuevo rol al sistema'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nombre del Rol</Label>
            <Input
              id="name"
              placeholder="ej: Administrador"
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              disabled={isSaving}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descripción</Label>
            <Input
              id="description"
              placeholder="ej: Acceso completo al sistema"
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
              disabled={isSaving}
            />
          </div>

          {error && (
            <div className="rounded-md bg-red-50 p-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSaving}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isSaving} className="bg-gray-900 hover:bg-gray-800 text-white">
              {isSaving ? 'Guardando...' : 'Guardar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
