const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Read .env.local
const envPath = path.join(__dirname, '..', '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const envVars = {};

envContent.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) {
    envVars[match[1].trim()] = match[2].trim();
  }
});

const supabaseUrl = envVars.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY;

async function insertAdminRole() {
  try {
    console.log('🔐 Autenticando con Supabase...');

    // Create Supabase client
    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    // Sign in with the test user
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: 'solve.seeker.dev@gmail.com',
      password: '2305'
    });

    if (authError) {
      console.error('❌ Error de autenticación:', authError.message);
      process.exit(1);
    }

    console.log('✅ Autenticado como:', authData.user.email);

    // Now insert the role using the authenticated session
    console.log('📝 Insertando rol admin...');

    const { data: roleData, error: roleError } = await supabase
      .from('roles')
      .insert([{
        name: 'admin',
        description: 'Administrador del sistema'
      }])
      .select()
      .single();

    if (roleError) {
      console.error('❌ Error insertando rol:', roleError.message);
      process.exit(1);
    }

    console.log('✅ Rol admin creado exitosamente:');
    console.log(JSON.stringify(roleData, null, 2));

    // Sign out
    await supabase.auth.signOut();
    console.log('👋 Sesión cerrada');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

insertAdminRole();
