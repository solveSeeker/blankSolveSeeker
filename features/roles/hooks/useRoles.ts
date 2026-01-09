import { useEffect, useState, useCallback } from 'react'
import { gql } from 'graphql-request'
import { getGraphQLClient } from '@/shared/lib/graphql/client'
import { useCurrentUserProfile } from '@/features/users/hooks/useCurrentUserProfile'
import type { Role } from '../types'

const GET_ROLES_QUERY = gql`
  query GetRoles {
    rolesCollection(orderBy: [{ hrchy: AscNullsLast }, { name: AscNullsLast }]) {
      edges {
        node {
          id
          key
          name
          description
          hrchy
          visible
          enabled
          created
          updated
        }
      }
    }
  }
`

interface RolesResponse {
  rolesCollection: {
    edges: Array<{
      node: Role
    }>
  }
}

export function useRoles() {
  const { isSysAdmin, isLoading: isLoadingProfile } = useCurrentUserProfile()
  const [roles, setRoles] = useState<Role[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchRoles = useCallback(async () => {
    try {
      setIsLoading(true)
      const client = await getGraphQLClient()

      const data = await client.request<RolesResponse>(GET_ROLES_QUERY)

      let rolesList = data.rolesCollection.edges.map((edge) => edge.node)

      // Filter by visible=true for non-sysAdmin users
      if (!isSysAdmin) {
        rolesList = rolesList.filter(role => role.visible === true)
      }

      setRoles(rolesList)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar roles')
      setRoles([])
    } finally {
      setIsLoading(false)
    }
  }, [isSysAdmin])

  useEffect(() => {
    // Solo fetch cuando el perfil haya cargado
    if (!isLoadingProfile) {
      fetchRoles()
    }
  }, [fetchRoles, isLoadingProfile])

  return {
    roles,
    isLoading,
    error,
    refetch: fetchRoles,
  }
}
