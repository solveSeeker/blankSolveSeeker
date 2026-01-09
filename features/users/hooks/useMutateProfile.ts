import { useState } from 'react'
import { gql } from 'graphql-request'
import { getGraphQLClient } from '@/shared/lib/graphql/client'

// GraphQL Mutation
const UPDATE_PROFILE_MUTATION = gql`
  mutation UpdateProfile($id: UUID!, $set: profilesUpdateInput!) {
    updateprofilesCollection(filter: { id: { eq: $id } }, set: $set) {
      affectedCount
      records {
        id
        email
        fullName
        avatarURL
        is_active
        is_sysadmin
        created
      }
    }
  }
`

interface Profile {
  id: string
  email: string
  fullName: string | null
  avatarURL: string | null
  is_active: boolean
  is_sysadmin: boolean
  created: string
}

interface UpdateProfileResponse {
  updateprofilesCollection: {
    affectedCount: number
    records: Profile[]
  }
}

interface UpdateProfileInput {
  fullName?: string | null
  avatarURL?: string | null
  is_active?: boolean
}

export function useMutateProfile() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const [data, setData] = useState<Profile | null>(null)

  const update = async (id: string, input: UpdateProfileInput): Promise<Profile> => {
    setIsLoading(true)
    setError(null)

    try {
      const client = await getGraphQLClient()

      const updateData: any = {}
      if (input.fullName !== undefined) updateData.fullName = input.fullName
      if (input.avatarURL !== undefined) updateData.avatarURL = input.avatarURL
      if (input.is_active !== undefined) updateData.is_active = input.is_active

      const response = await client.request<UpdateProfileResponse>(
        UPDATE_PROFILE_MUTATION,
        {
          id,
          set: updateData
        }
      )

      const profile = response.updateprofilesCollection.records[0]
      setData(profile)
      return profile
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Error al actualizar perfil')
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
    update,
    isLoading,
    error,
    data,
    reset
  }
}
