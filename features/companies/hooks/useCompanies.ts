import { useEffect, useState } from 'react'
import { gql } from 'graphql-request'
import { getGraphQLClient } from '@/shared/lib/graphql/client'
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
  const [companies, setCompanies] = useState<Company[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchCompanies()
  }, [])

  const fetchCompanies = async () => {
    try {
      setIsLoading(true)
      const client = await getGraphQLClient()

      const data = await client.request<CompaniesResponse>(GET_COMPANIES_QUERY)

      const companiesList = data.companiesCollection.edges.map((edge) => edge.node)
      setCompanies(companiesList)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar empresas')
      setCompanies([])
    } finally {
      setIsLoading(false)
    }
  }

  return {
    companies,
    isLoading,
    error,
    refetch: fetchCompanies,
  }
}
