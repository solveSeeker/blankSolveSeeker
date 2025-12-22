import { createClient } from '@supabase/supabase-js'

// Variables de entorno hardcoded para este script
const supabaseUrl = 'https://lddfsrsmifmujbhfdbsd.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxkZGZzcnNtaWZtdWpiaGZkYnNkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NDY2Njk4MCwiZXhwIjoyMDgwMjQyOTgwfQ.QnfQBOm4-HWedTFaZwd_IdOmMOe_AvNf55YwEc2mQws'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function associateUserCompany() {
  try {
    // 1. Buscar el usuario gabriel.mamondes@gmail.com
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, email, fullName')
      .eq('email', 'gabriel.mamondes@gmail.com')
      .single()

    if (profileError || !profile) {
      console.error('Error al buscar usuario:', profileError)
      return
    }

    console.log('✓ Usuario encontrado:', profile)

    // 2. Buscar la primera empresa
    const { data: company, error: companyError } = await supabase
      .from('companies')
      .select('id, name')
      .order('created', { ascending: true })
      .limit(1)
      .single()

    if (companyError || !company) {
      console.error('Error al buscar empresa:', companyError)
      return
    }

    console.log('✓ Primera empresa encontrada:', company)

    // 3. Verificar si ya existe la asociación
    const { data: existing, error: existingError } = await supabase
      .from('user_companies')
      .select('*')
      .eq('profile_id', profile.id)
      .eq('company_id', company.id)
      .single()

    if (existing) {
      console.log('⚠️  La asociación ya existe:', existing)
      return
    }

    // 4. Crear la asociación
    const { data: association, error: associationError } = await supabase
      .from('user_companies')
      .insert({
        profile_id: profile.id,
        company_id: company.id,
        role: 'owner',
        is_active: true,
        key: 1 // Agregar key requerido por la tabla
      })
      .select()
      .single()

    if (associationError) {
      console.error('❌ Error al crear asociación:', associationError)
      return
    }

    console.log('✅ Asociación creada exitosamente:', association)

  } catch (error) {
    console.error('❌ Error general:', error)
  }
}

associateUserCompany()
