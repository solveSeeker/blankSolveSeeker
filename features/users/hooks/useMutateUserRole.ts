import { useState } from 'react'
import { gql } from 'graphql-request'
import { getGraphQLClient } from '@/shared/lib/graphql/client'

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

// GraphQL Queries y Mutations
const GET_USER_ROLES_BY_PROFILE_QUERY = gql`
  query GetUserRolesByProfile($profileId: UUID!) {
    user_rolesCollection(filter: { profile_id: { eq: $profileId }, enabled: { eq: true } }) {
      edges {
        node {
          id
          profile_id
          role_id
          relatedObjects
          enabled
          visible
          created
        }
      }
    }
  }
`

const GET_ALL_USER_ROLES_QUERY = gql`
  query GetAllUserRoles($profileId: UUID!) {
    user_rolesCollection(filter: { profile_id: { eq: $profileId } }) {
      edges {
        node {
          id
          profile_id
          role_id
          enabled
          visible
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
        profile_id
        role_id
        relatedObjects
        enabled
        visible
        created
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

const DELETE_USER_ROLES_MUTATION = gql`
  mutation DeleteUserRoles($ids: [UUID!]!) {
    deleteFromuser_rolesCollection(filter: { id: { in: $ids } }) {
      affectedCount
    }
  }
`

// Response interfaces
interface GraphQLEdge<T> {
  node: T
}

interface GraphQLCollection<T> {
  edges: GraphQLEdge<T>[]
}

interface GetUserRolesByProfileResponse {
  user_rolesCollection: GraphQLCollection<UserRole>
}

interface GetAllUserRolesResponse {
  user_rolesCollection: GraphQLCollection<{
    id: string
    profile_id: string
    role_id: string
    enabled: boolean
    visible: boolean
  }>
}

interface InsertUserRolesResponse {
  insertIntouser_rolesCollection: {
    affectedCount: number
    records: UserRole[]
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

interface DeleteUserRolesResponse {
  deleteFromuser_rolesCollection: {
    affectedCount: number
  }
}

/**
 * Hook para operaciones CRUD en user_roles usando GraphQL
 */
export function useMutateUserRole() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  /**
   * Obtener roles de un usuario (solo enabled)
   */
  const fetchByProfile = async (profileId: string): Promise<UserRole[]> => {
    try {
      const client = await getGraphQLClient()

      const response = await client.request<GetUserRolesByProfileResponse>(
        GET_USER_ROLES_BY_PROFILE_QUERY,
        { profileId }
      )

      return response.user_rolesCollection.edges.map(edge => edge.node)
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
      const client = await getGraphQLClient()

      const response = await client.request<GetAllUserRolesResponse>(
        GET_ALL_USER_ROLES_QUERY,
        { profileId }
      )

      return response.user_rolesCollection.edges.map(edge => edge.node)
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

      const client = await getGraphQLClient()

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
          relatedObjects: JSON.stringify(relatedObjects),  // ✅ Convertir a string JSON
          enabled: input.enabled ?? true,
          visible: input.visible ?? true
        }
      })

      console.log('🔍 DEBUG - Insertando user_roles:', objects)

      const response = await client.request<InsertUserRolesResponse>(
        INSERT_USER_ROLES_MUTATION,
        { objects }
      )

      console.log('✅ user_roles insertados:', response.insertIntouser_rolesCollection.affectedCount)

      return response.insertIntouser_rolesCollection.records
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

      const client = await getGraphQLClient()

      const response = await client.request<UpdateUserRolesResponse>(
        UPDATE_USER_ROLES_MUTATION,
        {
          filter: {
            profile_id: { eq: profileId },
            role_id: { in: roleIds }
          },
          set: {
            enabled
          }
        }
      )

      console.log(`✅ user_roles actualizados a enabled=${enabled}:`, response.updateuser_rolesCollection.affectedCount)

      return response.updateuser_rolesCollection.records
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

      const client = await getGraphQLClient()

      const response = await client.request<DeleteUserRolesResponse>(
        DELETE_USER_ROLES_MUTATION,
        { ids }
      )

      console.log('✅ user_roles eliminados:', response.deleteFromuser_rolesCollection.affectedCount)

      return response.deleteFromuser_rolesCollection.affectedCount
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
