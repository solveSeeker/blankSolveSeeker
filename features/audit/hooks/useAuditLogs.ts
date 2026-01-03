'use client'

import { useEffect, useState } from 'react'
import { gql } from 'graphql-request'
import { getGraphQLClient } from '@/shared/lib/graphql/client'
import { AuditLog } from '../types/audit.types'

const GET_AUDIT_LOGS_QUERY = gql`
  query GetAuditLogs($first: Int!, $offset: Int!, $filter: AuditLogFilter) {
    auditLogCollection(
      first: $first
      offset: $offset
      filter: $filter
      orderBy: { updated: DescNullsLast }
    ) {
      totalCount
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
        startCursor
        endCursor
      }
    }
  }
`

interface AuditLogsResponse {
  auditLogCollection: {
    totalCount: number
    edges: Array<{
      node: AuditLog
    }>
    pageInfo: {
      hasNextPage: boolean
      hasPreviousPage: boolean
      startCursor: string | null
      endCursor: string | null
    }
  }
}

interface UseAuditLogsParams {
  page?: number
  pageSize?: number
  searchTerm?: string
}

export function useAuditLogs({ page = 1, pageSize = 10, searchTerm = '' }: UseAuditLogsParams = {}) {
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([])
  const [totalCount, setTotalCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchAuditLogs()
  }, [page, pageSize, searchTerm])

  const fetchAuditLogs = async () => {
    try {
      setIsLoading(true)
      const graphqlClient = await getGraphQLClient()

      const offset = (page - 1) * pageSize

      // Construir filtro si hay término de búsqueda
      const filter = searchTerm
        ? {
            or: [
              { nameTable: { ilike: `%${searchTerm}%` } },
              { userIdentifier: { ilike: `%${searchTerm}%` } }
            ]
          }
        : undefined

      // Obtener datos paginados y totalCount usando GraphQL
      const data = await graphqlClient.request<AuditLogsResponse>(GET_AUDIT_LOGS_QUERY, {
        first: pageSize,
        offset: offset,
        filter: filter
      })

      // Extraer totalCount directamente del GraphQL response
      setTotalCount(data.auditLogCollection.totalCount)

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
      setTotalCount(0)
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
