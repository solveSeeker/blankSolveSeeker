'use client'

import { useCallback, useState } from 'react'
import { useRoles } from '@/features/roles/hooks'
import { useProfiles } from '@/features/users/hooks/useProfiles'
import { useUserRoles } from '@/features/users/hooks/useUserRoles'
import { useCurrentUserProfile } from '@/features/users/hooks/useCurrentUserProfile'
import { roleService } from '@/features/roles/services'
import { Role } from '@/features/roles/types'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { RoleDialog } from './role-dialog'
import { DeleteRoleDialog } from './delete-role-dialog'
import { HideRoleDialog } from './hide-role-dialog'
import { Plus, Search, Users, Eye, EyeOff, Check, X } from 'lucide-react'

export function RolesTable() {
  const { roles, isLoading, refetch } = useRoles()
  const { profiles } = useProfiles()
  const { userRoles } = useUserRoles()
  const { isSysAdmin } = useCurrentUserProfile()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedRole, setSelectedRole] = useState<Role | null>(null)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isHideDialogOpen, setIsHideDialogOpen] = useState(false)
  const [isHiding, setIsHiding] = useState(false)
  const [isToggling, setIsToggling] = useState(false)

  // Helper function to count active users for a role
  const getActiveUserCountForRole = (roleId: string): number => {
    return userRoles.filter(
      (ur) => ur.role_id === roleId && ur.visible === true && ur.enabled === true
    ).length
  }

  const filteredRoles = roles.filter(role =>
    role.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    role.description.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleCreateClick = () => {
    setSelectedRole(null)
    setIsCreateDialogOpen(true)
  }

  const handleEditClick = (role: Role) => {
    setSelectedRole(role)
    setIsEditDialogOpen(true)
  }

  const handleDeleteClick = (role: Role) => {
    setSelectedRole(role)
    setIsDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = useCallback(async () => {
    if (!selectedRole) return

    try {
      setIsDeleting(true)
      await roleService.deleteRole(selectedRole.id)
      await refetch()
      setIsDeleteDialogOpen(false)
      setSelectedRole(null)
    } catch (error) {
      console.error('Error deleting role:', error)
    } finally {
      setIsDeleting(false)
    }
  }, [selectedRole, refetch])

  const handleCreateSuccess = useCallback(async () => {
    await refetch()
    setIsCreateDialogOpen(false)
  }, [refetch])

  const handleEditSuccess = useCallback(async () => {
    await refetch()
    setIsEditDialogOpen(false)
    setSelectedRole(null)
  }, [refetch])

  const handleToggleVisible = useCallback(async (role: Role) => {
    if (!isSysAdmin) return

    try {
      setIsToggling(true)
      await roleService.updateVisibility(role.id, !role.visible)
      await refetch()
    } catch (error) {
      console.error('Error toggling visible:', error)
    } finally {
      setIsToggling(false)
    }
  }, [isSysAdmin, refetch])

  const handleToggleEnabled = useCallback(async (role: Role) => {
    try {
      setIsToggling(true)
      await roleService.updateEnabled(role.id, !role.enabled)
      await refetch()
    } catch (error) {
      console.error('Error toggling enabled:', error)
    } finally {
      setIsToggling(false)
    }
  }, [refetch])

  const handleVisibilityButtonClick = useCallback((role: Role) => {
    if (isSysAdmin) {
      // SysAdmin: Toggle inmediato sin confirmación
      handleToggleVisible(role)
    } else {
      // Usuario común: Abrir diálogo de confirmación
      setSelectedRole(role)
      setIsHideDialogOpen(true)
    }
  }, [isSysAdmin, handleToggleVisible])

  const handleHideConfirm = useCallback(async () => {
    if (!selectedRole) return

    try {
      setIsHiding(true)
      await roleService.hideRole(selectedRole.id)
      await refetch()
      setIsHideDialogOpen(false)
      setSelectedRole(null)
    } catch (error) {
      console.error('Error hiding role:', error)
    } finally {
      setIsHiding(false)
    }
  }, [selectedRole, refetch])

  if (isLoading) {
    return (
      <div className="space-y-4 p-6">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  return (
    <div className="space-y-4 p-6">
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Buscar por nombre o descripción..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="pl-10 border-gray-200"
          />
        </div>
        <Button onClick={handleCreateClick} className="bg-gray-900 hover:bg-gray-800 text-white">
          <Plus className="w-4 h-4 mr-2" />
          Rol
        </Button>
      </div>

      {filteredRoles.length === 0 ? (
        <div className="rounded-lg border border-gray-200 p-8 text-center">
          <p className="text-gray-500">
            {searchTerm ? 'No se encontraron roles' : 'No hay roles creados aún'}
          </p>
        </div>
      ) : (
        <div className="rounded-lg border border-gray-200 overflow-hidden">
          <Table>
            <TableHeader className="bg-gray-900">
              <TableRow className="hover:bg-gray-900 h-12">
                <TableHead className="text-white">Nombre</TableHead>
                <TableHead className="text-white">Descripción</TableHead>
                <TableHead className="text-white">Jerarquía</TableHead>
                <TableHead className="text-white">Usuarios</TableHead>
                <TableHead className="text-white">Estado</TableHead>
                <TableHead className="text-white">Fecha Creación</TableHead>
                <TableHead className="text-right text-white">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRoles.map((role, index) => (
                <TableRow key={role.id} className={`h-12 border-0 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-100'}`}>
                  <TableCell className="font-medium">{role.name}</TableCell>
                  <TableCell className="text-gray-600">{role.description}</TableCell>
                  <TableCell className="text-center">
                    {role.hrchy !== null && role.hrchy !== undefined ? (
                      <span className="font-medium">{role.hrchy}</span>
                    ) : (
                      <span className="text-gray-400 text-sm">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-gray-500" />
                      <span className="font-medium">{getActiveUserCountForRole(role.id)}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <button
                      onClick={() => handleToggleEnabled(role)}
                      disabled={isToggling}
                      className="hover:opacity-70 transition-opacity"
                      title={role.enabled ? 'Activo' : 'Inactivo'}
                    >
                      {role.enabled ? (
                        <Check className="h-4 w-4 text-green-600" />
                      ) : (
                        <X className="h-4 w-4 text-gray-400" />
                      )}
                    </button>
                  </TableCell>
                  <TableCell className="text-sm text-gray-500">
                    {new Date(role.created_at || role.created || '').toLocaleDateString('es-ES')}
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEditClick(role)}
                      className="h-8 w-8"
                      title="Editar"
                    >
                      <svg
                        className="h-5 w-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                        />
                      </svg>
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleVisibilityButtonClick(role)}
                      className="h-8 w-8"
                      title={isSysAdmin ? (role.visible ? 'Ocultar' : 'Mostrar') : 'Ocultar'}
                    >
                      {isSysAdmin ? (
                        role.visible ? (
                          <Eye className="h-5 w-5" />
                        ) : (
                          <EyeOff className="h-5 w-5" />
                        )
                      ) : (
                        <svg
                          className="h-5 w-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      )}
                    </Button>
                    {isSysAdmin && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteClick(role)}
                        className="h-8 w-8"
                        title="Eliminar"
                      >
                        <svg
                          className="h-5 w-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <RoleDialog
        isOpen={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        role={null}
        onSuccess={handleCreateSuccess}
      />

      <RoleDialog
        isOpen={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        role={selectedRole}
        onSuccess={handleEditSuccess}
      />

      <DeleteRoleDialog
        isOpen={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        role={selectedRole}
        isDeleting={isDeleting}
        onConfirm={handleDeleteConfirm}
      />

      <HideRoleDialog
        isOpen={isHideDialogOpen}
        onOpenChange={setIsHideDialogOpen}
        role={selectedRole}
        isHiding={isHiding}
        onConfirm={handleHideConfirm}
      />
    </div>
  )
}
