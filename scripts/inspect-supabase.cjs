// Quick script to inspect all tables and their row counts in the Supabase project
const { createClient } = require('@supabase/supabase-js')

const url = 'https://hrveqaswujotfgmvjnxl.supabase.co'
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhydmVxYXN3dWpvdGZnbXZqbnhsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA5NTE2OTksImV4cCI6MjA5NjUyNzY5OX0.ScWBOXWOh_W7bLOp-zPWEGzjoB8Xtx0JBELtVFG6sdA'

const supabase = createClient(url, key)

// Candidate table names to check (common in student / academic projects)
const candidates = [
  'estudiantes',
  'student',
  'students',
  'usuario',
  'usuarios',
  'users',
  'profiles',
  'persona',
  'personas',
  'cursos',
  'courses',
  'matriculas',
  'enrollments',
  'enrollment',
  'notas',
  'grades',
  'calificaciones',
  'asistencia',
  'attendance',
  'asistencias',
  'attendances',
  'carrera',
  'carreras',
  'career',
  'careers',
  'programa',
  'programas',
  'program',
  'programs',
  'sede',
  'sedes',
  'campus',
  'ciclo',
  'ciclos',
  'cycle',
  'cycles',
  'semestre',
  'semestres',
  'semester',
  'semesters',
  'tutor',
  'tutores',
  'tutors',
  'tutorias',
  'tutoring',
  'session',
  'sessions',
  'interview',
  'interviews',
  'entrevistas',
  'entrevista',
  'scholarship',
  'scholarships',
  'beca',
  'becas',
  'recomendacion',
  'recomendaciones',
  'recommendation',
  'recommendations',
  'academic_recommendations',
  'procedimiento',
  'procedimientos',
  'procedure',
  'procedures',
  'support_procedures',
  'support_procedure',
  'risk_factor',
  'risk_factors',
  'factor_riesgo',
  'factores_riesgo',
  'riesgo',
  'riesgos',
  'risk',
  'risks',
  'asignatura',
  'asignaturas',
  'subject',
  'subjects',
  'curso_estudiante',
  'student_course',
  'student_courses',
  'creditos',
  'credits',
]

async function main() {
  console.log('Probing', candidates.length, 'candidate tables...\n')
  const existing = []

  for (const name of candidates) {
    try {
      const { data, error, count } = await supabase
        .from(name)
        .select('*', { count: 'exact', head: true })
      if (!error) {
        existing.push({ name, count: count ?? 0 })
        console.log('✓ EXISTS:', name, 'rows:', count)
      }
    } catch (e) {
      // ignore
    }
  }

  console.log('\n=== Summary ===')
  console.log('Existing tables:', existing.length)
  for (const t of existing) {
    console.log(` - ${t.name}: ${t.count} rows`)
  }
}

main().catch((e) => {
  console.error('FATAL', e)
  process.exit(1)
})
