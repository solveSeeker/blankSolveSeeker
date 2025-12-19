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
import { Company } from '../types'

interface HideCompanyDialogProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  company: Company | null
  isHiding: boolean
  onConfirm: () => void
}

export function HideCompanyDialog({
  isOpen,
  onOpenChange,
  company,
  isHiding,
  onConfirm
}: HideCompanyDialogProps) {
  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent className="sm:max-w-md bg-white">
        <AlertDialogHeader>
          <AlertDialogTitle>Ocultar Empresa</AlertDialogTitle>
          <AlertDialogDescription>
            ¿Estás seguro de que deseas ocultar la empresa <strong>{company?.name}</strong>?
            <br />
            <br />
            Esta empresa dejará de aparecer en tu vista, pero los administradores del sistema
            podrán verla y reactivarla cuando sea necesario.
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
