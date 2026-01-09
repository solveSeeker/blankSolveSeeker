'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { useRoles } from '@/features/roles/hooks/useRoles'
import { useMutateUserRole } from '../hooks/useMutateUserRole'
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
  const { fetchAllByProfile, insert, updateStatus, isLoading: isSaving } = useMutateUserRole()
  const [selectedRoleIds, setSelectedRoleIds] = useState<string[]>([])
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

      const userRoles = await fetchAllByProfile(user.id)

      const roleIds = userRoles
        .filter(ur => ur.enabled)
        .map(ur => ur.role_id)

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
      // Obtener todos los roles existentes del usuario (enabled y disabled)
      const existingRoles = await fetchAllByProfile(user.id)
      const existingRoleIds = existingRoles.map(r => r.role_id)

      // Roles a insertar (nuevos roles que no existen)
      const rolesToInsert = selectedRoleIds.filter(roleId => !existingRoleIds.includes(roleId))

      // Roles a habilitar (existen DESHABILITADOS pero ahora están seleccionados)
      const rolesToEnable = selectedRoleIds.filter(roleId => {
        const existing = existingRoles.find(r => r.role_id === roleId)
        return existing && !existing.enabled
      })

      // Roles a deshabilitar (existen HABILITADOS pero ya NO están seleccionados)
      const rolesToDisable = existingRoleIds.filter(roleId => {
        const existing = existingRoles.find(r => r.role_id === roleId)
        return existing && existing.enabled && !selectedRoleIds.includes(roleId)
      })

      // 🔍 DEBUG LOGS
      console.log('🔍 DEBUG - User:', user.email, user.id)
      console.log('🔍 DEBUG - selectedRoleIds:', selectedRoleIds)
      console.log('🔍 DEBUG - existingRoleIds:', existingRoleIds)
      console.log('🔍 DEBUG - rolesToInsert:', rolesToInsert)
      console.log('🔍 DEBUG - rolesToEnable:', rolesToEnable)
      console.log('🔍 DEBUG - rolesToDisable:', rolesToDisable)

      // Insertar nuevos roles con enabled=true
      if (rolesToInsert.length > 0) {
        // Crear mapa de roleId -> roleName
        const roleNamesMap = new Map(roles.map(r => [r.id, r.name]))

        // Construir inputs con email y name para relatedObjects
        const insertInputs = rolesToInsert.map(roleId => ({
          profileId: user.id,
          profileEmail: user.email,  // ✅ Necesario para relatedObjects
          roleId: roleId,
          roleName: roleNamesMap.get(roleId) || '',  // ✅ Necesario para relatedObjects
          enabled: true,
          visible: true
        }))

        console.log('🔍 DEBUG - Ejecutando INSERT con relatedObjects')
        await insert(insertInputs)
      }

      // Habilitar roles existentes
      if (rolesToEnable.length > 0) {
        console.log('🔍 DEBUG - Ejecutando UPDATE para HABILITAR:', rolesToEnable)
        await updateStatus({
          profileId: user.id,
          roleIds: rolesToEnable,
          enabled: true
        })
      }

      // Deshabilitar roles no seleccionados
      if (rolesToDisable.length > 0) {
        console.log('🔍 DEBUG - Ejecutando UPDATE para DESHABILITAR:', rolesToDisable)
        await updateStatus({
          profileId: user.id,
          roleIds: rolesToDisable,
          enabled: false
        })
      }

      console.log('🔍 DEBUG - Operaciones completadas, cerrando diálogo')
      onRolesUpdated()
      onOpenChange(false)
    } catch (error) {
      console.error('❌ Error al guardar roles:', error)
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
            disabled={isSaving}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="bg-gray-900 hover:bg-gray-800 text-white"
          >
            {isSaving ? 'Guardando...' : 'Guardar cambios'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
