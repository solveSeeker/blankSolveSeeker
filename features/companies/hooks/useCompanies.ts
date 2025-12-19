import { useEffect, useState, useCallback } from 'react'
import { gql } from 'graphql-request'
import { getGraphQLClient } from '@/shared/lib/graphql/client'
import { useCurrentUserProfile } from '@/features/users/hooks/useCurrentUserProfile'
import type { Company } from '../types'

const GET_COMPANIES_QUERY = gql`
  query GetCompanies {
    companiesCollection(orderBy: { created: DescNullsLast }) {
      edges {
        node {
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
          updated
        }
      }
    }
  }
`

interface CompaniesResponse {
  companiesCollection: {
    edges: Array<{
      node: Company
    }>
  }
}

export function useCompanies() {
  const { isSysAdmin, isLoading: isLoadingProfile } = useCurrentUserProfile()
  const [companies, setCompanies] = useState<Company[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchCompanies = useCallback(async () => {
    try {
      setIsLoading(true)
      const client = await getGraphQLClient()

      const data = await client.request<CompaniesResponse>(GET_COMPANIES_QUERY)

      let companiesList = data.companiesCollection.edges.map((edge) => edge.node)

      // Filter by visible=true for non-sysAdmin users
      if (!isSysAdmin) {
        companiesList = companiesList.filter(company => company.visible === true)
      }

      setCompanies(companiesList)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar empresas')
      setCompanies([])
    } finally {
      setIsLoading(false)
    }
  }, [isSysAdmin])

  useEffect(() => {
    // Solo fetch cuando el perfil haya cargado
    if (!isLoadingProfile) {
      fetchCompanies()
    }
  }, [fetchCompanies, isLoadingProfile])

  return {
    companies,
    isLoading,
    error,
    refetch: fetchCompanies,
  }
}
