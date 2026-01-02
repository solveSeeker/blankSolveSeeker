'use client'

import { useEffect, useState } from 'react'
import { gql } from 'graphql-request'
import { getGraphQLClient } from '@/shared/lib/graphql/client'
import { AuditLog } from '../types/audit.types'

const GET_AUDIT_LOGS_QUERY = gql`
  query GetAuditLogs($first: Int!, $offset: Int!) {
    auditLogCollection(
      first: $first
      offset: $offset
      orderBy: { updated: DescNullsLast }
    ) {
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
      pageInfo {
        hasNextPage
        hasPreviousPage
      }
    }
  }
`

const GET_TOTAL_COUNT_QUERY = gql`
  query GetTotalAuditLogsCount {
    auditLogCollection {
      edges {
        node {
          id
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
    pageInfo: {
      hasNextPage: boolean
      hasPreviousPage: boolean
    }
  }
}

interface TotalCountResponse {
  auditLogCollection: {
    edges: Array<{ node: { id: string } }>
  }
}

interface UseAuditLogsParams {
  page?: number
  pageSize?: number
}

export function useAuditLogs({ page = 1, pageSize = 15 }: UseAuditLogsParams = {}) {
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([])
  const [totalCount, setTotalCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchAuditLogs()
  }, [page, pageSize])

  const fetchAuditLogs = async () => {
    try {
      setIsLoading(true)
      const client = await getGraphQLClient()

      const offset = (page - 1) * pageSize

      // Obtener datos paginados
      const data = await client.request<AuditLogsResponse>(GET_AUDIT_LOGS_QUERY, {
        first: pageSize,
        offset: offset
      })

      // Obtener total count (solo en la primera carga)
      if (totalCount === 0) {
        const countData = await client.request<TotalCountResponse>(GET_TOTAL_COUNT_QUERY)
        setTotalCount(countData.auditLogCollection.edges.length)
      }

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
    totalCount,
    isLoading,
    error,
    refetch: fetchAuditLogs,
  }
}
