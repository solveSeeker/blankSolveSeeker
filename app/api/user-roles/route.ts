/**
 * API Route temporal para user_roles
 *
 * Este route proporciona acceso a user_roles mediante SQL directo
 * mientras se resuelve el problema con GraphQL (user_rolesCollection no expuesto)
 *
 * TODO: Migrar a GraphQL cuando pg_graphql exponga correctamente user_rolesCollection
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/shared/lib/supabase/server'

// GET /api/user-roles?profileId=xxx - Obtener roles de un usuario (o todos si no se especifica profileId)
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Verificar autenticación
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Obtener profileId del query string (opcional)
    const searchParams = request.nextUrl.searchParams
    const profileId = searchParams.get('profileId')

    // Construir query con JOIN a roles para obtener role_name
    let query = supabase
      .from('user_roles')
      .select(`
        *,
        roles (
          name
        )
      `)
      .order('created', { ascending: false })

    // Filtrar por profileId si se especifica
    if (profileId) {
      query = query.eq('profile_id', profileId)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching user_roles:', error)
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }

    // Mapear para incluir role_name en el nivel superior
    const mappedData = data?.map(ur => ({
      ...ur,
      role_name: ur.roles?.name || null
    })) || []

    return NextResponse.json(mappedData)
  } catch (error) {
    console.error('Error in GET /api/user-roles:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/user-roles - Insertar user_roles
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Verificar autenticación
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { objects } = body

    if (!objects || !Array.isArray(objects)) {
      return NextResponse.json(
        { error: 'objects array is required' },
        { status: 400 }
      )
    }

    // Insertar user_roles (sin campo 'key' ya que user_roles hereda de sysRelated)
    const { data, error } = await supabase
      .from('user_roles')
      .insert(objects)
      .select()

    if (error) {
      console.error('Error inserting user_roles:', error)
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }

    return NextResponse.json({
      affectedCount: data?.length || 0,
      records: data || []
    })
  } catch (error) {
    console.error('Error in POST /api/user-roles:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PATCH /api/user-roles - Actualizar user_roles
export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Verificar autenticación
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { profileId, roleIds, enabled } = body

    if (!profileId || !roleIds || enabled === undefined) {
      return NextResponse.json(
        { error: 'profileId, roleIds, and enabled are required' },
        { status: 400 }
      )
    }

    // Actualizar user_roles
    const { data, error } = await supabase
      .from('user_roles')
      .update({ enabled })
      .eq('profile_id', profileId)
      .in('role_id', roleIds)
      .select()

    if (error) {
      console.error('Error updating user_roles:', error)
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }

    return NextResponse.json({
      affectedCount: data?.length || 0,
      records: data || []
    })
  } catch (error) {
    console.error('Error in PATCH /api/user-roles:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE /api/user-roles - Eliminar user_roles
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Verificar autenticación
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { ids } = body

    if (!ids || !Array.isArray(ids)) {
      return NextResponse.json(
        { error: 'ids array is required' },
        { status: 400 }
      )
    }

    // Solo sysAdmin puede eliminar (verificar en el servidor)
    const isSysAdmin = user.email === 'solve.seeker.dev@gmail.com'
    if (!isSysAdmin) {
      return NextResponse.json(
        { error: 'Only sysAdmin can delete user_roles' },
        { status: 403 }
      )
    }

    // Eliminar user_roles
    const { error } = await supabase
      .from('user_roles')
      .delete()
      .in('id', ids)

    if (error) {
      console.error('Error deleting user_roles:', error)
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }

    return NextResponse.json({
      affectedCount: ids.length
    })
  } catch (error) {
    console.error('Error in DELETE /api/user-roles:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
