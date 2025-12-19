import { NextResponse } from 'next/server'
import { createAdminClient } from '@/shared/lib/supabase/admin'
import { createClient } from '@/shared/lib/supabase/server'

/**
 * PATCH /api/admin/users/[id]/password
 *
 * Changes a user's password
 *
 * Request body:
 * {
 *   "password": "newPassword123"
 * }
 *
 * Security:
 * - Requires authenticated user with 'admin' role or is_sysadmin=true
 * - Uses admin API (service_role) to update password
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
    const { password } = body

    if (!password || typeof password !== 'string') {
      return NextResponse.json(
        { error: 'La contraseña es requerida' },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'La contraseña debe tener al menos 6 caracteres' },
        { status: 400 }
      )
    }

    // 4. Update password using admin API (requires service_role)
    const adminClient = createAdminClient()

    const { error: updateError } = await adminClient.auth.admin.updateUserById(
      userIdToUpdate,
      { password }
    )

    if (updateError) {
      console.error('Error updating user password:', updateError)
      return NextResponse.json(
        { error: updateError.message || 'Error al cambiar contraseña' },
        { status: 500 }
      )
    }

    // 5. Success response
    return NextResponse.json({
      message: 'Contraseña actualizada exitosamente',
    })
  } catch (error) {
    console.error('Unexpected error in PATCH /api/admin/users/[id]/password:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
