import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Role } from '../types'

interface HideRoleDialogProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  role: Role | null
  isHiding: boolean
  onConfirm: () => void
}

export function HideRoleDialog({
  isOpen,
  onOpenChange,
  role,
  isHiding,
  onConfirm
}: HideRoleDialogProps) {
  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent className="sm:max-w-md bg-white">
        <AlertDialogHeader>
          <AlertDialogTitle>Ocultar Rol</AlertDialogTitle>
          <AlertDialogDescription>
            ¿Estás seguro de que deseas ocultar el rol <strong>{role?.name}</strong>?
            <br />
            <br />
            Este rol dejará de aparecer en tu vista, pero los administradores del sistema
            podrán verlo y reactivarlo cuando sea necesario.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isHiding}>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={isHiding}
            className="bg-orange-600 hover:bg-orange-700"
          >
            {isHiding ? 'Ocultando...' : 'Ocultar'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
