import { useState } from 'react'
import { gql } from 'graphql-request'
import { getGraphQLClient } from '@/shared/lib/graphql/client'

// Interface para el objeto JSON relatedObjects
interface UserCompanyRelatedObjects {
  profiles: string  // email del profile
  companies: string // name de la empresa
}

// Interface para user_company
interface UserCompany {
  id: string
  profile_id: string
  company_id: string
  relatedObjects: UserCompanyRelatedObjects
  enabled: boolean
  visible: boolean
  created: string
  updated?: string | null
}

// Input interface para insertar user_company
interface InsertUserCompanyInput {
  profileId: string
  profileEmail: string  // Necesario para relatedObjects
  companyId: string
  companyName: string   // Necesario para relatedObjects
  enabled?: boolean
  visible?: boolean
}

// Input interface para actualizar múltiples companies
interface UpdateUserCompaniesInput {
  profileId: string
  companyIds: string[]
  enabled: boolean
}

// GraphQL Queries y Mutations
const GET_USER_COMPANIES_BY_PROFILE_QUERY = gql`
  query GetUserCompaniesByProfile($profileId: UUID!) {
    user_companiesCollection(filter: { profile_id: { eq: $profileId }, enabled: { eq: true } }) {
      edges {
        node {
          id
          profile_id
          company_id
          relatedObjects
          enabled
          visible
          created
        }
      }
    }
  }
`

const GET_ALL_USER_COMPANIES_QUERY = gql`
  query GetAllUserCompanies($profileId: UUID!) {
    user_companiesCollection(filter: { profile_id: { eq: $profileId } }) {
      edges {
        node {
          id
          profile_id
          company_id
          enabled
          visible
        }
      }
    }
  }
`

const INSERT_USER_COMPANIES_MUTATION = gql`
  mutation InsertUserCompanies($objects: [user_companiesInsertInput!]!) {
    insertIntouser_companiesCollection(objects: $objects) {
      affectedCount
      records {
        id
        profile_id
        company_id
        relatedObjects
        enabled
        visible
        created
      }
    }
  }
`

const UPDATE_USER_COMPANIES_MUTATION = gql`
  mutation UpdateUserCompanies($filter: user_companiesFilter!, $set: user_companiesUpdateInput!) {
    updateuser_companiesCollection(filter: $filter, set: $set) {
      affectedCount
      records {
        id
        enabled
      }
    }
  }
`

const DELETE_USER_COMPANIES_MUTATION = gql`
  mutation DeleteUserCompanies($ids: [UUID!]!) {
    deleteFromuser_companiesCollection(filter: { id: { in: $ids } }) {
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

interface GetUserCompaniesByProfileResponse {
  user_companiesCollection: GraphQLCollection<UserCompany>
}

interface GetAllUserCompaniesResponse {
  user_companiesCollection: GraphQLCollection<{
    id: string
    profile_id: string
    company_id: string
    enabled: boolean
    visible: boolean
  }>
}

interface InsertUserCompaniesResponse {
  insertIntouser_companiesCollection: {
    affectedCount: number
    records: UserCompany[]
  }
}

interface UpdateUserCompaniesResponse {
  updateuser_companiesCollection: {
    affectedCount: number
    records: Array<{
      id: string
      enabled: boolean
    }>
  }
}

interface DeleteUserCompaniesResponse {
  deleteFromuser_companiesCollection: {
    affectedCount: number
  }
}

/**
 * Hook para operaciones CRUD en user_companies usando GraphQL
 */
export function useMutateUserCompany() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  /**
   * Obtener empresas de un usuario (solo enabled)
   */
  const fetchByProfile = async (profileId: string): Promise<UserCompany[]> => {
    try {
      const client = await getGraphQLClient()

      const response = await client.request<GetUserCompaniesByProfileResponse>(
        GET_USER_COMPANIES_BY_PROFILE_QUERY,
        { profileId }
      )

      return response.user_companiesCollection.edges.map(edge => edge.node)
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Error al cargar empresas del usuario')
      console.error('Error en fetchByProfile:', error)
      throw error
    }
  }

  /**
   * Obtener todas las empresas de un usuario (enabled y disabled)
   */
  const fetchAllByProfile = async (profileId: string) => {
    try {
      const client = await getGraphQLClient()

      const response = await client.request<GetAllUserCompaniesResponse>(
        GET_ALL_USER_COMPANIES_QUERY,
        { profileId }
      )

      return response.user_companiesCollection.edges.map(edge => edge.node)
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Error al cargar todas las empresas del usuario')
      console.error('Error en fetchAllByProfile:', error)
      throw error
    }
  }

  /**
   * Insertar uno o más user_companies
   */
  const insert = async (inputs: InsertUserCompanyInput[]): Promise<UserCompany[]> => {
    try {
      setIsLoading(true)
      setError(null)

      const client = await getGraphQLClient()

      // Construir objetos con relatedObjects
      const objects = inputs.map(input => {
        // Validar datos requeridos
        if (!input.profileEmail || !input.companyName) {
          throw new Error('profileEmail y companyName son requeridos para crear relatedObjects')
        }

        // Construir el objeto JSON para relatedObjects
        const relatedObjects: UserCompanyRelatedObjects = {
          profiles: input.profileEmail,
          companies: input.companyName
        }

        return {
          profile_id: input.profileId,
          company_id: input.companyId,
          relatedObjects: JSON.stringify(relatedObjects),  // ✅ Convertir a string JSON
          enabled: input.enabled ?? true,
          visible: input.visible ?? true
        }
      })

      console.log('🔍 DEBUG - Insertando user_companies:', objects)

      const response = await client.request<InsertUserCompaniesResponse>(
        INSERT_USER_COMPANIES_MUTATION,
        { objects }
      )

      console.log('✅ user_companies insertados:', response.insertIntouser_companiesCollection.affectedCount)

      return response.insertIntouser_companiesCollection.records
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Error al insertar empresas')
      console.error('❌ Error en insert:', error)
      setError(error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  /**
   * Actualizar estado (enabled) de múltiples user_companies
   */
  const updateStatus = async ({ profileId, companyIds, enabled }: UpdateUserCompaniesInput) => {
    try {
      setIsLoading(true)
      setError(null)

      const client = await getGraphQLClient()

      const response = await client.request<UpdateUserCompaniesResponse>(
        UPDATE_USER_COMPANIES_MUTATION,
        {
          filter: {
            profile_id: { eq: profileId },
            company_id: { in: companyIds }
          },
          set: {
            enabled
          }
        }
      )

      console.log(`✅ user_companies actualizados a enabled=${enabled}:`, response.updateuser_companiesCollection.affectedCount)

      return response.updateuser_companiesCollection.records
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Error al actualizar estado de empresas')
      console.error('❌ Error en updateStatus:', error)
      setError(error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  /**
   * Eliminar user_companies por IDs
   */
  const remove = async (ids: string[]) => {
    try {
      setIsLoading(true)
      setError(null)

      const client = await getGraphQLClient()

      const response = await client.request<DeleteUserCompaniesResponse>(
        DELETE_USER_COMPANIES_MUTATION,
        { ids }
      )

      console.log('✅ user_companies eliminados:', response.deleteFromuser_companiesCollection.affectedCount)

      return response.deleteFromuser_companiesCollection.affectedCount
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Error al eliminar empresas')
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
