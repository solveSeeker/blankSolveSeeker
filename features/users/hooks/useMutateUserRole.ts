import { useState } from 'react'

// Interface para el objeto JSON relatedObjects
interface UserRoleRelatedObjects {
  profiles: string  // email del profile
  roles: string     // name del rol
}

// Interface para user_role
interface UserRole {
  id: string
  profile_id: string
  role_id: string
  relatedObjects: UserRoleRelatedObjects
  enabled: boolean
  visible: boolean
  created: string
  updated?: string | null
}

// Input interface para insertar user_role
interface InsertUserRoleInput {
  profileId: string
  profileEmail: string  // Necesario para relatedObjects
  roleId: string
  roleName: string      // Necesario para relatedObjects
  enabled?: boolean
  visible?: boolean
}

// Input interface para actualizar múltiples roles
interface UpdateUserRolesInput {
  profileId: string
  roleIds: string[]
  enabled: boolean
}

/**
 * Hook para operaciones CRUD en user_roles
 *
 * NOTA TEMPORAL: Este hook usa el API route /api/user-roles en lugar de GraphQL
 * debido a que pg_graphql no expone correctamente user_rolesCollection.
 *
 * TODO: Migrar a GraphQL cuando se resuelva el problema con pg_graphql
 */
export function useMutateUserRole() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  /**
   * Obtener roles de un usuario (solo enabled)
   */
  const fetchByProfile = async (profileId: string): Promise<UserRole[]> => {
    try {
      const response = await fetch(`/api/user-roles?profileId=${profileId}`)

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Error al cargar roles del usuario')
      }

      const data: UserRole[] = await response.json()
      return data.filter(role => role.enabled)
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Error al cargar roles del usuario')
      console.error('Error en fetchByProfile:', error)
      throw error
    }
  }

  /**
   * Obtener todos los roles de un usuario (enabled y disabled)
   */
  const fetchAllByProfile = async (profileId: string) => {
    try {
      const response = await fetch(`/api/user-roles?profileId=${profileId}`)

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Error al cargar todos los roles del usuario')
      }

      const data: UserRole[] = await response.json()
      return data
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Error al cargar todos los roles del usuario')
      console.error('Error en fetchAllByProfile:', error)
      throw error
    }
  }

  /**
   * Insertar uno o más user_roles
   */
  const insert = async (inputs: InsertUserRoleInput[]): Promise<UserRole[]> => {
    try {
      setIsLoading(true)
      setError(null)

      // Construir objetos con relatedObjects
      const objects = inputs.map(input => {
        // Validar datos requeridos
        if (!input.profileEmail || !input.roleName) {
          throw new Error('profileEmail y roleName son requeridos para crear relatedObjects')
        }

        // Construir el objeto JSON para relatedObjects
        const relatedObjects: UserRoleRelatedObjects = {
          profiles: input.profileEmail,
          roles: input.roleName
        }

        return {
          profile_id: input.profileId,
          role_id: input.roleId,
          relatedObjects: relatedObjects,
          enabled: input.enabled ?? true,
          visible: input.visible ?? true
        }
      })

      console.log('🔍 DEBUG - Insertando user_roles:', objects)

      const response = await fetch('/api/user-roles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ objects }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Error al insertar roles')
      }

      const data = await response.json()

      console.log('✅ user_roles insertados:', data.affectedCount)

      return data.records
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Error al insertar roles')
      console.error('❌ Error en insert:', error)
      setError(error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  /**
   * Actualizar estado (enabled) de múltiples user_roles
   */
  const updateStatus = async ({ profileId, roleIds, enabled }: UpdateUserRolesInput) => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await fetch('/api/user-roles', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ profileId, roleIds, enabled }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Error al actualizar estado de roles')
      }

      const data = await response.json()

      console.log(`✅ user_roles actualizados a enabled=${enabled}:`, data.affectedCount)

      return data.records
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Error al actualizar estado de roles')
      console.error('❌ Error en updateStatus:', error)
      setError(error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  /**
   * Eliminar user_roles por IDs
   */
  const remove = async (ids: string[]) => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await fetch('/api/user-roles', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ids }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Error al eliminar roles')
      }

      const data = await response.json()

      console.log('✅ user_roles eliminados:', data.affectedCount)

      return data.affectedCount
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Error al eliminar roles')
      console.error('❌ Error en remove:', error)
      setError(error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  return {
    fetchByProfile,
    fetchAllByProfile,
    insert,
    updateStatus,
    remove,
    isLoading,
    error
  }
}
