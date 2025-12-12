'use client'

import { useCallback, useEffect, useState } from 'react'
import { Role } from '../types'

export function useRoles() {
  const [roles, setRoles] = useState<Role[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchRoles = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await fetch('/api/roles')
      if (!response.ok) {
        throw new Error('Failed to fetch roles')
      }

      const data = await response.json()
      setRoles(data)
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'))
      setRoles([])
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchRoles()
  }, [fetchRoles])

  return {
    roles,
    isLoading,
    error,
    refetch: fetchRoles
  }
}
