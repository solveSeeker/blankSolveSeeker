'use client'

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

interface DisabledCompaniesWarningDialogProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  companyNames: string[]
  onConfirm: () => void
  isLoading: boolean
}

export function DisabledCompaniesWarningDialog({
  isOpen,
  onOpenChange,
  companyNames,
  onConfirm,
  isLoading
}: DisabledCompaniesWarningDialogProps) {
  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent className="sm:max-w-md bg-white">
        <AlertDialogHeader>
          <AlertDialogTitle>Advertencia: Empresas Deshabilitadas</AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-3">
              <p>
                Estás intentando quitar las siguientes empresas deshabilitadas de este usuario:
              </p>
              <ul className="list-disc pl-5 space-y-1">
                {companyNames.map(name => (
                  <li key={name} className="text-sm font-medium text-gray-700">{name}</li>
                ))}
              </ul>
              <p className="text-amber-700 font-medium">
                Las empresas deshabilitadas que quites de este usuario no podrán ser reasignadas
                ya que están inactivas en el sistema.
              </p>
              <p>
                ¿Deseas continuar?
              </p>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={isLoading}
            className="bg-amber-600 hover:bg-amber-700"
          >
            {isLoading ? 'Guardando...' : 'Sí, continuar'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
