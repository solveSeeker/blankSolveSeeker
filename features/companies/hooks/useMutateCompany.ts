'use client'

import { useState } from 'react'
import { gql } from 'graphql-request'
import { getGraphQLClient } from '@/shared/lib/graphql/client'
import type { Company, CreateCompanyInput, UpdateCompanyInput } from '../types'

// GraphQL Mutations
const INSERT_COMPANY_MUTATION = gql`
  mutation InsertCompany($objects: [companiesInsertInput!]!) {
    insertIntocompaniesCollection(objects: $objects) {
      affectedCount
      records {
        id
        name
        slug
        key
        logo_url
        primary_color
        secondary_color
        accent_color
        settings
        visible
        enabled
        created
      }
    }
  }
`

const UPDATE_COMPANY_MUTATION = gql`
  mutation UpdateCompany($id: UUID!, $set: companiesUpdateInput!) {
    updatecompaniesCollection(filter: { id: { eq: $id } }, set: $set) {
      affectedCount
      records {
        id
        name
        slug
        key
        logo_url
        primary_color
        secondary_color
        accent_color
        settings
        visible
        enabled
      }
    }
  }
`

const DELETE_COMPANY_MUTATION = gql`
  mutation DeleteCompany($id: UUID!) {
    deleteFromcompaniesCollection(filter: { id: { eq: $id } }) {
      affectedCount
    }
  }
`

const DELETE_USER_COMPANIES_MUTATION = gql`
  mutation DeleteUserCompaniesByCompany($companyId: UUID!, $enabled: Boolean!) {
    deleteFromuser_companiesCollection(
      filter: { company_id: { eq: $companyId }, enabled: { eq: $enabled } }
    ) {
      affectedCount
    }
  }
`

// TypeScript Response Types
interface InsertCompanyResponse {
  insertIntocompaniesCollection: {
    affectedCount: number
    records: Company[]
  }
}

interface UpdateCompanyResponse {
  updatecompaniesCollection: {
    affectedCount: number
    records: Company[]
  }
}

interface DeleteCompanyResponse {
  deleteFromcompaniesCollection: {
    affectedCount: number
  }
}

interface DeleteUserCompaniesResponse {
  deleteFromuser_companiesCollection: {
    affectedCount: number
  }
}

export function useMutateCompany() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const [data, setData] = useState<Company | null>(null)

  const insert = async (input: CreateCompanyInput): Promise<Company> => {
    setIsLoading(true)
    setError(null)
    try {
      const client = await getGraphQLClient()
      const variables = {
        objects: [{
          name: input.name,
          slug: input.slug,
          key: input.slug,
          logo_url: input.logo_url ?? null,
          primary_color: input.primary_color ?? '#001f3f',
          secondary_color: input.secondary_color ?? '#0074D9',
          accent_color: input.accent_color ?? '#FF4136',
          visible: true,
          enabled: true
        }]
      }

      const response = await client.request<InsertCompanyResponse>(INSERT_COMPANY_MUTATION, variables)
      const company = response.insertIntocompaniesCollection.records[0]
      setData(company)
      return company
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Error al crear empresa')
      setError(error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const update = async (id: string, input: UpdateCompanyInput): Promise<Company> => {
    setIsLoading(true)
    setError(null)
    try {
      const client = await getGraphQLClient()
      const updateData: any = {}

      if (input.name !== undefined) updateData.name = input.name
      if (input.slug !== undefined) {
        updateData.slug = input.slug
        updateData.key = input.slug
      }
      if (input.logo_url !== undefined) updateData.logo_url = input.logo_url
      if (input.primary_color !== undefined) updateData.primary_color = input.primary_color
      if (input.secondary_color !== undefined) updateData.secondary_color = input.secondary_color
      if (input.accent_color !== undefined) updateData.accent_color = input.accent_color
      if (input.settings !== undefined) updateData.settings = input.settings
      if (input.visible !== undefined) updateData.visible = input.visible
      if (input.enabled !== undefined) updateData.enabled = input.enabled

      const response = await client.request<UpdateCompanyResponse>(UPDATE_COMPANY_MUTATION, {
        id,
        set: updateData
      })
      const company = response.updatecompaniesCollection.records[0]
      setData(company)
      return company
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Error al actualizar empresa')
      setError(error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const deleteCompany = async (id: string): Promise<void> => {
    setIsLoading(true)
    setError(null)
    try {
      const client = await getGraphQLClient()

      // Primero: Eliminar asignaciones deshabilitadas (enabled=false)
      await client.request<DeleteUserCompaniesResponse>(DELETE_USER_COMPANIES_MUTATION, {
        companyId: id,
        enabled: false
      })

      // Luego: Eliminar la empresa
      await client.request<DeleteCompanyResponse>(DELETE_COMPANY_MUTATION, { id })
      setData(null)
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Error al eliminar empresa')
      setError(error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const updateVisibility = async (id: string, visible: boolean): Promise<Company> => {
    setIsLoading(true)
    setError(null)
    try {
      const client = await getGraphQLClient()
      const response = await client.request<UpdateCompanyResponse>(UPDATE_COMPANY_MUTATION, {
        id,
        set: { visible }
      })
      const company = response.updatecompaniesCollection.records[0]
      setData(company)
      return company
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Error al actualizar visibilidad')
      setError(error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const updateEnabled = async (id: string, enabled: boolean): Promise<Company> => {
    setIsLoading(true)
    setError(null)
    try {
      const client = await getGraphQLClient()
      const response = await client.request<UpdateCompanyResponse>(UPDATE_COMPANY_MUTATION, {
        id,
        set: { enabled }
      })
      const company = response.updatecompaniesCollection.records[0]
      setData(company)
      return company
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
    delete: deleteCompany,
    updateVisibility,
    updateEnabled,
    isLoading,
    error,
    data,
    reset
  }
}
