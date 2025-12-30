'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/shared/lib/supabase/client'
import { Role } from '@/features/roles/types'
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'

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
    if (isOpen && role) {
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
  }, [isOpen, role])

  const checkForeignKeyRestrictions = async () => {
    if (!role) return

    setCheckingRestrictions(true)
    setError(null)
    setTechnicalError(null)
    setAssociatedUsers([])
    setInfoMessage(null)
    setDisabledAssignmentsCount(0)

    try {
      const supabase = createClient()

      // Obtener asignaciones ACTIVAS (enabled=true)
      const { data: activeUserRoles, error: activeQueryError } = await supabase
        .from('user_roles')
        .select('user_id, enabled')
        .eq('role_id', role.id)
        .eq('enabled', true)

      if (activeQueryError) {
        console.error('Error querying active user_roles:', activeQueryError)
        setHasRestrictions(false)
        setCheckingRestrictions(false)
        return
      }

      // Obtener TODAS las asignaciones para contar las deshabilitadas
      const { data: allUserRoles, error: allQueryError } = await supabase
        .from('user_roles')
        .select('user_id, enabled')
        .eq('role_id', role.id)

      if (allQueryError) {
        console.error('Error querying all user_roles:', allQueryError)
      }

      const disabledCount = allUserRoles?.filter((ur: any) => !ur.enabled).length || 0

      // Si hay usuarios con asignaciones activas, bloquear eliminación
      if (activeUserRoles && activeUserRoles.length > 0) {
        const userIds = activeUserRoles.map((ur: any) => ur.user_id)

        const { data: profiles, error: profilesError } = await supabase
          .from('profiles')
          .select('fullName, email')
          .in('id', userIds)

        if (profilesError) {
          console.error('Error querying profiles:', profilesError)
          setHasRestrictions(false)
        } else if (profiles && profiles.length > 0) {
          const users = profiles
            .map((p: any) => p.fullName || p.email || 'Usuario sin nombre')
            .filter((name: string) => name !== 'Usuario sin nombre')

          if (users.length > 0) {
            setAssociatedUsers(users)
            setError(`Para eliminar el rol "${role.name}" primero debe desasociar los siguientes usuarios desde el módulo de Usuarios:`)
            setHasRestrictions(true)
          } else {
            setHasRestrictions(false)
          }
        } else {
          setHasRestrictions(false)
        }
      } else {
        // No hay asignaciones activas
        setHasRestrictions(false)

        // Si hay asignaciones deshabilitadas, mostrar mensaje informativo
        if (disabledCount > 0) {
          setDisabledAssignmentsCount(disabledCount)
          setInfoMessage(`Este rol tiene ${disabledCount} asignación${disabledCount > 1 ? 'es' : ''} deshabilitada${disabledCount > 1 ? 's' : ''} que ${disabledCount > 1 ? 'serán eliminadas' : 'será eliminada'} automáticamente.`)
        }
      }
    } catch (err) {
      console.error('Exception checking restrictions:', err)
      setHasRestrictions(false)
    } finally {
      setCheckingRestrictions(false)
    }
  }

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
            onClick={onConfirm}
            disabled={isDeleting || checkingRestrictions || hasRestrictions}
          >
            {checkingRestrictions ? 'Verificando...' : isDeleting ? 'Eliminando...' : 'Eliminar'}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
