import { useEffect, useState } from 'react'

export interface UserRole {
  profile_id: string  // ✅ Actualizado de user_id a profile_id
  role_id: string
  role_name?: string
  visible?: boolean
  enabled?: boolean
}

/**
 * Hook para obtener todos los user_roles
 *
 * NOTA TEMPORAL: Este hook usa el API route /api/user-roles en lugar de GraphQL
 * debido a que pg_graphql no expone correctamente user_rolesCollection.
 *
 * TODO: Migrar a GraphQL cuando se resuelva el problema con pg_graphql
 */
export function useUserRoles() {
  const [userRoles, setUserRoles] = useState<UserRole[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchUserRoles()
  }, [])

  const fetchUserRoles = async () => {
    try {
      setIsLoading(true)

      // Obtener todos los user_roles usando el API route
      const response = await fetch('/api/user-roles')

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Error al cargar roles de usuarios')
      }

      const data: UserRole[] = await response.json()
      setUserRoles(data)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar roles de usuarios')
      setUserRoles([])
    } finally {
      setIsLoading(false)
    }
  }

  const getRolesForUser = (userId: string, isSysAdmin?: boolean): string[] => {
    // Si es sysadmin, retornar 'SysAdmin' directamente
    if (isSysAdmin) {
      return ['SysAdmin']
    }

    // Para usuarios normales, buscar en user_roles
    return userRoles
      .filter((ur) => ur.profile_id === userId && ur.enabled)  // ✅ Actualizado user_id → profile_id
      .map((ur) => ur.role_name || 'unknown')
  }

  return {
    userRoles,
    isLoading,
    error,
    getRolesForUser,
    refetch: fetchUserRoles,
  }
}
