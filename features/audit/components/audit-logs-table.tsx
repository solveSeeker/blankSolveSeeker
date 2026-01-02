'use client'

import { useState } from 'react'
import { useAuditLogs } from '@/features/audit/hooks/useAuditLogs'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { Empty } from '@/components/ui/empty'
import { Pagination } from '@/shared/components/pagination'
import { Search, Eye } from 'lucide-react'
import { AuditDiffDialog } from './audit-diff-dialog'
import type { AuditLog } from '../types/audit.types'

export function AuditLogsTable() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  const { auditLogs, totalCount, isLoading, error } = useAuditLogs({
    page: currentPage,
    pageSize: pageSize,
    searchTerm: searchTerm
  })

  // Resetear a página 1 cuando cambia la búsqueda
  const handleSearchChange = (value: string) => {
    setSearchTerm(value)
    if (currentPage !== 1) {
      setCurrentPage(1)
    }
  }

  // Manejar cambio de página
  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  // Manejar cambio de tamaño de página
  const handlePageSizeChange = (size: number) => {
    setPageSize(size)
    setCurrentPage(1) // Resetear a página 1 cuando cambia el tamaño
  }

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
    <div className="flex flex-col h-full">
      {/* Search - Fixed */}
      <div className="flex-shrink-0 px-8 py-2">
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Buscar por tabla o usuario..."
            value={searchTerm}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-10 border-gray-200"
          />
        </div>
      </div>

      {/* Table - Scrollable */}
      <div className="flex-1 overflow-hidden px-8 pb-4">
        {isLoading ? (
          <div className="space-y-2">
            {[...Array(10)].map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : error ? (
          <div className="text-destructive text-sm">
            Error al cargar registros de auditoría: {error}
          </div>
        ) : auditLogs.length === 0 ? (
          <Empty title="No hay registros de auditoría" />
        ) : (
          <div className="rounded-lg border border-gray-200 h-full flex flex-col overflow-hidden">
            {/* Header fijo - fuera del scroll */}
            <div className="flex-shrink-0">
              <Table>
                <TableHeader className="bg-gray-900">
                  <TableRow className="hover:bg-gray-900 h-12">
                    <TableHead className="text-white w-[180px]">Fecha</TableHead>
                    <TableHead className="text-white w-[150px]">Tabla</TableHead>
                    <TableHead className="text-white w-[200px]">Usuario</TableHead>
                    <TableHead className="text-white w-[120px]"></TableHead>
                    <TableHead className="text-white w-[80px]">Cambios</TableHead>
                  </TableRow>
                </TableHeader>
              </Table>
            </div>

            {/* Body con scroll */}
            <div className="flex-1 overflow-y-auto">
              <Table>
                <TableBody>
                  {auditLogs.map((log, index) => (
                    <TableRow key={log.id} className={`h-auto border-0 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-100'}`}>
                      <TableCell className="text-sm text-gray-600 whitespace-nowrap w-[180px]">
                        {formatDate(log.updated)}
                      </TableCell>
                      <TableCell className="font-medium w-[150px]">{log.nameTable || '-'}</TableCell>
                      <TableCell className="text-sm text-gray-600 font-mono text-xs w-[200px]">
                        {log.userIdentifier || '-'}
                      </TableCell>
                      <TableCell className="text-sm text-gray-600 font-mono text-xs w-[120px]">
                        {log.currentUser || '-'}
                      </TableCell>
                      <TableCell className="w-[80px]">
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
          </div>
        )}
      </div>

      {/* Pagination - Fixed Footer */}
      {totalCount > 0 && (
        <div className="flex-shrink-0 border-t border-gray-200 bg-white px-8">
          <Pagination
            currentPage={currentPage}
            totalItems={totalCount}
            pageSize={pageSize}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
          />
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
