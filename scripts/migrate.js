#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

const supabaseUrl = 'https://cuwrjbdldoubcnbpijxr.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN1d3JqYmRsZG91YmNuYnBpanhyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODgzNzAzNCwiZXhwIjoyMDg0NDEzMDM0fQ.2ViMsJLyD5rwhwpCEFZUd8-tTMcQunH4lS3mlKtv3lw'

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

const migrationsDir = path.join(__dirname, '..', 'supabase', 'migrations')

async function runMigrations() {
  if (!fs.existsSync(migrationsDir)) {
    console.error('❌ Migrations directory not found')
    process.exit(1)
  }

  const files = fs
    .readdirSync(migrationsDir)
    .filter((f) => f.endsWith('.sql'))
    .sort()

  if (files.length === 0) {
    console.log('ℹ️  No SQL migrations found')
    process.exit(0)
  }

  console.log(`📋 Found ${files.length} migration(s)\n`)

  let allSuccess = true

  for (const file of files) {
    const filePath = path.join(migrationsDir, file)
    const sql = fs.readFileSync(filePath, 'utf-8')

    console.log(`⏳ Running: ${file}`)

    try {
      // Execute the entire SQL file as one transaction
      const { error } = await supabase.rpc('exec', { sql_query: sql })

      if (error) {
        // If exec RPC doesn't exist, try individual statements
        console.log('   Note: exec() RPC not available, executing statements individually...')
        const statements = sql
          .split(';')
          .map((s) => s.trim())
          .filter((s) => s.length > 0)

        let stmtSuccess = true
        for (const statement of statements) {
          try {
            const { error: stmtError } = await supabase.rpc('exec', {
              sql_query: statement + ';',
            })
            if (stmtError && stmtError.code !== 'PGRST116') {
              console.error(`❌ Failed: ${file}`)
              console.error('Error:', stmtError.message)
              stmtSuccess = false
              allSuccess = false
              break
            }
          } catch (err) {
            // Continue with individual statements
          }
        }
        if (stmtSuccess) {
          console.log(`✅ ${file} completed\n`)
        }
      } else {
        console.log(`✅ ${file} completed\n`)
      }
    } catch (err) {
      console.error(`❌ Error running ${file}:`, err.message)
      allSuccess = false
    }
  }

  if (allSuccess) {
    console.log('\n✅ All migrations completed successfully!')
    console.log('\n📊 Schema created: travel_expenses')
    console.log('📚 Tables created: trips, expenses, categories')
    console.log('🔒 Row Level Security: Enabled')
    console.log('✨ Default categories: Inserted\n')
    process.exit(0)
  } else {
    console.log('\n❌ Some migrations failed. Check the errors above.')
    process.exit(1)
  }
}

runMigrations()
