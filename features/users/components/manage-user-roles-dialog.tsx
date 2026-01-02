'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { useRoles } from '@/features/roles/hooks/useRoles'
import { gql } from 'graphql-request'
import { getGraphQLClient } from '@/shared/lib/graphql/client'
import type { Profile } from '../hooks/useProfiles'

interface ManageUserRolesDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  user: Profile | null
  onRolesUpdated: () => void
}

// GraphQL Queries y Mutations
const GET_USER_ROLES_QUERY = gql`
  query GetUserRoles($userId: UUID!) {
    user_rolesCollection(filter: { user_id: { eq: $userId } }) {
      edges {
        node {
          role_id
          enabled
        }
      }
    }
  }
`

const GET_ALL_USER_ROLES_QUERY = gql`
  query GetAllUserRoles($userId: UUID!) {
    user_rolesCollection(filter: { user_id: { eq: $userId } }) {
      edges {
        node {
          id
          role_id
        }
      }
    }
  }
`

const INSERT_USER_ROLES_MUTATION = gql`
  mutation InsertUserRoles($objects: [user_rolesInsertInput!]!) {
    insertIntouser_rolesCollection(objects: $objects) {
      affectedCount
      records {
        id
        user_id
        role_id
        enabled
      }
    }
  }
`

const UPDATE_USER_ROLES_MUTATION = gql`
  mutation UpdateUserRoles($filter: user_rolesFilter!, $set: user_rolesUpdateInput!) {
    updateuser_rolesCollection(filter: $filter, set: $set) {
      affectedCount
      records {
        id
        enabled
      }
    }
  }
`

// Interfaces para las respuestas GraphQL
interface UserRoleNode {
  role_id: string
  enabled: boolean
}

interface AllUserRoleNode {
  id: string
  role_id: string
}

interface GetUserRolesResponse {
  user_rolesCollection: {
    edges: Array<{ node: UserRoleNode }>
  }
}

interface GetAllUserRolesResponse {
  user_rolesCollection: {
    edges: Array<{ node: AllUserRoleNode }>
  }
}

interface InsertUserRolesResponse {
  insertIntouser_rolesCollection: {
    affectedCount: number
    records: Array<{
      id: string
      user_id: string
      role_id: string
      enabled: boolean
    }>
  }
}

interface UpdateUserRolesResponse {
  updateuser_rolesCollection: {
    affectedCount: number
    records: Array<{
      id: string
      enabled: boolean
    }>
  }
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
      const client = await getGraphQLClient()

      const data = await client.request<GetUserRolesResponse>(GET_USER_ROLES_QUERY, {
        userId: user.id
      })

      const roleIds = data.user_rolesCollection.edges
        .filter(edge => edge.node.enabled)
        .map(edge => edge.node.role_id)

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
      const client = await getGraphQLClient()

      // Obtener todos los roles existentes del usuario (enabled y disabled)
      const existingData = await client.request<GetAllUserRolesResponse>(
        GET_ALL_USER_ROLES_QUERY,
        { userId: user.id }
      )

      const existingRoles = existingData.user_rolesCollection.edges.map(edge => edge.node)
      const existingRoleIds = existingRoles.map(r => r.role_id)

      // Roles a insertar (nuevos roles que no existen)
      const rolesToInsert = selectedRoleIds.filter(roleId => !existingRoleIds.includes(roleId))

      // Roles a habilitar (existen pero deben estar enabled)
      const rolesToEnable = selectedRoleIds.filter(roleId => existingRoleIds.includes(roleId))

      // Roles a deshabilitar (existen pero no están seleccionados)
      const rolesToDisable = existingRoleIds.filter(roleId => !selectedRoleIds.includes(roleId))

      // 🔍 DEBUG LOGS
      console.log('🔍 DEBUG - User:', user.email, user.id)
      console.log('🔍 DEBUG - selectedRoleIds:', selectedRoleIds)
      console.log('🔍 DEBUG - existingRoleIds:', existingRoleIds)
      console.log('🔍 DEBUG - rolesToInsert:', rolesToInsert)
      console.log('🔍 DEBUG - rolesToEnable:', rolesToEnable)
      console.log('🔍 DEBUG - rolesToDisable:', rolesToDisable)

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

        console.log('🔍 DEBUG - Ejecutando INSERT para:', newRoles)
        const insertResult = await client.request<InsertUserRolesResponse>(INSERT_USER_ROLES_MUTATION, {
          objects: newRoles
        })
        console.log('🔍 DEBUG - Resultado INSERT:', insertResult)
      }

      // Habilitar roles existentes
      if (rolesToEnable.length > 0) {
        console.log('🔍 DEBUG - Ejecutando UPDATE para HABILITAR:', rolesToEnable)
        const enableResult = await client.request<UpdateUserRolesResponse>(UPDATE_USER_ROLES_MUTATION, {
          filter: {
            user_id: { eq: user.id },
            role_id: { in: rolesToEnable }
          },
          set: {
            enabled: true
          }
        })
        console.log('🔍 DEBUG - Resultado HABILITAR:', enableResult)
      }

      // Deshabilitar roles no seleccionados
      if (rolesToDisable.length > 0) {
        console.log('🔍 DEBUG - Ejecutando UPDATE para DESHABILITAR:', rolesToDisable)
        const disableResult = await client.request<UpdateUserRolesResponse>(UPDATE_USER_ROLES_MUTATION, {
          filter: {
            user_id: { eq: user.id },
            role_id: { in: rolesToDisable }
          },
          set: {
            enabled: false
          }
        })
        console.log('🔍 DEBUG - Resultado DESHABILITAR:', disableResult)
      }

      console.log('🔍 DEBUG - Operaciones completadas, cerrando diálogo')
      onRolesUpdated()
      onOpenChange(false)
    } catch (error) {
      console.error('❌ Error al guardar roles:', error)
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
