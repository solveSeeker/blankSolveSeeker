'use client'

import { useState } from 'react'
import { useAuditLogs } from '@/features/audit/hooks/useAuditLogs'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { Empty } from '@/components/ui/empty'
import { Search, Eye } from 'lucide-react'
import { AuditDiffDialog } from './audit-diff-dialog'
import type { AuditLog } from '../types/audit.types'

export function AuditLogsTable() {
  const { auditLogs, isLoading, error } = useAuditLogs()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)

  const filteredLogs = auditLogs
    .filter(log => {
      const searchLower = searchTerm.toLowerCase()
      return (
        log.nameTable?.toLowerCase().includes(searchLower) ||
        log.userIdentifier?.toLowerCase().includes(searchLower)
      )
    })
    .sort((a, b) => {
      // Ordenar por fecha descendente (más reciente primero)
      const dateA = a.updated ? new Date(a.updated).getTime() : 0
      const dateB = b.updated ? new Date(b.updated).getTime() : 0
      return dateB - dateA
    })

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '-'
    const date = new Date(dateStr)
    return date.toLocaleString('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
  }

  const handleViewDiff = (log: AuditLog) => {
    setSelectedLog(log)
    setDialogOpen(true)
  }

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="flex gap-2">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Buscar por tabla o usuario..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 border-gray-200"
          />
        </div>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      ) : error ? (
        <div className="text-destructive text-sm">
          Error al cargar registros de auditoría: {error}
        </div>
      ) : filteredLogs.length === 0 ? (
        <Empty title="No hay registros de auditoría" />
      ) : (
        <div className="rounded-lg border border-gray-200 overflow-hidden">
          <Table>
            <TableHeader className="bg-gray-900">
              <TableRow className="hover:bg-gray-900 h-12">
                <TableHead className="text-white">Fecha</TableHead>
                <TableHead className="text-white">Tabla</TableHead>
                <TableHead className="text-white">Usuario</TableHead>
                <TableHead className="text-white"></TableHead>
                <TableHead className="text-white">Cambios</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLogs.map((log, index) => (
                <TableRow key={log.id} className={`h-auto border-0 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-100'}`}>
                  <TableCell className="text-sm text-gray-600 whitespace-nowrap">
                    {formatDate(log.updated)}
                  </TableCell>
                  <TableCell className="font-medium">{log.nameTable || '-'}</TableCell>
                  <TableCell className="text-sm text-gray-600 font-mono text-xs">
                    {log.userIdentifier || '-'}
                  </TableCell>
                  <TableCell className="text-sm text-gray-600 font-mono text-xs">
                    {log.currentUser || '-'}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleViewDiff(log)}
                      className="h-8 w-8"
                      title="Ver cambios"
                    >
                      <Eye className="h-5 w-5" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Diff Dialog */}
      <AuditDiffDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        diff={selectedLog?.diff || null}
        tableName={selectedLog?.nameTable || null}
        updated={selectedLog?.updated || null}
        userIdentifier={selectedLog?.userIdentifier || null}
      />
    </div>
  )
}
