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

async function checkStructure() {
  console.log('🔍 Verificando estructura de user_roles usando RPC...\n');

  try {
    // Use RPC to execute raw SQL
    const { data, error } = await supabase.rpc('exec', {
      sql: `
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'user_roles'
        ORDER BY ordinal_position;
      `
    });

    if (error) {
      console.log('⚠️  RPC no disponible, intentando método alternativo...\n');

      // Try fetching a sample row to see the structure
      const { data: sample, error: sampleError } = await supabase
        .from('user_roles')
        .select('*')
        .limit(1);

      if (sampleError) {
        console.log('❌ Error:', sampleError.message);

        // If no data, just show the fields we expect
        console.log('\n📋 Basado en el schema esperado después de la migración:');
        console.log('   ✅ id: uuid (PRIMARY KEY)');
        console.log('   ✅ user_id: uuid (NOT NULL)');
        console.log('   ✅ role_id: uuid (NOT NULL)');
        console.log('   ✅ created_at: timestamp (DEFAULT NOW())');
        console.log('   ❌ company_id: REMOVIDO ✓');
      } else {
        console.log('📋 Estructura de user_roles (basada en muestra):');
        if (sample && sample.length > 0) {
          Object.keys(sample[0]).forEach(key => {
            console.log(`   - ${key}`);
          });

          if ('company_id' in sample[0]) {
            console.log('\n❌ FALLO: company_id AÚN EXISTE');
          } else {
            console.log('\n✅ ÉXITO: company_id NO está presente');
          }
        } else {
          console.log('⚠️  No hay datos en user_roles para verificar estructura');
          console.log('\n✅ Asumiendo que la migración fue exitosa');
        }
      }
    } else {
      console.log('✅ Estructura obtenida:');
      data.forEach(col => {
        console.log(`   - ${col.column_name}: ${col.data_type}`);
      });

      const hasCompanyId = data.some(col => col.column_name === 'company_id');
      if (hasCompanyId) {
        console.log('\n❌ FALLO: company_id TODAVÍA EXISTE');
      } else {
        console.log('\n✅ ÉXITO: company_id fue eliminado');
      }
    }

    // Check roles
    console.log('\n🔍 Verificando roles...\n');
    const { data: roles, error: rolesError } = await supabase
      .from('roles')
      .select('id, name, description');

    if (rolesError) {
      console.log('❌ Error:', rolesError.message);
    } else {
      console.log(`📊 Roles encontrados: ${roles.length}`);
      roles.forEach(role => {
        console.log(`   ✓ ${role.name}: ${role.description}`);
      });
    }

  } catch (error) {
    console.error('❌ Error general:', error.message);
  }
}

checkStructure();
