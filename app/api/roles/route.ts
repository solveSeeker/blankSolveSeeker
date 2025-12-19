import { NextResponse } from 'next/server'
import { createClient } from '@/shared/lib/supabase/server'

export async function GET() {
  try {
    const supabase = await createClient()

    // Get current user
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check if user is sysAdmin
    const isSysAdmin = user.email === 'solve.seeker.dev@gmail.com'

    // Build query
    let query = supabase
      .from('roles')
      .select('*')

    // Filter by visible=true for non-sysAdmin users
    if (!isSysAdmin) {
      query = query.eq('visible', true)
    }

    // Apply ordering
    query = query
      .order('hrchy', { ascending: true, nullsFirst: false })
      .order('name', { ascending: true })

    const { data, error } = await query

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }

    return NextResponse.json(data || [])
  } catch (error) {
    console.error('Error fetching roles:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
