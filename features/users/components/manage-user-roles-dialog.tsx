'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { useRoles } from '@/features/roles/hooks/useRoles'
import { createClient } from '@/shared/lib/supabase/client'
import type { Profile } from '../hooks/useProfiles'

interface ManageUserRolesDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  user: Profile | null
  onRolesUpdated: () => void
}

export function ManageUserRolesDialog({
  open,
  onOpenChange,
  user,
  onRolesUpdated
}: ManageUserRolesDialogProps) {
  const { roles, isLoading: rolesLoading } = useRoles()
  const [selectedRoleIds, setSelectedRoleIds] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isFetchingUserRoles, setIsFetchingUserRoles] = useState(false)

  // Cargar roles actuales del usuario
  useEffect(() => {
    if (open && user && !user.is_sysadmin) {
      fetchUserRoles()
    } else if (!open) {
      // Reset cuando se cierra el modal
      setSelectedRoleIds([])
    }
  }, [open, user])

  const fetchUserRoles = async () => {
    if (!user) return

    try {
      setIsFetchingUserRoles(true)
      const supabase = createClient()

      const { data, error } = await supabase
        .from('user_roles')
        .select('role_id, enabled')
        .eq('user_id', user.id)
        .eq('enabled', true)

      if (error) throw error

      const roleIds = data?.map(ur => ur.role_id) || []
      setSelectedRoleIds(roleIds)
    } catch (error) {
      console.error('Error al cargar roles del usuario:', error)
    } finally {
      setIsFetchingUserRoles(false)
    }
  }

  const handleToggleRole = (roleId: string) => {
    setSelectedRoleIds(prev => {
      if (prev.includes(roleId)) {
        return prev.filter(id => id !== roleId)
      } else {
        return [...prev, roleId]
      }
    })
  }

  const handleSave = async () => {
    if (!user) return

    try {
      setIsLoading(true)
      const supabase = createClient()

      // Obtener todos los roles existentes del usuario (enabled y disabled)
      const { data: existingRoles, error: fetchError } = await supabase
        .from('user_roles')
        .select('role_id, id')
        .eq('user_id', user.id)

      if (fetchError) throw fetchError

      const existingRoleIds = existingRoles?.map(r => r.role_id) || []
      const existingRolesMap = new Map(existingRoles?.map(r => [r.role_id, r.id]))

      // Roles a insertar (nuevos roles que no existen)
      const rolesToInsert = selectedRoleIds.filter(roleId => !existingRoleIds.includes(roleId))

      // Roles a habilitar (existen pero deben estar enabled)
      const rolesToEnable = selectedRoleIds.filter(roleId => existingRoleIds.includes(roleId))

      // Roles a deshabilitar (existen pero no están seleccionados)
      const rolesToDisable = existingRoleIds.filter(roleId => !selectedRoleIds.includes(roleId))

      // Insertar nuevos roles con enabled=true
      if (rolesToInsert.length > 0) {
        // Obtener nombres de roles para generar keys
        const roleNames = new Map(roles.map(r => [r.id, r.name]))

        const newRoles = rolesToInsert.map(roleId => ({
          user_id: user.id,
          role_id: roleId,
          enabled: true,
          key: `${user.email}_${roleNames.get(roleId)}`
        }))

        const { error: insertError } = await supabase
          .from('user_roles')
          .insert(newRoles)

        if (insertError) throw insertError
      }

      // Habilitar roles existentes
      if (rolesToEnable.length > 0) {
        const { error: enableError } = await supabase
          .from('user_roles')
          .update({ enabled: true })
          .in('role_id', rolesToEnable)
          .eq('user_id', user.id)

        if (enableError) throw enableError
      }

      // Deshabilitar roles no seleccionados
      if (rolesToDisable.length > 0) {
        const { error: disableError } = await supabase
          .from('user_roles')
          .update({ enabled: false })
          .in('role_id', rolesToDisable)
          .eq('user_id', user.id)

        if (disableError) throw disableError
      }

      onRolesUpdated()
      onOpenChange(false)
    } catch (error) {
      console.error('Error al guardar roles:', error)
    } finally {
      setIsLoading(false)
    }
  }


  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] bg-white">
        <DialogHeader>
          <DialogTitle>Gestionar Roles</DialogTitle>
          <p className="text-sm text-gray-400 mt-1">
            Asigna uno o más roles al usuario
          </p>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Usuario info */}
          <div>
            <p className="text-sm font-normal">Usuario</p>
            <p className="text-sm text-gray-400">
              {user?.fullName} ({user?.email})
            </p>
          </div>

          {/* Roles disponibles */}
          <div>
            <p className="text-sm font-normal mb-3">Roles disponibles</p>

            {rolesLoading || isFetchingUserRoles ? (
              <div className="text-sm text-muted-foreground">Cargando roles...</div>
            ) : (
              <div className="space-y-1 border border-gray-200 rounded-lg p-2">
                {roles.map((role) => (
                  <div
                    key={role.id}
                    className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-50"
                  >
                    <Checkbox
                      id={`role-${role.id}`}
                      checked={selectedRoleIds.includes(role.id)}
                      onCheckedChange={() => handleToggleRole(role.id)}
                    />
                    <label
                      htmlFor={`role-${role.id}`}
                      className="flex-1 text-sm text-gray-900 font-normal"
                    >
                      {role.name}
                    </label>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Nota */}
          <p className="text-xs text-gray-400">
            Un usuario puede tener múltiples roles asignados
          </p>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSave}
            disabled={isLoading}
            className="bg-gray-900 hover:bg-gray-800 text-white"
          >
            {isLoading ? 'Guardando...' : 'Guardar cambios'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
