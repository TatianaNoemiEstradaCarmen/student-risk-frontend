/**
 * Risk Assessment Engine
 * =======================
 * Centralized module to estimate student dropout risk based on:
 *   - GPA / Grades (notas)
 *   - Attendance (asistencia)
 *   - Failed courses (cursos desaprobados)
 *   - Academic progress (progreso: creditosAprobados / creditosTotales)
 *
 * Returns: { risk: 'LOW'|'MEDIUM'|'HIGH', riskScore: number, components: {...}, recommendation: string }
 */

// ─── Weight configuration ───────────────────────────────────────────────────
const WEIGHTS = {
  GPA: 0.35,            // 35 %
  ATTENDANCE: 0.25,     // 25 %
  FAILED_COURSES: 0.25, // 25 %
  PROGRESS: 0.15,       // 15 %
}

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

// ─── Main calculation ───────────────────────────────────────────────────────

/**
 * @param {Object} studentData
 * @param {number} studentData.gpa                - Average grade (0-20)
 * @param {number} studentData.attendance          - Attendance percentage (0-100)
 * @param {number} [studentData.cursosDesaprobados=0] - Number of failed courses
 * @param {number} [studentData.creditosAprobados] - Credits the student has passed (optional)
 * @param {number} [studentData.creditosTotales]   - Total credits for the career (optional)
 * @returns {{ risk: string, riskScore: number, components: object, recommendation: string }}
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

  return {
    risk,
    riskScore: Math.round(riskScore * 100) / 100,
    components: {
      gpaScore: Math.round(gpaScore * 100) / 100,
      attendanceScore: Math.round(attendanceScore * 100) / 100,
      failedCoursesScore: Math.round(failedCoursesScore * 100) / 100,
      progressScore: Math.round(progressScore * 100) / 100,
    },
    recommendation,
  }
}

/**
 * Process an array of students, adding risk assessment to each.
 * @param {Array} students
 * @returns {Array} Students with risk, riskScore, components, recommendation attached
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
    }
  })
}