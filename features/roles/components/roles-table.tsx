'use client'

import { useCallback, useState } from 'react'
import { useRoles } from '@/features/roles/hooks'
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
import { RoleDialog } from './role-dialog'
import { DeleteRoleDialog } from './delete-role-dialog'
import { Plus } from 'lucide-react'

export function RolesTable() {
  const { roles, isLoading, refetch } = useRoles()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedRole, setSelectedRole] = useState<Role | null>(null)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

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
        <Input
          placeholder="Buscar por nombre o descripción..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="flex-1"
        />
        <Button onClick={handleCreateClick} className="bg-gray-900 hover:bg-gray-800 text-white">
          <Plus className="w-4 h-4 mr-2" />
          Crear Rol
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
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Descripción</TableHead>
                <TableHead>Fecha Creación</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRoles.map(role => (
                <TableRow key={role.id}>
                  <TableCell className="font-medium">{role.name}</TableCell>
                  <TableCell className="text-gray-600">{role.description}</TableCell>
                  <TableCell className="text-sm text-gray-500">
                    {new Date(role.created_at || role.created || '').toLocaleDateString('es-ES')}
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEditClick(role)}
                      className="h-8 w-8"
                    >
                      <svg
                        className="h-4 w-4"
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
                      onClick={() => handleDeleteClick(role)}
                      className="h-8 w-8"
                    >
                      <svg
                        className="h-4 w-4"
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
    </div>
  )
}
