'use client'

import { Role } from '@/features/roles/types'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'

interface DeleteRoleDialogProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  role: Role | null
  isDeleting: boolean
  onConfirm: () => void
}

export function DeleteRoleDialog({
  isOpen,
  onOpenChange,
  role,
  isDeleting,
  onConfirm
}: DeleteRoleDialogProps) {
  if (!role) return null

  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent className="bg-white">
        <AlertDialogHeader>
          <AlertDialogTitle>Eliminar Rol</AlertDialogTitle>
          <AlertDialogDescription>
            ¿Estás seguro de que quieres eliminar el rol "{role.name}"? Esta acción no se puede deshacer.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="flex gap-3">
          <AlertDialogCancel disabled={isDeleting}>
            Cancelar
          </AlertDialogCancel>
          <Button
            variant="destructive"
            onClick={onConfirm}
            disabled={isDeleting}
          >
            {isDeleting ? 'Eliminando...' : 'Eliminar'}
          </Button>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  )
}
