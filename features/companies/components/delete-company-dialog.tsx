'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/shared/lib/supabase/client'
import { useMutateCompany } from '@/features/companies/hooks/useMutateCompany'
import type { Company } from '../types'
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface DeleteCompanyDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  company: Company | null
  onDeleted: () => void
}

export function DeleteCompanyDialog({
  open,
  onOpenChange,
  company,
  onDeleted,
}: DeleteCompanyDialogProps) {
  const { delete: deleteCompany, isLoading: isDeleting } = useMutateCompany()
  const [error, setError] = useState<string | null>(null)
  const [technicalError, setTechnicalError] = useState<string | null>(null)
  const [associatedUsers, setAssociatedUsers] = useState<string[]>([])
  const [showTechnicalDetails, setShowTechnicalDetails] = useState(false)
  const [checkingRestrictions, setCheckingRestrictions] = useState(false)
  const [hasRestrictions, setHasRestrictions] = useState(false)
  const [disabledAssignmentsCount, setDisabledAssignmentsCount] = useState(0)
  const [infoMessage, setInfoMessage] = useState<string | null>(null)

  // Validar restricciones cuando se abre el diálogo
  useEffect(() => {
    if (open && company) {
      checkForeignKeyRestrictions()
    } else {
      // Limpiar estados cuando se cierra
      setError(null)
      setTechnicalError(null)
      setAssociatedUsers([])
      setShowTechnicalDetails(false)
      setHasRestrictions(false)
      setDisabledAssignmentsCount(0)
      setInfoMessage(null)
    }
  }, [open, company])

  const checkForeignKeyRestrictions = async () => {
    if (!company) return

    setCheckingRestrictions(true)
    setError(null)
    setTechnicalError(null)
    setAssociatedUsers([])
    setInfoMessage(null)
    setDisabledAssignmentsCount(0)

    try {
      const supabase = createClient()

      // Obtener asignaciones ACTIVAS (enabled=true)
      const { data: activeUserCompanies, error: activeQueryError } = await supabase
        .from('user_companies')
        .select('profile_id, enabled')
        .eq('company_id', company.id)
        .eq('enabled', true)

      if (activeQueryError) {
        console.error('Error querying active user_companies:', activeQueryError)
        setHasRestrictions(false)
        setCheckingRestrictions(false)
        return
      }

      // Obtener TODAS las asignaciones para contar las deshabilitadas
      const { data: allUserCompanies, error: allQueryError } = await supabase
        .from('user_companies')
        .select('profile_id, enabled')
        .eq('company_id', company.id)

      if (allQueryError) {
        console.error('Error querying all user_companies:', allQueryError)
      }

      const disabledCount = allUserCompanies?.filter((uc: any) => !uc.enabled).length || 0

      // Si hay usuarios con asignaciones activas, bloquear eliminación
      if (activeUserCompanies && activeUserCompanies.length > 0) {
        const userIds = activeUserCompanies.map((uc: any) => uc.profile_id)

        const { data: profiles, error: profilesError } = await supabase
          .from('profiles')
          .select('fullName, email')
          .in('id', userIds)

        if (profilesError) {
          console.error('Error querying profiles:', profilesError)
        }

        const users = profiles?.map((p: any) => p.fullName || p.email || 'Usuario sin nombre')
          .filter((name: string) => name !== 'Usuario sin nombre') || []

        if (users.length > 0) {
          setAssociatedUsers(users)
          setError(`Para eliminar la empresa "${company.name}" primero debe desasociar los siguientes usuarios desde el módulo de Usuarios:`)
          setHasRestrictions(true)
        } else {
          setHasRestrictions(false)
        }
      } else {
        // No hay asignaciones activas
        setHasRestrictions(false)

        // Si hay asignaciones deshabilitadas, mostrar mensaje informativo
        if (disabledCount > 0) {
          setDisabledAssignmentsCount(disabledCount)
          setInfoMessage(`Esta empresa tiene ${disabledCount} asignación${disabledCount > 1 ? 'es' : ''} deshabilitada${disabledCount > 1 ? 's' : ''} que ${disabledCount > 1 ? 'serán eliminadas' : 'será eliminada'} automáticamente.`)
        }
      }
    } catch (err) {
      console.error('Exception checking restrictions:', err)
      setHasRestrictions(false)
    } finally {
      setCheckingRestrictions(false)
    }
  }

  const handleDelete = async () => {
    if (!company || hasRestrictions) return

    setError(null)
    setTechnicalError(null)

    try {
      await deleteCompany(company.id)
      onDeleted()
      onOpenChange(false)
    } catch (err: any) {
      const errorMessage = err?.message || err?.msg || 'Error al eliminar empresa'
      setTechnicalError(errorMessage)
      setError('Error al eliminar la empresa.')
      console.error('Error deleting company:', errorMessage)
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="bg-white">
        <AlertDialogHeader>
          <AlertDialogTitle>Eliminar Empresa</AlertDialogTitle>
          <AlertDialogDescription>
            ¿Estás seguro de que quieres eliminar la empresa "{company?.name}"? Esta acción no se puede deshacer.
          </AlertDialogDescription>
        </AlertDialogHeader>

        {error && (
          <div className="space-y-3">
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>

            {associatedUsers.length > 0 && (
              <ul className="list-disc list-inside text-sm space-y-1 pl-4">
                {associatedUsers.map((user, idx) => (
                  <li key={idx}>{user}</li>
                ))}
              </ul>
            )}

            {technicalError && (
              <div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowTechnicalDetails(!showTechnicalDetails)}
                >
                  {showTechnicalDetails ? 'Ocultar' : 'Más'} información técnica
                </Button>

                {showTechnicalDetails && (
                  <Alert variant="destructive" className="mt-2">
                    <AlertDescription className="font-mono text-xs">
                      {technicalError}
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            )}
          </div>
        )}

        {infoMessage && (
          <Alert className="border-blue-200 bg-blue-50">
            <AlertDescription className="text-blue-900">{infoMessage}</AlertDescription>
          </Alert>
        )}

        <AlertDialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isDeleting || checkingRestrictions}
          >
            Cancelar
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={isDeleting || checkingRestrictions || hasRestrictions}
          >
            {checkingRestrictions ? 'Verificando...' : isDeleting ? 'Eliminando...' : 'Eliminar'}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
