const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Read .env.local file
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
const supabaseServiceKey = envVars.SUPABASE_SERVICE_ROLE_KEY;

// Create Supabase client with service role key
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkRolesFields() {
  console.log('🔍 Verificando campos de la tabla roles...\n');

  try {
    // Get one role to see all fields
    const { data: roles, error } = await supabase
      .from('roles')
      .select('*')
      .limit(1);

    if (error) {
      console.log('❌ Error:', error.message);
      console.log('Detalles:', error);
    } else if (roles && roles.length > 0) {
      console.log('📋 Campos encontrados en la tabla roles:');
      Object.keys(roles[0]).forEach(key => {
        console.log(`   - ${key}: ${typeof roles[0][key]} = ${JSON.stringify(roles[0][key])}`);
      });
    } else {
      console.log('⚠️  No hay roles en la tabla');
    }

    // Try without ordering
    console.log('\n🔍 Intentando obtener roles sin ordenar...\n');
    const { data: allRoles, error: allError } = await supabase
      .from('roles')
      .select('*');

    if (allError) {
      console.log('❌ Error:', allError.message);
      console.log('Código:', allError.code);
      console.log('Detalles:', allError.details);
      console.log('Hint:', allError.hint);
    } else {
      console.log(`✅ Éxito! Encontrados ${allRoles.length} roles:`);
      allRoles.forEach(role => {
        console.log(`   - ${role.name}: ${role.description}`);
      });
    }

  } catch (error) {
    console.error('❌ Error general:', error.message);
    console.error(error);
  }
}

checkRolesFields();
