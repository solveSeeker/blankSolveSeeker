import { NextResponse } from 'next/server'
import { createAdminClient } from '@/shared/lib/supabase/admin'
import { createClient } from '@/shared/lib/supabase/server'

interface CreateUserRequest {
  email: string
  fullName: string
  isSysAdmin?: boolean
}

/**
 * POST /api/admin/users
 *
 * Creates a new user with auth.users entry and profile
 *
 * Request body:
 * {
 *   "email": "user@example.com",
 *   "fullName": "John Doe",
 *   "isSysAdmin": false // Optional, defaults to false
 * }
 *
 * Security:
 * - Requires authenticated user with 'admin' role or is_sysadmin=true
 * - Auto-confirms email (email_confirm: true)
 * - Sets default password: 'CambiaTuClave'
 *
 * Transaction Flow:
 * 1. Create auth.users
 * 2. Create user_profiles with is_sysadmin flag (rollback if fails)
 * 3. Roles are assigned later via the role management modal
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

    // 3. Verify admin profile exists
    const { data: adminProfile, error: profileError } = await supabase
      .from('profiles')
      .select('id, email')
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
    const { email, fullName, isSysAdmin: isSysAdminUser = false } = body

    if (!email || !fullName) {
      return NextResponse.json(
        { error: 'Email y nombre completo son requeridos' },
        { status: 400 }
      )
    }

    // 5. Create admin client for privileged operations
    const adminClient = createAdminClient()

    // 6. Create auth.users entry with auto-confirmation
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

    // 7. Create profiles entry with is_sysadmin flag using RLS
    // Always assign creator to track who created the user
    // Now using regular client with RLS instead of admin client
    const creatorValue = user.id
    console.log('🔍 DEBUG Creator assignment:', {
      currentUserEmail: adminProfile.email,
      currentUserId: user.id,
      isSysAdmin,
      creatorValue,
      newUserEmail: email,
      newUserIsSysAdmin: isSysAdminUser
    })

    const { error: profileInsertError } = await supabase
      .from('profiles')
      .insert({
        id: authUser.user.id,
        email,
        fullName: fullName,
        is_sysadmin: isSysAdminUser,
        creator: creatorValue,
      })

    if (profileInsertError) {
      console.error('Error creating profile:', profileInsertError)

      // Rollback: Delete auth user using admin API (required)
      await adminClient.auth.admin.deleteUser(authUser.user.id)

      return NextResponse.json(
        { error: 'Error al crear perfil de usuario' },
        { status: 500 }
      )
    }

    // Verify that profile was created with correct creator value
    const { data: verifyProfile } = await supabase
      .from('profiles')
      .select('id, email, creator')
      .eq('id', authUser.user.id)
      .single()

    console.log('✅ Profile created successfully:', verifyProfile)

    // 8. Success response
    // Roles will be assigned later via the role management modal
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
