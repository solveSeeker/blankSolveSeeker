import { useEffect, useState } from 'react'
import { gql } from 'graphql-request'
import { getGraphQLClient } from '@/shared/lib/graphql/client'

export interface Profile {
  id: string
  email: string
  fullName: string | null
  avatarURL: string | null
  is_active: boolean
  is_sysadmin: boolean
  created_at: string
}

const GET_PROFILES_QUERY = gql`
  query GetProfiles {
    profilesCollection(orderBy: { created_at: DescNullsLast }) {
      edges {
        node {
          id
          email
          fullName
          avatarURL
          is_active
          is_sysadmin
          created_at
        }
      }
    }
  }
`

interface ProfilesResponse {
  profilesCollection: {
    edges: Array<{
      node: Profile
    }>
  }
}

export function useProfiles() {
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchProfiles()
  }, [])

  const fetchProfiles = async () => {
    try {
      setIsLoading(true)
      const client = await getGraphQLClient()

      const data = await client.request<ProfilesResponse>(GET_PROFILES_QUERY)

      const profilesList = data.profilesCollection.edges.map((edge) => edge.node)
      setProfiles(profilesList)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar perfiles')
      setProfiles([])
    } finally {
      setIsLoading(false)
    }
  }

  return {
    profiles,
    isLoading,
    error,
    refetch: fetchProfiles,
  }
}
