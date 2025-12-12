'use client'

import { useState } from 'react'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { createClient } from '@/shared/lib/supabase/client'
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
      const supabase = createClient()

      const { error: deleteError } = await supabase
        .from('profiles')
        .delete()
        .eq('id', user.id)

      if (deleteError) throw deleteError

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
      <AlertDialogContent>
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
        <div className="flex gap-2 justify-end">
          <AlertDialogCancel disabled={loading}>
            Cancelar
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={loading}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {loading ? 'Eliminando...' : 'Eliminar'}
          </AlertDialogAction>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  )
}
