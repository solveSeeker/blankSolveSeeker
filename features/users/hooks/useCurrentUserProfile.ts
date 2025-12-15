import { useEffect, useState } from 'react'
import { gql } from 'graphql-request'
import { getGraphQLClient } from '@/shared/lib/graphql/client'
import { createClient } from '@/shared/lib/supabase/client'

export interface CurrentUserProfile {
  id: string
  email: string
  fullName: string | null
  is_sysadmin: boolean
}

const GET_CURRENT_USER_PROFILE_QUERY = gql`
  query GetCurrentUserProfile($userId: UUID!) {
    profilesCollection(filter: { id: { eq: $userId } }) {
      edges {
        node {
          id
          email
          fullName
          is_sysadmin
        }
      }
    }
  }
`

interface CurrentUserProfileResponse {
  profilesCollection: {
    edges: Array<{
      node: CurrentUserProfile
    }>
  }
}

export function useCurrentUserProfile() {
  const [profile, setProfile] = useState<CurrentUserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchCurrentUserProfile()
  }, [])

  const fetchCurrentUserProfile = async () => {
    try {
      setIsLoading(true)

      // Get current user from Supabase Auth
      const supabase = createClient()
      const { data: { user }, error: authError } = await supabase.auth.getUser()

      if (authError || !user) {
        throw new Error('No authenticated user')
      }

      // Fetch user profile via GraphQL
      const client = await getGraphQLClient()
      const data = await client.request<CurrentUserProfileResponse>(
        GET_CURRENT_USER_PROFILE_QUERY,
        { userId: user.id }
      )

      const userProfile = data.profilesCollection.edges[0]?.node
      if (userProfile) {
        setProfile(userProfile)
        setError(null)
      } else {
        throw new Error('Profile not found')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar perfil del usuario')
      setProfile(null)
    } finally {
      setIsLoading(false)
    }
  }

  return {
    profile,
    isLoading,
    error,
    isSysAdmin: profile?.is_sysadmin || false,
  }
}
