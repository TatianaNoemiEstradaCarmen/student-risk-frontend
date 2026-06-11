/**
 * Centralized students data layer
 * ===============================
 * This module is the SINGLE source of truth used by every dashboard view
 * (administrador, tutor, estudiante, …). The raw data lives in
 * `src/api/studentsApi.js`, which fetches from Supabase (estudiantes +
 * registro_academico). From there we:
 *
 *   1. Normalize the field names (some legacy views use `nombre`, the
 *      API uses `name`; we expose both so existing UI code keeps working).
 *   2. Run every record through the risk engine (HU-05) so the UI gets
 *      `risk`, `riskScore`, `riskComponents`, `riskFactors` and
 *      `riskExplanation` pre-computed.
 *   3. Derive high-level KPIs and the alerts list the tutor view shows
 *      (HU-07: each alert now carries the factors that triggered it).
 *
 * All exports are **async** because the underlying API is async.
 */

import { fetchStudents } from '@/src/api/studentsApi'
import { processStudentsWithRisk } from '@/src/services/riskEngine'

// ─── 1 + 2. Load and process with the risk engine (HU-05 + HU-07) ─────────
async function loadProcessed() {
  const raw = await fetchStudents()
  // Normalize name alias
  const normalized = raw.map((s) => ({
    ...s,
    nombre: s.nombre ?? s.name,
  }))
  return processStudentsWithRisk(normalized)
}

// ─── 3. Aggregated stats (used by dashboard KPI cards) ────────────────────
export async function getRiskStats() {
  const list = await loadProcessed()
  return {
    high: list.filter((s) => s.risk === 'HIGH').length,
    medium: list.filter((s) => s.risk === 'MEDIUM').length,
    low: list.filter((s) => s.risk === 'LOW').length,
    total: list.length,
  }
}

// ─── 4. Alerts for the tutor view (HU-07) ─────────────────────────────────
export async function getAlerts() {
  const list = await loadProcessed()
  return list
    .filter((student) => student.risk === 'HIGH')
    .map((student) => ({
      id: student.id,
      codigo: student.codigo,
      student: student.name,
      nombre: student.nombre,
      carrera: student.carrera,
      ciclo: student.ciclo,
      message: 'Riesgo alto de deserción',
      recommendation: student.recommendation,
      riskScore: student.riskScore,
      components: student.riskComponents,
      factors: student.riskFactors,
      explanation: student.riskExplanation,
    }))
}

// ─── 5. All processed students (used by the admin view) ───────────────────
export async function getStudents() {
  return loadProcessed()
}

// ─── 6. Generic search used by the tutor view ────────────────────────────
export async function findStudentProfile(searchTerm) {
  if (!searchTerm) return null
  const list = await loadProcessed()
  const term = searchTerm.toString().toLowerCase()
  return list.find(
    (student) =>
      student.codigo?.toLowerCase().includes(term) ||
      student.name?.toLowerCase().includes(term) ||
      student.nombre?.toLowerCase().includes(term),
  )
}

// ─── 7. Synchronous fallback (in case any view still imports the old API) ─
// Returns [] immediately and lets the consumer refetch via getStudents().
export const students = []
export const alerts = []
export const riskStats = { high: 0, medium: 0, low: 0, total: 0 }
