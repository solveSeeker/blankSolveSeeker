'use client'

import { useEffect, useState } from 'react'
import { gql } from 'graphql-request'
import { getGraphQLClient } from '@/shared/lib/graphql/client'
import { AuditLog } from '../types/audit.types'

const GET_AUDIT_LOGS_QUERY = gql`
  query GetAuditLogs {
    auditLogCollection(orderBy: { updated: DescNullsLast }) {
      edges {
        node {
          id
          nameTable
          updated
          userIdentifier
          userId
          currentUser
          beforeUpdate
          idObject
          afterUpdate
          diff
        }
      }
    }
  }
`

interface AuditLogsResponse {
  auditLogCollection: {
    edges: Array<{
      node: AuditLog
    }>
  }
}

export function useAuditLogs() {
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchAuditLogs()
  }, [])

  const fetchAuditLogs = async () => {
    try {
      setIsLoading(true)
      const client = await getGraphQLClient()

      const data = await client.request<AuditLogsResponse>(GET_AUDIT_LOGS_QUERY)

      // Parsear el campo diff de string a objeto JSON
      const logsList = data.auditLogCollection.edges.map((edge) => {
        const node = edge.node
        let parsedDiff = node.diff

        // Si diff es un string, parsearlo a JSON
        if (typeof node.diff === 'string' && node.diff) {
          try {
            parsedDiff = JSON.parse(node.diff)
          } catch (e) {
            console.error('Error parseando diff:', e)
            parsedDiff = null
          }
        }

        return {
          ...node,
          diff: parsedDiff
        }
      })

      setAuditLogs(logsList)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar registros de auditoría')
      setAuditLogs([])
    } finally {
      setIsLoading(false)
    }
  }

  return {
    auditLogs,
    isLoading,
    error,
    refetch: fetchAuditLogs,
  }
}
