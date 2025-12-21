import { useEffect, useState } from 'react'
import { gql } from 'graphql-request'
import { getGraphQLClient } from '@/shared/lib/graphql/client'

export interface UserCompany {
    user_id: string
    company_id: string
    company_name?: string
    role?: string
    is_active?: boolean
}

const GET_USER_COMPANIES_QUERY = gql`
  query GetUserCompanies {
    user_companiesCollection {
      edges {
        node {
          profile_id
          company_id
          role
          is_active
          companies {
            name
          }
        }
      }
    }
  }
`

interface UserCompaniesResponse {
    user_companiesCollection: {
        edges: Array<{
            node: {
                profile_id: string
                company_id: string
                role: string
                is_active: boolean
                companies: {
                    name: string
                } | null
            }
        }>
    }
}

export function useUserCompanies() {
    const [userCompanies, setUserCompanies] = useState<UserCompany[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        fetchUserCompanies()
    }, [])

    const fetchUserCompanies = async () => {
        try {
            setIsLoading(true)
            const client = await getGraphQLClient()

            const data = await client.request<UserCompaniesResponse>(GET_USER_COMPANIES_QUERY)

            const mappedData = data.user_companiesCollection.edges.map((edge) => ({
                user_id: edge.node.profile_id,
                company_id: edge.node.company_id,
                company_name: edge.node.companies?.name || 'unknown',
                role: edge.node.role,
                is_active: edge.node.is_active,
            }))

            setUserCompanies(mappedData)
            setError(null)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error al cargar empresas de usuarios')
            setUserCompanies([])
        } finally {
            setIsLoading(false)
        }
    }

    const getCompaniesForUser = (userId: string): string[] => {
        return userCompanies
            .filter((uc) => uc.user_id === userId && uc.is_active)
            .map((uc) => uc.company_name || 'unknown')
    }

    const getActiveCompaniesCount = (userId: string): number => {
        return userCompanies.filter(
            (uc) => uc.user_id === userId && uc.is_active === true
        ).length
    }

    return {
        userCompanies,
        isLoading,
        error,
        getCompaniesForUser,
        getActiveCompaniesCount,
        refetch: fetchUserCompanies,
    }
}
