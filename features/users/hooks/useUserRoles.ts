import { useEffect, useState } from 'react'
import { gql } from 'graphql-request'
import { getGraphQLClient } from '@/shared/lib/graphql/client'

export interface UserRole {
  user_id: string
  role_id: string
  role_name?: string
  visible?: boolean
  enabled?: boolean
}

const GET_USER_ROLES_QUERY = gql`
  query GetUserRoles {
    user_rolesCollection {
      edges {
        node {
          user_id
          role_id
          enabled
          visible
          roles {
            name
          }
        }
      }
    }
  }
`

interface UserRolesResponse {
  user_rolesCollection: {
    edges: Array<{
      node: {
        user_id: string
        role_id: string
        enabled: boolean
        visible: boolean
        roles: {
          name: string
        } | null
      }
    }>
  }
}

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
      const client = await getGraphQLClient()

      const data = await client.request<UserRolesResponse>(GET_USER_ROLES_QUERY)

      const mappedData = data.user_rolesCollection.edges.map((edge) => ({
        user_id: edge.node.user_id,
        role_id: edge.node.role_id,
        role_name: edge.node.roles?.name || 'unknown',
        visible: edge.node.visible,
        enabled: edge.node.enabled,
      }))

      setUserRoles(mappedData)
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
      .filter((ur) => ur.user_id === userId)
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
