/**
 * Risk Assessment Engine
 * =======================
 * Centralized module to estimate student dropout risk based on:
 *   - GPA / Grades (notas)
 *   - Attendance (asistencia)
 *   - Failed courses (cursos desaprobados)
 *   - Academic progress (progreso: creditosAprobados / creditosTotales)
 *
 * Returns: { risk: 'LOW'|'MEDIUM'|'HIGH', riskScore, components, recommendation, factors, explanation }
 *
 * HU-05: Risk analysis engine (cálculo de riesgo).
 * HU-07: Identificación de factores que influyen en el riesgo.
 */

// ─── Weight configuration ───────────────────────────────────────────────────
const WEIGHTS = {
  GPA: 0.35,            // 35 %
  ATTENDANCE: 0.25,     // 25 %
  FAILED_COURSES: 0.25, // 25 %
  PROGRESS: 0.15,       // 15 %
}

// ─── Thresholds (configurable) ──────────────────────────────────────────────
// A component is considered a "risk factor" when its score falls below this
// threshold (out of 100). Tuned to match the weighted risk categories.
const RISK_FACTOR_THRESHOLD = 65

// ─── Scorers (each returns 0-100, where 100 = best / lowest risk) ───────────

/**
 * Score based on GPA (0-20 scale typical in Peru / Latin America).
 * 20 → 100 pts, 14 → 70 pts, 10 → 50 pts, 0 → 0 pts
 */
function scoreGPA(gpa) {
  if (gpa == null || gpa < 0) return 0
  const clamped = Math.min(gpa, 20)
  return (clamped / 20) * 100
}

/**
 * Score based on attendance percentage (0-100 %).
 * 100 % → 100 pts, 80 % → 80 pts, 0 % → 0 pts
 */
function scoreAttendance(attendance) {
  if (attendance == null || attendance < 0) return 0
  const clamped = Math.min(attendance, 100)
  return clamped
}

/**
 * Score based on number of failed courses.
 * 0 failed → 100 pts, 1 → 75, 2 → 50, 3 → 25, 4+ → 0
 */
function scoreFailedCourses(count) {
  if (count == null || count < 0) return 100
  const clamped = Math.min(count, 4)
  const mapping = { 0: 100, 1: 75, 2: 50, 3: 25 }
  return mapping[clamped] ?? 0
}

/**
 * Score based on academic progress (creditosAprobados / creditosTotales).
 * 100 % progress → 100 pts, 50 % → 50 pts, 0 % → 0 pts
 * Also rewards being further along in the career.
 */
function scoreProgress(creditosAprobados, creditosTotales) {
  if (!creditosTotales || creditosTotales <= 0) return 50 // neutral if unknown
  if (creditosAprobados == null) return 0
  const ratio = Math.min(creditosAprobados / creditosTotales, 1)
  return ratio * 100
}

// ─── Factor identification (HU-07) ──────────────────────────────────────────

/**
 * Identify which factors are driving the risk.
 * Each factor contains a human-readable message and the raw value observed
 * in the student's data, so the UI can show a clear explanation.
 *
 * @param {Object} studentData
 * @param {Object} components  Output from calculateRisk().components
 * @returns {Array<{ key, label, message, severity, value, score, weight }>}
 */
export function getRiskFactors(studentData, components) {
  if (!studentData || !components) return []

  const {
    gpa,
    attendance,
    cursosDesaprobados = 0,
    creditosAprobados,
    creditosTotales,
  } = studentData

  const factors = []

  // ── Factor: Bajo promedio (low GPA) ──────────────────────────────────────
  if (components.gpaScore < RISK_FACTOR_THRESHOLD) {
    factors.push({
      key: 'low_gpa',
      label: 'Bajo promedio',
      message:
        gpa != null
          ? `Promedio actual de ${gpa}/20, por debajo del mínimo recomendado (14/20).`
          : 'No se registra promedio académico.',
      severity: components.gpaScore < 40 ? 'high' : 'medium',
      value: gpa,
      score: components.gpaScore,
      weight: WEIGHTS.GPA,
    })
  }

  // ── Factor: Baja asistencia (low attendance) ─────────────────────────────
  if (components.attendanceScore < RISK_FACTOR_THRESHOLD) {
    factors.push({
      key: 'low_attendance',
      label: 'Baja asistencia',
      message:
        attendance != null
          ? `Asistencia de ${attendance}%, inferior al 70% requerido.`
          : 'No se registra asistencia.',
      severity: components.attendanceScore < 50 ? 'high' : 'medium',
      value: attendance,
      score: components.attendanceScore,
      weight: WEIGHTS.ATTENDANCE,
    })
  }

  // ── Factor: Cursos desaprobados (failed courses) ─────────────────────────
  if (components.failedCoursesScore < RISK_FACTOR_THRESHOLD) {
    factors.push({
      key: 'failed_courses',
      label: 'Cursos desaprobados',
      message:
        cursosDesaprobados > 0
          ? `${cursosDesaprobados} curso${cursosDesaprobados > 1 ? 's' : ''} desaprobado${
              cursosDesaprobados > 1 ? 's' : ''
            } en el ciclo actual.`
          : 'Presenta cursos desaprobados en su historial.',
      severity: cursosDesaprobados >= 3 ? 'high' : 'medium',
      value: cursosDesaprobados,
      score: components.failedCoursesScore,
      weight: WEIGHTS.FAILED_COURSES,
    })
  }

  // ── Factor: Bajo progreso académico ──────────────────────────────────────
  if (components.progressScore < RISK_FACTOR_THRESHOLD) {
    const progressPct =
      creditosTotales && creditosAprobados != null
        ? Math.round((creditosAprobados / creditosTotales) * 100)
        : null
    factors.push({
      key: 'low_progress',
      label: 'Bajo progreso académico',
      message:
        progressPct != null
          ? `Progreso de ${progressPct}% de créditos aprobados (${creditosAprobados}/${creditosTotales}).`
          : 'Progreso académico por debajo de lo esperado para su ciclo.',
      severity: components.progressScore < 40 ? 'high' : 'medium',
      value: progressPct,
      score: components.progressScore,
      weight: WEIGHTS.PROGRESS,
    })
  }

  // Sort factors by impact (weight × inverse score) → most influential first
  return factors.sort((a, b) => b.weight * (100 - b.score) - a.weight * (100 - a.score))
}

/**
 * Build a clear, tutor-friendly explanation string from the detected factors.
 * The text always references the actual data values from the student record,
 * satisfying HU-07 acceptance criteria 2 & 3.
 *
 * @param {Object} studentData
 * @param {Object} components
 * @returns {string}
 */
export function buildRiskExplanation(studentData, components) {
  const factors = getRiskFactors(studentData, components)
  if (factors.length === 0) {
    return 'El estudiante no presenta factores de riesgo significativos según los datos registrados.'
  }
  return factors.map((f) => f.message).join(' ')
}

// ─── Main calculation ───────────────────────────────────────────────────────

/**
 * @param {Object} studentData
 * @param {number} studentData.gpa                - Average grade (0-20)
 * @param {number} studentData.attendance          - Attendance percentage (0-100)
 * @param {number} [studentData.cursosDesaprobados=0] - Number of failed courses
 * @param {number} [studentData.creditosAprobados] - Credits the student has passed (optional)
 * @param {number} [studentData.creditosTotales]   - Total credits for the career (optional)
 * @returns {{ risk, riskScore, components, recommendation, factors, explanation }}
 */
export function calculateRisk(studentData) {
  const {
    gpa,
    attendance,
    cursosDesaprobados = 0,
    creditosAprobados,
    creditosTotales,
  } = studentData || {}

  // Calculate each dimension score (0-100, higher = better)
  const gpaScore = scoreGPA(gpa)
  const attendanceScore = scoreAttendance(attendance)
  const failedCoursesScore = scoreFailedCourses(cursosDesaprobados)
  const progressScore = scoreProgress(creditosAprobados, creditosTotales)

  // Weighted composite score (0-100, higher = lower risk)
  const riskScore =
    gpaScore * WEIGHTS.GPA +
    attendanceScore * WEIGHTS.ATTENDANCE +
    failedCoursesScore * WEIGHTS.FAILED_COURSES +
    progressScore * WEIGHTS.PROGRESS

  // Determine risk level
  let risk
  let recommendation

  if (riskScore < 40) {
    risk = 'HIGH'
    recommendation = 'Requiere intervención inmediata'
  } else if (riskScore < 65) {
    risk = 'MEDIUM'
    recommendation = 'Necesita seguimiento académico'
  } else {
    risk = 'LOW'
    recommendation = 'Rendimiento estable'
  }

  const components = {
    gpaScore: Math.round(gpaScore * 100) / 100,
    attendanceScore: Math.round(attendanceScore * 100) / 100,
    failedCoursesScore: Math.round(failedCoursesScore * 100) / 100,
    progressScore: Math.round(progressScore * 100) / 100,
  }

  // HU-07: Identify the factors driving the risk and build a clear explanation
  const factors = getRiskFactors(studentData, components)
  const explanation = buildRiskExplanation(studentData, components)

  return {
    risk,
    riskScore: Math.round(riskScore * 100) / 100,
    components,
    recommendation,
    factors,
    explanation,
  }
}

/**
 * Process an array of students, adding risk assessment to each.
 * @param {Array} students
 * @returns {Array} Students with risk, riskScore, components, recommendation, factors, explanation
 */
export function processStudentsWithRisk(students) {
  if (!Array.isArray(students)) return []
  return students.map((student) => {
    const assessment = calculateRisk(student)
    return {
      ...student,
      risk: assessment.risk,
      riskScore: assessment.riskScore,
      riskComponents: assessment.components,
      recommendation: assessment.recommendation,
      riskFactors: assessment.factors,
      riskExplanation: assessment.explanation,
    }
  })
}
