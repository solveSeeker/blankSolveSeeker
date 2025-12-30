'use client'

import { useState } from 'react'
import { AlertDialog, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { type Profile } from '@/features/users/hooks/useProfiles'

interface DeleteUserDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  user?: Profile | null
  onDeleted: () => void
}

export function DeleteUserDialog({ open, onOpenChange, user, onDeleted }: DeleteUserDialogProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleDelete = async () => {
    if (!user) return

    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/admin/users/${user.id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Error al eliminar usuario')
      }

      onOpenChange(false)
      onDeleted()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al eliminar usuario')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="bg-white">
        <AlertDialogHeader>
          <AlertDialogTitle>¿Eliminar usuario?</AlertDialogTitle>
          <AlertDialogDescription>
            ¿Estás seguro de que deseas eliminar a {user?.fullName}? Esta acción no se puede deshacer.
          </AlertDialogDescription>
        </AlertDialogHeader>
        {error && (
          <div className="text-destructive text-sm">
            {error}
          </div>
        )}
        <AlertDialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={loading}
          >
            {loading ? 'Eliminando...' : 'Eliminar'}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
