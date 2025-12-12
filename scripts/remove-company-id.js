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

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials in .env.local');
  console.log('Required: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

// Create Supabase client with service role key (bypasses RLS)
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function executeSql(sql, description) {
  console.log(`\n${description}`);
  try {
    const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseServiceKey,
        'Authorization': `Bearer ${supabaseServiceKey}`
      },
      body: JSON.stringify({ query: sql })
    });

    if (!response.ok) {
      const error = await response.text();
      console.log(`⚠️  ${error}`);
      return false;
    }

    console.log('✅ Success');
    return true;
  } catch (error) {
    console.log(`⚠️  ${error.message}`);
    return false;
  }
}

async function removeTenancyFromUserRoles() {
  try {
    console.log('🔧 Starting migration: Remove company_id from user_roles');
    console.log('ℹ️  Using service role key (bypasses RLS)');

    // Read the migration file
    const migrationPath = path.join(__dirname, '..', 'supabase', 'migrations', '005_remove_company_id_from_user_roles.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

    console.log('\n📄 Executing migration SQL...\n');
    console.log('----------------------------------------');
    console.log(migrationSQL);
    console.log('----------------------------------------');

    // Execute migration using REST API directly
    const url = `${supabaseUrl}/rest/v1/rpc/exec`;

    console.log('\n🔄 Sending migration to Supabase...');

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseServiceKey,
        'Authorization': `Bearer ${supabaseServiceKey}`,
        'Prefer': 'return=representation'
      },
      body: JSON.stringify({
        query: migrationSQL
      })
    });

    const responseText = await response.text();

    if (!response.ok) {
      console.error('\n❌ Migration failed:', responseText);

      // Try alternative approach: Execute statements one by one
      console.log('\n🔄 Trying alternative approach: executing statements individually...\n');

      const statements = migrationSQL
        .split(';')
        .map(s => s.trim())
        .filter(s => s.length > 0 && !s.startsWith('--'));

      for (const [index, statement] of statements.entries()) {
        if (statement.includes('SELECT')) {
          continue; // Skip verification queries
        }

        console.log(`\n${index + 1}/${statements.length}: Executing...`);
        console.log(statement.substring(0, 100) + '...');

        const stmtResponse = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': supabaseServiceKey,
            'Authorization': `Bearer ${supabaseServiceKey}`
          },
          body: JSON.stringify({ query: statement })
        });

        if (!stmtResponse.ok) {
          const error = await stmtResponse.text();
          console.log(`⚠️  ${error}`);
        } else {
          console.log('✅ Success');
        }
      }
    } else {
      console.log('\n✅ Migration executed successfully!');
      console.log('Response:', responseText);
    }

    // Verify final structure
    console.log('\n\n5️⃣ Verifying final table structure...');
    const { data: columns, error: verifyError } = await supabase
      .from('information_schema.columns')
      .select('column_name, data_type')
      .eq('table_schema', 'public')
      .eq('table_name', 'user_roles')
      .order('ordinal_position');

    if (verifyError) {
      console.log('⚠️  Could not verify structure:', verifyError.message);
    } else if (columns && columns.length > 0) {
      console.log('✅ Current user_roles columns:');
      columns.forEach(col => {
        console.log(`   - ${col.column_name}: ${col.data_type}`);
      });

      const hasCompanyId = columns.some(col => col.column_name === 'company_id');
      if (hasCompanyId) {
        console.log('\n⚠️  WARNING: company_id column still exists!');
      } else {
        console.log('\n✅ SUCCESS: company_id column has been removed!');
      }
    }

    console.log('\n\n🎉 Migration process completed!');
    console.log('\nNext steps:');
    console.log('  1. Restart the dev server: npm run dev');
    console.log('  2. Test the roles interface at http://localhost:4855/dashboard/roles');
    console.log('  3. Verify that the admin role is now visible in the UI');

  } catch (error) {
    console.error('\n❌ Migration failed:', error.message);
    console.error(error);
    process.exit(1);
  }
}

removeTenancyFromUserRoles();
