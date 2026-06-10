/**
 * Supabase migration / seed script
 * ================================
 * Goals:
 *   1. Detect whether the new columns `creditos_aprobados` /
 *      `creditos_totales` exist on `estudiantes`. If not, the script
 *      prints the exact SQL you need to paste into the Supabase
 *      SQL editor (it is also saved in `scripts/migration_creditos.sql`).
 *   2. Once the columns exist, seed the 5 students with realistic credit
 *      values consistent with their cycle and current risk level.
 *
 * Idempotent: safe to run multiple times.
 *
 * Run:   node scripts/apply-supabase-migration.cjs
 */
const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

const url = 'https://hrveqaswujotfgmvjnxl.supabase.co'
const key =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhydmVxYXN3dWpvdGZnbXZqbnhsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA5NTE2OTksImV4cCI6MjA5NjUyNzY5OX0.ScWBOXWOh_W7bLOp-zPWEGzjoB8Xtx0JBELtVFG6sdA'

const supabase = createClient(url, key)

// Realistic per-student values (carrera = 200 créditos total aprox.)
// ciclo "2do" ≈ 40 créd · 3ro ≈ 60 · 5to ≈ 100 · 6to ≈ 120 · 8vo ≈ 160
const SEED = [
  { id: 1, creditos_aprobados: 60,  creditos_totales: 200 }, // Juan Pérez      · 5to · ALTO
  { id: 2, creditos_aprobados: 110, creditos_totales: 200 }, // María López     · 3ro · MEDIO
  { id: 3, creditos_aprobados: 175, creditos_totales: 200 }, // Carlos Ramos    · 8vo · BAJO
  { id: 4, creditos_aprobados: 20,  creditos_totales: 200 }, // Lucía Torres    · 2do · ALTO
  { id: 5, creditos_aprobados: 130, creditos_totales: 200 }, // Diego Fernández · 6to · MEDIO
]

async function ensureColumns() {
  console.log('▶ Verifying columns on `estudiantes` …')
  const { error } = await supabase
    .from('estudiantes')
    .select('creditos_aprobados, creditos_totales')
    .limit(1)

  if (!error) {
    console.log('✓ Columns present.')
    return true
  }
  if (/column .* does not exist/i.test(error.message)) {
    console.error(
      '\n✖ Missing column on `estudiantes`:',
      error.message,
      '\n\n  → Open the Supabase SQL editor and run the contents of',
      '     scripts/migration_creditos.sql',
      '\n  → Then re-run this script to seed the values.\n',
    )
    return false
  }
  console.error('✖ Unexpected error:', error.message)
  return false
}

async function seed() {
  console.log('▶ Seeding creditos_aprobados / creditos_totales for each student …')
  for (const row of SEED) {
    const { error } = await supabase
      .from('estudiantes')
      .update({
        creditos_aprobados: row.creditos_aprobados,
        creditos_totales: row.creditos_totales,
      })
      .eq('id', row.id)

    if (error) {
      console.error(`  ✖ student ${row.id}: ${error.message}`)
    } else {
      console.log(
        `  ✓ student ${row.id}: ${row.creditos_aprobados}/${row.creditos_totales} créditos`,
      )
    }
  }
}

async function verify() {
  console.log('\n▶ Final verification …')
  const { data, error } = await supabase
    .from('estudiantes')
    .select('id, codigo, nombre, creditos_aprobados, creditos_totales')
    .order('id')
  if (error) {
    console.error('✖', error.message)
    return
  }
  console.table(data)
}

;(async () => {
  const ok = await ensureColumns()
  if (!ok) {
    // Print the SQL anyway so the user can copy it.
    const sql = fs.readFileSync(
      path.join(__dirname, 'migration_creditos.sql'),
      'utf8',
    )
    console.log('--- BEGIN migration_creditos.sql ---\n' + sql + '--- END ---\n')
    process.exit(1)
  }
  await seed()
  await verify()
  console.log('\n✅ Migration finished.')
})().catch((e) => {
  console.error('FATAL', e)
  process.exit(1)
})
