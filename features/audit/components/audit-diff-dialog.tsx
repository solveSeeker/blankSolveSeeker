'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

interface AuditDiffDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  diff: Record<string, any> | null
  tableName: string | null
  updated: string | null
  userIdentifier: string | null
}

export function AuditDiffDialog({ open, onOpenChange, diff, tableName, updated, userIdentifier }: AuditDiffDialogProps) {
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
  // Procesar el diff para convertirlo en un array de cambios
  const parseChanges = (diffObj: Record<string, any> | null) => {
    if (!diffObj) return []

    const changes: Array<{ field: string; oldValue: string; newValue: string }> = []

    Object.keys(diffObj).forEach((key) => {
      const value = diffObj[key]

      // Si el valor tiene estructura {old, new}
      if (value && typeof value === 'object' && ('old' in value || 'new' in value)) {
        changes.push({
          field: key,
          oldValue: formatValue(value.old),
          newValue: formatValue(value.new)
        })
      }
      // Si es un objeto anidado, procesarlo recursivamente
      else if (value && typeof value === 'object') {
        const nestedChanges = parseChanges(value)
        nestedChanges.forEach((change) => {
          changes.push({
            field: `${key}.${change.field}`,
            oldValue: change.oldValue,
            newValue: change.newValue
          })
        })
      }
    })

    return changes
  }

  const formatValue = (value: any): string => {
    if (value === null || value === undefined) {
      return '-'
    }
    if (typeof value === 'boolean') {
      return value ? 'Sí' : 'No'
    }
    if (typeof value === 'object') {
      return JSON.stringify(value, null, 2)
    }
    return String(value)
  }

  const formatFieldName = (field: string): string => {
    // Convertir camelCase o snake_case a palabras legibles
    return field
      .replace(/([A-Z])/g, ' $1')
      .replace(/_/g, ' ')
      .replace(/\./g, ' → ')
      .trim()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
  }

  const changes = parseChanges(diff)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] bg-white">
        <DialogHeader>
          <DialogTitle>Detalles del Cambio</DialogTitle>
          <div className="mt-2 space-y-1">
            <p className="text-sm text-gray-400">
              Tabla: <span className="font-medium text-gray-600">{tableName || '-'}</span>
            </p>
            <p className="text-sm text-gray-400">
              Fecha: <span className="font-medium text-gray-600">{formatDate(updated)}</span>
            </p>
            <p className="text-sm text-gray-400">
              Usuario: <span className="font-medium text-gray-600 font-mono text-xs">{userIdentifier || '-'}</span>
            </p>
          </div>
        </DialogHeader>

        <div className="py-4">
          {changes.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-8">
              No hay cambios para mostrar
            </p>
          ) : (
            <div className="rounded-lg border border-gray-200 overflow-hidden">
              <Table>
                <TableHeader className="bg-gray-900">
                  <TableRow className="hover:bg-gray-900">
                    <TableHead className="text-white w-1/3">Campo</TableHead>
                    <TableHead className="text-white w-1/3">Valor Anterior</TableHead>
                    <TableHead className="text-white w-1/3">Valor Nuevo</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {changes.map((change, index) => (
                    <TableRow
                      key={index}
                      className={`border-0 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-100'}`}
                    >
                      <TableCell className="font-medium text-sm">
                        {formatFieldName(change.field)}
                      </TableCell>
                      <TableCell className="text-sm text-gray-600">
                        <div className="max-w-xs break-words">
                          {change.oldValue}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-gray-600">
                        <div className="max-w-xs break-words font-medium text-gray-900">
                          {change.newValue}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
