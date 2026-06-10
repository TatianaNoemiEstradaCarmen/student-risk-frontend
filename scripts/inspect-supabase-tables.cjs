// Detailed inspection of the project's Supabase tables
const { createClient } = require('@supabase/supabase-js')

const url = 'https://hrveqaswujotfgmvjnxl.supabase.co'
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhydmVxYXN3dWpvdGZnbXZqbnhsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA5NTE2OTksImV4cCI6MjA5NjUyNzY5OX0.ScWBOXWOh_W7bLOp-zPWEGzjoB8Xtx0JBELtVFG6sdA'

const supabase = createClient(url, key)

const tables = [
  'alertas_academicas',
  'becas',
  'estudiantes',
  'hallazgos_entrevista',
  'recomendaciones_academicas',
  'registro_academico',
  'solicitudes_tutoria',
  'tramites_apoyo',
]

async function main() {
  for (const name of tables) {
    console.log('\n========================================')
    console.log('TABLE:', name)
    console.log('========================================')
    const { data, error, count } = await supabase
      .from(name)
      .select('*', { count: 'exact' })
      .limit(5)
    if (error) {
      console.log('ERROR:', error.message)
      continue
    }
    console.log('Total rows:', count)
    if (data && data.length > 0) {
      console.log('Columns:', Object.keys(data[0]).join(', '))
      console.log('Sample rows:')
      console.log(JSON.stringify(data, null, 2))
    } else {
      console.log('(no rows)')
    }
  }
}

main().catch((e) => {
  console.error('FATAL', e)
  process.exit(1)
})
