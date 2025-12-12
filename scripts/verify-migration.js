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

async function verifyMigration() {
  console.log('🔍 Verificando estructura de user_roles...\n');

  try {
    // Check user_roles structure
    const { data: columns, error: colError } = await supabase
      .from('information_schema.columns')
      .select('column_name, data_type, is_nullable')
      .eq('table_schema', 'public')
      .eq('table_name', 'user_roles')
      .order('ordinal_position');

    if (colError) {
      console.error('❌ Error fetching columns:', colError.message);
    } else {
      console.log('📋 Columnas de user_roles:');
      columns.forEach(col => {
        console.log(`   - ${col.column_name}: ${col.data_type} ${col.is_nullable === 'YES' ? '(nullable)' : '(NOT NULL)'}`);
      });

      const hasCompanyId = columns.some(col => col.column_name === 'company_id');
      console.log('');
      if (hasCompanyId) {
        console.log('❌ FALLO: El campo company_id AÚN EXISTE en user_roles');
      } else {
        console.log('✅ ÉXITO: El campo company_id fue eliminado correctamente');
      }
    }

    // Check roles table
    console.log('\n🔍 Verificando roles en la base de datos...\n');
    const { data: roles, error: rolesError } = await supabase
      .from('roles')
      .select('*');

    if (rolesError) {
      console.error('❌ Error fetching roles:', rolesError.message);
    } else {
      console.log(`📊 Total de roles: ${roles.length}`);
      roles.forEach(role => {
        console.log(`   - ${role.name}: ${role.description}`);
      });
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

verifyMigration();
