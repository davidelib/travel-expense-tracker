#!/usr/bin/env node

const { execSync } = require('child_process')
const fs = require('fs')
const path = require('path')

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

console.log(`📋 Found ${files.length} migration(s)`)

let allSuccess = true

for (const file of files) {
  const filePath = path.join(migrationsDir, file)
  const sql = fs.readFileSync(filePath, 'utf-8')

  console.log(`\n⏳ Running: ${file}`)

  const encodedUrl = encodeURIComponent(supabaseUrl)
  const encodedKey = encodeURIComponent(supabaseServiceKey)
  const encodedSql = encodeURIComponent(sql)

  try {
    const cmd = `curl -s -X POST '${supabaseUrl}/rest/v1/rpc/exec' \
      -H 'Authorization: Bearer ${supabaseServiceKey}' \
      -H 'Content-Type: application/json' \
      -d '${JSON.stringify({ sql_query: sql })}' 2>&1`

    const result = execSync(cmd, { encoding: 'utf-8' })

    if (result.includes('error') || result.includes('ERROR')) {
      console.error(`❌ Failed: ${file}`)
      console.error(result)
      allSuccess = false
    } else {
      console.log(`✅ ${file} completed`)
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
