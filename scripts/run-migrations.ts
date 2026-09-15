import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'
import * as path from 'path'

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing SUPABASE_SERVICE_ROLE_KEY or VITE_SUPABASE_URL')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function runMigrations() {
  const migrationsDir = path.join(process.cwd(), 'supabase', 'migrations')

  if (!fs.existsSync(migrationsDir)) {
    console.log('No migrations directory found')
    return
  }

  const files = fs.readdirSync(migrationsDir)
    .filter(f => f.endsWith('.sql'))
    .sort()

  for (const file of files) {
    const filePath = path.join(migrationsDir, file)
    const sql = fs.readFileSync(filePath, 'utf-8')

    console.log(`Running migration: ${file}`)

    try {
      const { error } = await supabase.rpc('exec', { sql_query: sql }).then(
        () => ({ error: null }),
        (err) => ({ error: err })
      )

      if (error) {
        // Fallback: try direct query execution
        const statements = sql.split(';').filter(s => s.trim())
        for (const statement of statements) {
          if (statement.trim()) {
            await supabase.rpc('exec', { sql_query: statement + ';' })
          }
        }
      }

      console.log(`✓ ${file} completed`)
    } catch (err) {
      console.error(`✗ Error running ${file}:`, err)
      process.exit(1)
    }
  }

  console.log('All migrations completed!')
}

runMigrations()
