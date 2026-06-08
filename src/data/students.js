/**
 * Centralized students data layer
 * ===============================
 * This module is the SINGLE source of truth used by every dashboard view
 * (administrador, tutor, estudiante, …). The raw data lives in
 * `src/api/studentsApi.js`. From there we:
 *
 *   1. Normalize the field names (some legacy views use `nombre`, the
 *      API uses `name`; we expose both so existing UI code keeps working).
 *   2. Run every record through the risk engine (HU-05) so the UI gets
 *      `risk`, `riskScore`, `riskComponents`, `riskFactors` and
 *      `riskExplanation` pre-computed.
 *   3. Derive high-level KPIs and the alerts list the tutor view shows
 *      (HU-07: each alert now carries the factors that triggered it).
 *
 * When the database is wired up later, only `src/api/studentsApi.js`
 * needs to change — every consumer will automatically stay in sync.
 */

import { fetchStudents } from '@/src/api/studentsApi'
import { processStudentsWithRisk } from '@/src/services/riskEngine'

// ─── 1. Normalize raw records from the API ─────────────────────────────────
const rawStudents = fetchStudents().map((s) => ({
  ...s,
  // Legacy alias used by the admin view: `nombre` ⇄ `name`
  nombre: s.nombre ?? s.name,
}))

// ─── 2. Process with the risk engine (HU-05 + HU-07) ────────────────────────
export const students = processStudentsWithRisk(rawStudents)

// ─── 3. Aggregated stats (used by dashboard KPI cards) ──────────────────────
export const riskStats = {
  high: students.filter((s) => s.risk === 'HIGH').length,
  medium: students.filter((s) => s.risk === 'MEDIUM').length,
  low: students.filter((s) => s.risk === 'LOW').length,
  total: students.length,
}

// ─── 4. Alerts for the tutor view (HU-07) ──────────────────────────────────
// Each alert now includes the detected factors + a tutor-friendly explanation
// so the tutor immediately understands *why* the student is flagged.
export const alerts = students
  .filter((student) => student.risk === 'HIGH')
  .map((student) => ({
    id: student.id,
    codigo: student.codigo,
    student: student.name,
    carrera: student.carrera,
    ciclo: student.ciclo,
    message: 'Riesgo alto de deserción',
    recommendation: student.recommendation,
    riskScore: student.riskScore,
    components: student.riskComponents,
    factors: student.riskFactors,
    explanation: student.riskExplanation,
  }))

// ─── 5. Generic search used by the tutor view ───────────────────────────────
export const findStudentProfile = (searchTerm) => {
  if (!searchTerm) return null
  const term = searchTerm.toString().toLowerCase()

  return students.find(
    (student) =>
      student.codigo?.toLowerCase().includes(term) ||
      student.name?.toLowerCase().includes(term) ||
      student.nombre?.toLowerCase().includes(term),
  )
}
