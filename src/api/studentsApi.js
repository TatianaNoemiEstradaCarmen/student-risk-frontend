/**
 * Students API
 * ============
 * Single source of truth for student records.
 *
 * Backed by Supabase:
 *   - `estudiantes`          → identity + cycle + carrera + créditos
 *   - `registro_academico`   → nota, asistencia, cursos_desaprobados
 *
 * The API returns **already-joined** records so the risk engine
 * (HU-05) receives the exact field names it expects: gpa, attendance,
 * cursosDesaprobados, creditosAprobados, creditosTotales.
 *
 * Every function is async. Consumers (src/data/students.js, tutor
 * view, admin view) `await` the result.
 */
import { supabase } from '@/src/lib/supabase'

// ─── Fallback in-memory cache (used while a request is in flight) ─────────
let cache = null
let inflight = null

// ─── Internal helpers ────────────────────────────────────────────────────

/** Join each estudiante with their latest registro_academico row. */
function joinWithAcademic(estudiantes, registros) {
  // Keep only the most recent record per estudiante
  const latestByStudent = new Map()
  for (const r of registros || []) {
    const prev = latestByStudent.get(r.estudiante_id)
    if (!prev) {
      latestByStudent.set(r.estudiante_id, r)
      continue
    }
    const prevDate = new Date(prev.fecha_registro || 0).getTime()
    const newDate = new Date(r.fecha_registro || 0).getTime()
    if (newDate >= prevDate) latestByStudent.set(r.estudiante_id, r)
  }

  return estudiantes.map((e) => {
    const r = latestByStudent.get(e.id) || {}
    return {
      id: e.id,
      codigo: e.codigo,
      dni: e.dni,
      // aliases so the existing UI (admin + tutor) keeps working
      nombre: e.nombre,
      name: e.nombre,
      correo: e.correo,
      telefono: e.telefono,
      ciclo: e.ciclo,
      carrera: e.carrera,
      sede: e.sede,
      modalidad: e.modalidad,
      estadoMatricula: e.estado_matricula,
      fechaRegistro: e.fecha_registro,
      riesgo: e.riesgo,                  // pre-calculated value from the DB
      puntajeRiesgo: e.puntaje_riesgo,   // pre-calculated score from the DB
      // ── fields the risk engine expects ────────────────────────────────
      gpa: r.nota ?? null,
      attendance: r.asistencia ?? null,
      cursosDesaprobados: r.cursos_desaprobados ?? 0,
      creditosAprobados: e.creditos_aprobados ?? null,
      creditosTotales: e.creditos_totales ?? 200,
    }
  })
}

async function loadFromSupabase() {
  const [estRes, regRes] = await Promise.all([
    supabase.from('estudiantes').select('*').order('id'),
    supabase.from('registro_academico').select('*'),
  ])

  if (estRes.error) throw new Error(`estudiantes: ${estRes.error.message}`)
  if (regRes.error) throw new Error(`registro_academico: ${regRes.error.message}`)

  const joined = joinWithAcademic(estRes.data || [], regRes.data || [])
  cache = joined
  return joined
}

// ─── Public API ──────────────────────────────────────────────────────────

/** Fetches all students. Cached after the first call. */
export async function fetchStudents() {
  if (cache) return cache
  if (inflight) return inflight
  inflight = loadFromSupabase().finally(() => {
    inflight = null
  })
  return inflight
}

export async function fetchStudentById(id) {
  const list = await fetchStudents()
  return list.find((s) => String(s.id) === String(id))
}

export async function fetchStudentByCode(codigo) {
  const list = await fetchStudents()
  return list.find((s) => s.codigo === codigo)
}

/** Force a refresh from Supabase (useful after inserts/updates). */
export async function refreshStudents() {
  cache = null
  return fetchStudents()
}
