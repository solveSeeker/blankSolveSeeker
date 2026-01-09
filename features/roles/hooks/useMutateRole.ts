'use client'

import { useState } from 'react'
import { gql } from 'graphql-request'
import { getGraphQLClient } from '@/shared/lib/graphql/client'
import type { Role, CreateRoleInput, UpdateRoleInput } from '../types'

// GraphQL Mutations
const INSERT_ROLE_MUTATION = gql`
  mutation InsertRole($objects: [rolesInsertInput!]!) {
    insertIntorolesCollection(objects: $objects) {
      affectedCount
      records {
        id
        key
        name
        description
        hrchy
        visible
        enabled
        created
      }
    }
  }
`

const UPDATE_ROLE_MUTATION = gql`
  mutation UpdateRole($id: UUID!, $set: rolesUpdateInput!) {
    updaterolesCollection(filter: { id: { eq: $id } }, set: $set) {
      affectedCount
      records {
        id
        key
        name
        description
        hrchy
        visible
        enabled
      }
    }
  }
`

const DELETE_ROLE_MUTATION = gql`
  mutation DeleteRole($id: UUID!) {
    deleteFromrolesCollection(filter: { id: { eq: $id } }) {
      affectedCount
    }
  }
`

const DELETE_USER_ROLES_MUTATION = gql`
  mutation DeleteUserRolesByRole($roleId: UUID!, $enabled: Boolean!) {
    deleteFromuser_rolesCollection(
      filter: { role_id: { eq: $roleId }, enabled: { eq: $enabled } }
    ) {
      affectedCount
    }
  }
`

// TypeScript Response Types
interface InsertRoleResponse {
  insertIntorolesCollection: {
    affectedCount: number
    records: Role[]
  }
}

interface UpdateRoleResponse {
  updaterolesCollection: {
    affectedCount: number
    records: Role[]
  }
}

interface DeleteRoleResponse {
  deleteFromrolesCollection: {
    affectedCount: number
  }
}

interface DeleteUserRolesResponse {
  deleteFromuser_rolesCollection: {
    affectedCount: number
  }
}

export function useMutateRole() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const [data, setData] = useState<Role | null>(null)

  const insert = async (input: CreateRoleInput): Promise<Role> => {
    setIsLoading(true)
    setError(null)
    try {
      const client = await getGraphQLClient()
      const variables = {
        objects: [{
          key: input.name.toLowerCase().replace(/\s+/g, '-'),
          name: input.name,
          description: input.description,
          hrchy: input.hrchy ?? null,
          visible: true,
          enabled: true
        }]
      }

      const response = await client.request<InsertRoleResponse>(INSERT_ROLE_MUTATION, variables)
      const role = response.insertIntorolesCollection.records[0]
      setData(role)
      return role
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Error al crear rol')
      setError(error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const update = async (id: string, input: UpdateRoleInput): Promise<Role> => {
    setIsLoading(true)
    setError(null)
    try {
      const client = await getGraphQLClient()
      const updateData: any = {}
      if (input.name) {
        updateData.name = input.name
        updateData.key = input.name.toLowerCase().replace(/\s+/g, '-')
      }
      if (input.description !== undefined) updateData.description = input.description
      if (input.hrchy !== undefined) updateData.hrchy = input.hrchy

      const response = await client.request<UpdateRoleResponse>(UPDATE_ROLE_MUTATION, {
        id,
        set: updateData
      })
      const role = response.updaterolesCollection.records[0]
      setData(role)
      return role
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Error al actualizar rol')
      setError(error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const deleteRole = async (id: string): Promise<void> => {
    setIsLoading(true)
    setError(null)
    try {
      const client = await getGraphQLClient()

      // Primero: Eliminar asignaciones deshabilitadas (enabled=false)
      await client.request<DeleteUserRolesResponse>(DELETE_USER_ROLES_MUTATION, {
        roleId: id,
        enabled: false
      })

      // Luego: Eliminar el rol
      await client.request<DeleteRoleResponse>(DELETE_ROLE_MUTATION, { id })
      setData(null)
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Error al eliminar rol')
      setError(error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const updateVisibility = async (id: string, visible: boolean): Promise<Role> => {
    setIsLoading(true)
    setError(null)
    try {
      const client = await getGraphQLClient()
      const response = await client.request<UpdateRoleResponse>(UPDATE_ROLE_MUTATION, {
        id,
        set: { visible }
      })
      const role = response.updaterolesCollection.records[0]
      setData(role)
      return role
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Error al actualizar visibilidad')
      setError(error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const updateEnabled = async (id: string, enabled: boolean): Promise<Role> => {
    setIsLoading(true)
    setError(null)
    try {
      const client = await getGraphQLClient()
      const response = await client.request<UpdateRoleResponse>(UPDATE_ROLE_MUTATION, {
        id,
        set: { enabled }
      })
      const role = response.updaterolesCollection.records[0]
      setData(role)
      return role
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Error al actualizar estado')
      setError(error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const reset = () => {
    setError(null)
    setData(null)
  }

  return {
    insert,
    update,
    delete: deleteRole,
    updateVisibility,
    updateEnabled,
    isLoading,
    error,
    data,
    reset
  }
}
