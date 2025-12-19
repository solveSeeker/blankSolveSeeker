import { NextResponse } from 'next/server'
import { createAdminClient } from '@/shared/lib/supabase/admin'
import { createClient } from '@/shared/lib/supabase/server'

/**
 * PATCH /api/admin/users/[id]
 *
 * Updates user profile fields (e.g., is_active)
 *
 * Request body:
 * {
 *   "is_active": true/false
 * }
 *
 * Security:
 * - Requires authenticated user with 'admin' role or is_sysadmin=true
 */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: userIdToUpdate } = await params

    // 1. Validate authenticated user
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    }

    // 2. Verify user has admin role or is sysadmin
    const { data: currentUserProfile, error: profileCheckError } = await supabase
      .from('profiles')
      .select('is_sysadmin')
      .eq('id', user.id)
      .single()

    if (profileCheckError) {
      console.error('Error fetching user profile:', profileCheckError)
      return NextResponse.json(
        { error: 'Error al verificar permisos' },
        { status: 500 }
      )
    }

    // Check if user is sysadmin
    const isSysAdmin = currentUserProfile?.is_sysadmin === true

    // If not sysadmin, check if user has ANY role (not just admin)
    let hasAnyRole = false
    if (!isSysAdmin) {
      const { data: userRoles, error: rolesError } = await supabase
        .from('user_roles')
        .select('role_id')
        .eq('user_id', user.id)
        .eq('enabled', true)
        .limit(1)

      if (rolesError) {
        console.error('Error fetching user roles:', rolesError)
        return NextResponse.json(
          { error: 'Error al verificar permisos' },
          { status: 500 }
        )
      }

      hasAnyRole = (userRoles?.length ?? 0) > 0
    }

    if (!isSysAdmin && !hasAnyRole) {
      return NextResponse.json(
        { error: 'Requiere permisos: debe ser sysadmin o tener al menos un rol asignado' },
        { status: 403 }
      )
    }

    // 3. Parse request body
    const body = await request.json()
    const { is_active } = body

    if (typeof is_active !== 'boolean') {
      return NextResponse.json(
        { error: 'El campo is_active debe ser booleano' },
        { status: 400 }
      )
    }

    // 4. Update profile using RLS (sysadmin policy allows this)
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ is_active })
      .eq('id', userIdToUpdate)

    if (updateError) {
      console.error('Error updating user profile:', updateError)
      return NextResponse.json(
        { error: updateError.message || 'Error al actualizar usuario' },
        { status: 500 }
      )
    }

    // 5. Success response
    return NextResponse.json({
      message: 'Usuario actualizado exitosamente',
      is_active,
    })
  } catch (error) {
    console.error('Unexpected error in PATCH /api/admin/users/[id]:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/admin/users/[id]
 *
 * Deletes a user from auth.users (CASCADE deletes profile)
 *
 * Security:
 * - Requires authenticated user with 'admin' role or is_sysadmin=true
 * - Cannot delete yourself
 * - Cannot delete the protected sysadmin user (solve.seeker.dev@gmail.com)
 * - Deletes from auth.users which CASCADE deletes from profiles
 */
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: userIdToDelete } = await params

    // 1. Validate authenticated user
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    }

    // 2. Prevent self-deletion
    if (user.id === userIdToDelete) {
      return NextResponse.json(
        { error: 'No puedes eliminar tu propio usuario' },
        { status: 400 }
      )
    }

    // 3. Prevent deletion of protected sysadmin user
    const { data: userToDelete, error: fetchError } = await supabase
      .from('profiles')
      .select('email')
      .eq('id', userIdToDelete)
      .single()

    if (fetchError) {
      console.error('Error fetching user to delete:', fetchError)
      return NextResponse.json(
        { error: 'Error al obtener información del usuario' },
        { status: 500 }
      )
    }

    if (userToDelete?.email === 'solve.seeker.dev@gmail.com') {
      return NextResponse.json(
        { error: 'No se puede eliminar el usuario administrador del sistema' },
        { status: 403 }
      )
    }

    // 4. Verify user has admin role or is sysadmin
    const { data: currentUserProfile, error: profileCheckError } = await supabase
      .from('profiles')
      .select('is_sysadmin')
      .eq('id', user.id)
      .single()

    if (profileCheckError) {
      console.error('Error fetching user profile:', profileCheckError)
      return NextResponse.json(
        { error: 'Error al verificar permisos' },
        { status: 500 }
      )
    }

    // Check if user is sysadmin
    const isSysAdmin = currentUserProfile?.is_sysadmin === true

    // If not sysadmin, check if user has ANY role (not just admin)
    let hasAnyRole = false
    if (!isSysAdmin) {
      const { data: userRoles, error: rolesError } = await supabase
        .from('user_roles')
        .select('role_id')
        .eq('user_id', user.id)
        .eq('enabled', true)
        .limit(1)

      if (rolesError) {
        console.error('Error fetching user roles:', rolesError)
        return NextResponse.json(
          { error: 'Error al verificar permisos' },
          { status: 500 }
        )
      }

      hasAnyRole = (userRoles?.length ?? 0) > 0
    }

    if (!isSysAdmin && !hasAnyRole) {
      return NextResponse.json(
        { error: 'Requiere permisos: debe ser sysadmin o tener al menos un rol asignado' },
        { status: 403 }
      )
    }

    // 5. Delete user from auth.users using admin API (service_role required)
    // This will CASCADE delete the profile due to FK constraint
    // Note: auth.admin API requires service_role, cannot be done via RLS
    const adminClient = createAdminClient()

    const { error: deleteError } = await adminClient.auth.admin.deleteUser(
      userIdToDelete
    )

    if (deleteError) {
      console.error('Error deleting user:', deleteError)
      return NextResponse.json(
        { error: deleteError.message || 'Error al eliminar usuario' },
        { status: 500 }
      )
    }

    // 6. Success response
    return NextResponse.json({
      message: 'Usuario eliminado exitosamente',
    })
  } catch (error) {
    console.error('Unexpected error in DELETE /api/admin/users/[id]:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
