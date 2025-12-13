import { NextResponse } from 'next/server'
import { createAdminClient } from '@/shared/lib/supabase/admin'
import { createClient } from '@/shared/lib/supabase/server'

interface CreateUserRequest {
  email: string
  fullName: string
  roleId?: string
}

/**
 * POST /api/admin/users
 *
 * Creates a new user with auth.users entry, profile, and role assignment
 *
 * Request body:
 * {
 *   "email": "user@example.com",
 *   "fullName": "John Doe",
 *   "roleId": "uuid-optional" // Defaults to 'vendedor' if not provided
 * }
 *
 * Security:
 * - Requires authenticated user with 'admin' role
 * - Creates users in the same tenant as the admin
 * - Auto-confirms email (email_confirm: true)
 * - Sets default password: 'CambiaTuClave'
 *
 * Transaction Flow:
 * 1. Create auth.users
 * 2. Create user_profiles (rollback if fails)
 * 3. Assign role in user_roles (rollback if fails)
 */
export async function POST(request: Request) {
  try {
    // 1. Validate authenticated user
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    }

    // 2. Verify user has admin role
    const { data: userRoles, error: rolesError } = await supabase
      .from('user_roles')
      .select('roles(name)')
      .eq('user_id', user.id)

    if (rolesError) {
      console.error('Error fetching user roles:', rolesError)
      return NextResponse.json(
        { error: 'Error al verificar permisos' },
        { status: 500 }
      )
    }

    const isAdmin = userRoles?.some(
      (ur: { roles: { name: string } | null }) => ur.roles?.name === 'admin'
    )

    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Requiere permisos de administrador' },
        { status: 403 }
      )
    }

    // 3. Verify admin profile exists and get tenant_id
    const { data: adminProfile, error: profileError } = await supabase
      .from('user_profiles')
      .select('id, email, tenant_id')
      .eq('id', user.id)
      .single()

    if (profileError || !adminProfile) {
      console.error('Error fetching admin profile:', profileError)
      return NextResponse.json(
        { error: 'Error al obtener información del administrador' },
        { status: 500 }
      )
    }

    // 4. Parse and validate request body
    const body: CreateUserRequest = await request.json()
    const { email, fullName, roleId } = body

    if (!email || !fullName) {
      return NextResponse.json(
        { error: 'Email y nombre completo son requeridos' },
        { status: 400 }
      )
    }

    // 5. Create admin client for privileged operations
    const adminClient = createAdminClient()

    // 6. Get default role (vendedor) if not specified
    let finalRoleId = roleId
    if (!finalRoleId) {
      const { data: vendedorRole, error: roleError } = await adminClient
        .from('roles')
        .select('id')
        .eq('name', 'vendedor')
        .single()

      if (roleError || !vendedorRole) {
        console.error('Error fetching vendedor role:', roleError)
        return NextResponse.json(
          { error: 'Error al obtener rol por defecto' },
          { status: 500 }
        )
      }

      finalRoleId = vendedorRole.id
    }

    // 7. Create auth.users entry with auto-confirmation
    const { data: authUser, error: authError } =
      await adminClient.auth.admin.createUser({
        email,
        password: 'CambiaTuClave', // Default password
        email_confirm: true, // Auto-confirm email
        user_metadata: {
          full_name: fullName,
        },
      })

    if (authError) {
      console.error('Error creating auth user:', authError)

      // Handle specific error cases
      if (authError.message.includes('already registered')) {
        return NextResponse.json(
          { error: 'Este email ya está registrado' },
          { status: 409 }
        )
      }

      return NextResponse.json(
        { error: authError.message || 'Error al crear usuario en auth' },
        { status: 500 }
      )
    }

    if (!authUser.user) {
      return NextResponse.json(
        { error: 'Usuario de autenticación no fue creado' },
        { status: 500 }
      )
    }

    // 8. Create user_profiles entry
    const { error: profileInsertError } = await adminClient
      .from('user_profiles')
      .insert({
        id: authUser.user.id,
        tenant_id: adminProfile.tenant_id,
        email,
        full_name: fullName,
      })

    if (profileInsertError) {
      console.error('Error creating profile:', profileInsertError)

      // Rollback: Delete auth user
      await adminClient.auth.admin.deleteUser(authUser.user.id)

      return NextResponse.json(
        { error: 'Error al crear perfil de usuario' },
        { status: 500 }
      )
    }

    // 9. Assign role in user_roles
    const { error: roleAssignError } = await adminClient
      .from('user_roles')
      .insert({
        user_id: authUser.user.id,
        role_id: finalRoleId,
        key: `user_role_${authUser.user.id}_${finalRoleId}`,
      })

    if (roleAssignError) {
      console.error('Error assigning role:', roleAssignError)

      // Rollback: Delete auth user (CASCADE will delete profile)
      await adminClient.auth.admin.deleteUser(authUser.user.id)

      return NextResponse.json(
        { error: 'Error al asignar rol al usuario' },
        { status: 500 }
      )
    }

    // 10. Success response
    return NextResponse.json({
      id: authUser.user.id,
      email,
      fullName,
      message: 'Usuario creado exitosamente',
    })
  } catch (error) {
    console.error('Unexpected error in POST /api/admin/users:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
