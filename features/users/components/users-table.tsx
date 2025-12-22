'use client'

import { useEffect, useState } from 'react'
import { useProfiles, type Profile } from '@/features/users/hooks/useProfiles'
import { useUserRoles } from '@/features/users/hooks/useUserRoles'
import { useUserCompanies } from '@/features/users/hooks/useUserCompanies'
import { useCurrentUserProfile } from '@/features/users/hooks/useCurrentUserProfile'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { Empty } from '@/components/ui/empty'
import { UserDialog } from './user-dialog'
import { DeleteUserDialog } from './delete-user-dialog'
import { ManageUserCompaniesDialog } from './manage-user-companies-dialog'
import { ManageUserRolesDialog } from './manage-user-roles-dialog'
import { ChangePasswordDialog } from './change-password-dialog'
import { Plus, Search, UserCog, Shield, Check, X, KeyRound, Building2 } from 'lucide-react'

export function UsersTable() {
  const { profiles, isLoading, error, refetch } = useProfiles()
  const { getRolesForUser, userRoles, isLoading: rolesLoading, refetch: refetchRoles } = useUserRoles()
  const { getActiveCompaniesCount, refetch: refetchCompanies } = useUserCompanies()
  const { isSysAdmin, isLoading: currentUserLoading } = useCurrentUserProfile()

  // Helper function to count active roles for a user
  const getActiveRolesCount = (userId: string, isSysAdmin?: boolean): number => {
    if (isSysAdmin) return 0 // SysAdmin users don't have countable roles
    return userRoles.filter(
      (ur) => ur.user_id === userId && ur.visible === true && ur.enabled === true
    ).length
  }
  const [searchTerm, setSearchTerm] = useState('')
  const [filteredProfiles, setFilteredProfiles] = useState(profiles || [])
  const [selectedUser, setSelectedUser] = useState<Profile | null>(null)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isManageRolesDialogOpen, setIsManageRolesDialogOpen] = useState(false)
  const [isManageCompaniesDialogOpen, setIsManageCompaniesDialogOpen] = useState(false)
  const [isChangePasswordDialogOpen, setIsChangePasswordDialogOpen] = useState(false)

  useEffect(() => {
    if (profiles) {
      const filtered = profiles.filter(profile => {
        // Search filter
        const matchesSearch =
          profile.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          profile.email?.toLowerCase().includes(searchTerm.toLowerCase())

        // Visibility filter: if current user is NOT sysadmin, hide sysadmin users
        const isVisible = isSysAdmin || !profile.is_sysadmin

        return matchesSearch && isVisible
      })
      setFilteredProfiles(filtered)
    }
  }, [profiles, searchTerm, isSysAdmin])

  const handleEditUser = (user: Profile) => {
    setSelectedUser(user)
    setIsEditDialogOpen(true)
  }

  const handleDeleteUser = (user: Profile) => {
    setSelectedUser(user)
    setIsDeleteDialogOpen(true)
  }

  const handleUserSaved = () => {
    setIsCreateDialogOpen(false)
    setIsEditDialogOpen(false)
    setSelectedUser(null)
    refetch()
  }

  const handleUserDeleted = () => {
    setIsDeleteDialogOpen(false)
    setSelectedUser(null)
    refetch()
  }

  const handleManageRoles = (user: Profile) => {
    setSelectedUser(user)
    setIsManageRolesDialogOpen(true)
  }

  const handleRolesUpdated = () => {
    setIsManageRolesDialogOpen(false)
    setSelectedUser(null)
    refetch()
    refetchRoles()
  }

  const handleManageCompanies = (user: Profile) => {
    setSelectedUser(user)
    setIsManageCompaniesDialogOpen(true)
  }

  const handleCompaniesUpdated = () => {
    setIsManageCompaniesDialogOpen(false)
    setSelectedUser(null)
    refetch()
    refetchCompanies()
  }

  const handleChangePassword = (user: Profile) => {
    setSelectedUser(user)
    setIsChangePasswordDialogOpen(true)
  }

  const handleToggleActive = async (userId: string, currentIsActive: boolean) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          is_active: !currentIsActive,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Error al actualizar usuario')
      }

      // Refetch to update the UI
      refetch()
    } catch (error) {
      console.error('Error toggling user active status:', error)
      // TODO: Show error toast/notification to user
    }
  }

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="flex gap-2">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Buscar por nombre o email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 border-gray-200"
          />
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)} className="bg-gray-900 hover:bg-gray-800 text-white">
          <Plus className="w-4 h-4 mr-2" />
          Usuario
        </Button>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      ) : error ? (
        <div className="text-destructive text-sm">
          Error al cargar usuarios: {error}
        </div>
      ) : filteredProfiles.length === 0 ? (
        <Empty title="No hay usuarios" />
      ) : (
        <div className="rounded-lg border border-gray-200 overflow-hidden">
          <Table>
            <TableHeader className="bg-gray-900">
              <TableRow className="hover:bg-gray-900 h-12">
                <TableHead className="text-white">Usuario</TableHead>
                <TableHead className="text-white">Email</TableHead>
                <TableHead className="text-white">Roles</TableHead>
                <TableHead className="text-white">Empresas</TableHead>
                <TableHead className="text-white">Estado</TableHead>
                <TableHead className="text-right text-white">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProfiles.map((profile, index) => (
                <TableRow key={profile.id} className={`h-12 border-0 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-100'}`}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Avatar className="h-8 w-8">
                        {profile.avatarURL ? (
                          <AvatarImage src={profile.avatarURL} alt={profile.fullName || 'User'} />
                        ) : (
                          <AvatarFallback className="bg-gray-100">
                            <UserCog className="h-4 w-4 text-black" />
                          </AvatarFallback>
                        )}
                      </Avatar>
                      <span className="font-medium">{profile.fullName || 'Sin nombre'}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {profile.email}
                  </TableCell>
                  <TableCell>
                    {profile.is_sysadmin ? (
                      <Badge variant="outline" className="mr-1">
                        SysAdmin
                      </Badge>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{getActiveRolesCount(profile.id, profile.is_sysadmin)}</span>
                        <button
                          onClick={() => handleManageRoles(profile)}
                          className="ml-1 hover:opacity-70 transition-opacity"
                          title="Gestionar roles"
                        >
                          <Shield className="w-4 h-4 text-gray-400 flex-shrink-0" />
                        </button>
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{getActiveCompaniesCount(profile.id)}</span>
                      <button
                        onClick={() => handleManageCompanies(profile)}
                        className="ml-1 hover:opacity-70 transition-opacity"
                        title="Gestionar empresas"
                      >
                        <Building2 className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      </button>
                    </div>
                  </TableCell>
                  <TableCell>
                    <button
                      onClick={() => handleToggleActive(profile.id, profile.is_active)}
                      className="hover:opacity-70 transition-opacity"
                      title={profile.is_active ? 'Click para desactivar' : 'Click para activar'}
                    >
                      {profile.is_active ? (
                        <Check className="h-5 w-5 text-green-600" />
                      ) : (
                        <X className="h-5 w-5 text-gray-400" />
                      )}
                    </button>
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleChangePassword(profile)}
                      className="h-8 w-8"
                      title="Cambiar contraseña"
                    >
                      <KeyRound className="h-5 w-5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEditUser(profile)}
                      className="h-8 w-8"
                      title="Editar usuario"
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
                    {/* Only sysAdmin can delete users, but never the main system admin */}
                    {isSysAdmin && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteUser(profile)}
                        className="h-8 w-8"
                        title="Eliminar usuario"
                        disabled={profile.email === 'solve.seeker.dev@gmail.com'}
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

      {/* Dialogs */}
      <UserDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onSaved={handleUserSaved}
      />

      <UserDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        user={selectedUser}
        onSaved={handleUserSaved}
      />

      <DeleteUserDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        user={selectedUser}
        onDeleted={handleUserDeleted}
      />

      <ManageUserRolesDialog
        open={isManageRolesDialogOpen}
        onOpenChange={setIsManageRolesDialogOpen}
        user={selectedUser}
        onRolesUpdated={handleRolesUpdated}
      />

      <ManageUserCompaniesDialog
        open={isManageCompaniesDialogOpen}
        onOpenChange={setIsManageCompaniesDialogOpen}
        user={selectedUser}
        onCompaniesUpdated={handleCompaniesUpdated}
      />

      <ChangePasswordDialog
        open={isChangePasswordDialogOpen}
        onOpenChange={setIsChangePasswordDialogOpen}
        user={selectedUser}
      />
    </div>
  )
}
