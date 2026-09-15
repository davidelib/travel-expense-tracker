#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'
import * as path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing environment variables:')
  console.error('   - SUPABASE_SERVICE_ROLE_KEY')
  console.error('   - VITE_SUPABASE_URL')
  console.error('')
  console.error('Set these in your .env.local or environment.')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    persistSession: false,
  },
})

const migrationsDir = path.join(__dirname, '..', 'supabase', 'migrations')

if (!fs.existsSync(migrationsDir)) {
  console.error('❌ Migrations directory not found at', migrationsDir)
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

async function runMigrations() {
  let allSuccess = true

  for (const file of files) {
    const filePath = path.join(migrationsDir, file)
    const sql = fs.readFileSync(filePath, 'utf-8')

    console.log(`⏳ Running: ${file}`)

    try {
      const { data, error } = await supabase.rpc('exec', { sql_query: sql })

      if (error) {
        console.error(`❌ Failed: ${file}`)
        console.error('Error:', error)
        allSuccess = false
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
    process.exit(0)
  } else {
    console.log('\n❌ Some migrations failed. Check the errors above.')
    process.exit(1)
  }
}

runMigrations()
