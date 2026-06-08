/**
 * Acceptance Tests for Risk Engine (HU-05 + HU-07)
 * =================================================
 * HU-05 - Análisis de datos para estimar riesgo de deserción
 *   1. Validar que el sistema calcule riesgo bajo, medio o alto.
 *   2. Validar que el cálculo use notas, asistencia y cursos desaprobados.
 *   3. Validar que cada estudiante tenga un nivel de riesgo asignado.
 *
 * HU-07 - Identificación de factores que influyen en el riesgo
 *   1. Validar que el sistema muestre factores como baja asistencia,
 *      bajo promedio o cursos desaprobados.
 *   2. Validar que los factores coincidan con los datos registrados.
 *   3. Validar que la explicación sea clara para el tutor.
 */
import {
  calculateRisk,
  processStudentsWithRisk,
  getRiskFactors,
  buildRiskExplanation,
} from '../services/riskEngine'

describe('HU-05: Risk Assessment Engine', () => {
  // ─── Test 1: Validate LOW, MEDIUM, HIGH risk levels ───────────────────────

  test('should return HIGH risk for poor grades, low attendance, and many failed courses', () => {
    const result = calculateRisk({
      gpa: 8,
      attendance: 30,
      cursosDesaprobados: 4,
      creditosAprobados: 30,
      creditosTotales: 200,
    })
    expect(result.risk).toBe('HIGH')
    expect(result.riskScore).toBeLessThan(40)
    expect(result.recommendation).toBe('Requiere intervención inmediata')
  })

  test('should return MEDIUM risk for average grades and moderate attendance', () => {
    const result = calculateRisk({
      gpa: 13,
      attendance: 70,
      cursosDesaprobados: 1,
      creditosAprobados: 80,
      creditosTotales: 200,
    })
    expect(result.risk).toBe('MEDIUM')
    expect(result.riskScore).toBeGreaterThanOrEqual(40)
    expect(result.riskScore).toBeLessThan(65)
    expect(result.recommendation).toBe('Necesita seguimiento académico')
  })

  test('should return LOW risk for excellent grades and high attendance', () => {
    const result = calculateRisk({
      gpa: 18,
      attendance: 95,
      cursosDesaprobados: 0,
      creditosAprobados: 150,
      creditosTotales: 200,
    })
    expect(result.risk).toBe('LOW')
    expect(result.riskScore).toBeGreaterThanOrEqual(65)
    expect(result.recommendation).toBe('Rendimiento estable')
  })

  // ─── Test 2: Validate all 4 variables affect the calculation ───────────────

  test('should use GPA (notas) in the calculation', () => {
    const highResult = calculateRisk({ gpa: 18, attendance: 90, cursosDesaprobados: 0 })
    const lowResult = calculateRisk({ gpa: 5, attendance: 90, cursosDesaprobados: 0 })
    expect(highResult.riskScore).toBeGreaterThan(lowResult.riskScore)
  })

  test('should use attendance (asistencia) in the calculation', () => {
    const highResult = calculateRisk({ gpa: 15, attendance: 95, cursosDesaprobados: 0 })
    const lowResult = calculateRisk({ gpa: 15, attendance: 20, cursosDesaprobados: 0 })
    expect(highResult.riskScore).toBeGreaterThan(lowResult.riskScore)
  })

  test('should use failed courses (cursos desaprobados) in the calculation', () => {
    const highResult = calculateRisk({ gpa: 15, attendance: 80, cursosDesaprobados: 0 })
    const lowResult = calculateRisk({ gpa: 15, attendance: 80, cursosDesaprobados: 4 })
    expect(highResult.riskScore).toBeGreaterThan(lowResult.riskScore)
  })

  test('should use academic progress (creditos aprobados / totales) in the calculation', () => {
    const highResult = calculateRisk({ gpa: 15, attendance: 80, cursosDesaprobados: 0, creditosAprobados: 180, creditosTotales: 200 })
    const lowResult = calculateRisk({ gpa: 15, attendance: 80, cursosDesaprobados: 0, creditosAprobados: 10, creditosTotales: 200 })
    expect(highResult.riskScore).toBeGreaterThan(lowResult.riskScore)
  })

  // ─── Test 3: Every student must have a risk level assigned ─────────────────

  test('should assign risk to every student in a collection', () => {
    const students = [
      { id: 1, gpa: 10, attendance: 45, cursosDesaprobados: 3, creditosAprobados: 72, creditosTotales: 200 },
      { id: 2, gpa: 17, attendance: 92, cursosDesaprobados: 0, creditosAprobados: 128, creditosTotales: 200 },
      { id: 3, gpa: 13, attendance: 70, cursosDesaprobados: 1, creditosAprobados: 42, creditosTotales: 200 },
      { id: 4, gpa: 14, attendance: 65, cursosDesaprobados: 1, creditosAprobados: 96, creditosTotales: 200 },
    ]

    const processed = processStudentsWithRisk(students)

    expect(processed).toHaveLength(4)
    processed.forEach((student) => {
      expect(student.risk).toBeDefined()
      expect(['LOW', 'MEDIUM', 'HIGH']).toContain(student.risk)
      expect(student.riskScore).toBeGreaterThanOrEqual(0)
      expect(student.riskScore).toBeLessThanOrEqual(100)
      expect(student.recommendation).toBeDefined()
      expect(student.riskComponents).toBeDefined()
      expect(student.riskComponents.gpaScore).toBeGreaterThanOrEqual(0)
      expect(student.riskComponents.attendanceScore).toBeGreaterThanOrEqual(0)
      expect(student.riskComponents.failedCoursesScore).toBeGreaterThanOrEqual(0)
    })
  })

  // ─── Edge cases ────────────────────────────────────────────────────────────

  test('should handle missing optional fields gracefully', () => {
    const result = calculateRisk({ gpa: 15, attendance: 80 })
    expect(result.risk).toBeDefined()
    expect(result.riskScore).toBeGreaterThan(0)
  })

  test('should handle null/undefined input gracefully', () => {
    const result = calculateRisk(null)
    expect(result.risk).toBe('MEDIUM') // neutral scores → medium
    expect(result.riskScore).toBeGreaterThanOrEqual(0)
  })

  test('should return empty array for non-array input in processStudentsWithRisk', () => {
    expect(processStudentsWithRisk(null)).toEqual([])
    expect(processStudentsWithRisk(undefined)).toEqual([])
    expect(processStudentsWithRisk('not array')).toEqual([])
  })

  // ─── Score component validation ───────────────────────────────────────────

  test('components should sum up to riskScore when weighted', () => {
    const result = calculateRisk({
      gpa: 14,
      attendance: 80,
      cursosDesaprobados: 1,
      creditosAprobados: 100,
      creditosTotales: 200,
    })

    const c = result.components
    const expectedWeighted =
      c.gpaScore * 0.35 +
      c.attendanceScore * 0.25 +
      c.failedCoursesScore * 0.25 +
      c.progressScore * 0.15

    expect(result.riskScore).toBeCloseTo(expectedWeighted, 1)
  })
})

// ════════════════════════════════════════════════════════════════════════════
// HU-07: Identificación de factores que influyen en el riesgo
// ════════════════════════════════════════════════════════════════════════════

describe('HU-07: Risk factor identification', () => {
  // ─── Test 1: El sistema muestra los factores clave ───────────────────────

  test('should return a `factors` array with the known risk factors (HU-07 AC#1)', () => {
    const result = calculateRisk({
      gpa: 8,
      attendance: 30,
      cursosDesaprobados: 4,
      creditosAprobados: 30,
      creditosTotales: 200,
    })

    expect(Array.isArray(result.factors)).toBe(true)
    expect(result.factors.length).toBeGreaterThan(0)

    const keys = result.factors.map((f) => f.key)
    expect(keys).toContain('low_gpa')
    expect(keys).toContain('low_attendance')
    expect(keys).toContain('failed_courses')
    expect(keys).toContain('low_progress')
  })

  test('should return an empty factors array for a top-performing student', () => {
    const result = calculateRisk({
      gpa: 19,
      attendance: 98,
      cursosDesaprobados: 0,
      creditosAprobados: 180,
      creditosTotales: 200,
    })
    expect(result.factors).toEqual([])
  })

  // ─── Test 2: Los factores coinciden con los datos registrados ────────────

  test('factors should reference the actual values from the student data (HU-07 AC#2)', () => {
    const student = {
      gpa: 7,
      attendance: 40,
      cursosDesaprobados: 3,
      creditosAprobados: 25,
      creditosTotales: 200,
    }
    const result = calculateRisk(student)

    const attendanceFactor = result.factors.find((f) => f.key === 'low_attendance')
    expect(attendanceFactor).toBeDefined()
    expect(attendanceFactor.value).toBe(40) // mismo valor del registro
    expect(attendanceFactor.message).toContain('40%')

    const gpaFactor = result.factors.find((f) => f.key === 'low_gpa')
    expect(gpaFactor).toBeDefined()
    expect(gpaFactor.value).toBe(7)
    expect(gpaFactor.message).toContain('7/20')

    const failedFactor = result.factors.find((f) => f.key === 'failed_courses')
    expect(failedFactor).toBeDefined()
    expect(failedFactor.value).toBe(3)
  })

  test('only factors whose component is below threshold should be reported', () => {
    // Buen promedio + baja asistencia => sólo debería aparecer "baja asistencia"
    const result = calculateRisk({
      gpa: 18,
      attendance: 40,
      cursosDesaprobados: 0,
      creditosAprobados: 150,
      creditosTotales: 200,
    })
    const keys = result.factors.map((f) => f.key)
    expect(keys).toContain('low_attendance')
    expect(keys).not.toContain('low_gpa')
    expect(keys).not.toContain('failed_courses')
  })

  test('factors should be sorted by impact (most influential first)', () => {
    const result = calculateRisk({
      gpa: 5, // weight 0.35 — más alto
      attendance: 30, // weight 0.25
      cursosDesaprobados: 4, // weight 0.25
      creditosAprobados: 20,
      creditosTotales: 200,
    })

    // Calculamos impacto y comparamos contra el orden entregado
    const impacts = result.factors.map((f) => f.weight * (100 - f.score))
    for (let i = 1; i < impacts.length; i++) {
      expect(impacts[i - 1]).toBeGreaterThanOrEqual(impacts[i])
    }
  })

  // ─── Test 3: La explicación es clara para el tutor ───────────────────────

  test('explanation should be a non-empty string that lists every factor (HU-07 AC#3)', () => {
    const result = calculateRisk({
      gpa: 7,
      attendance: 40,
      cursosDesaprobados: 3,
      creditosAprobados: 25,
      creditosTotales: 200,
    })

    expect(typeof result.explanation).toBe('string')
    expect(result.explanation.length).toBeGreaterThan(0)
    result.factors.forEach((f) => {
      expect(result.explanation).toContain(f.message)
    })
  })

  test('explanation for a top student should state that no risk factors were found', () => {
    const result = calculateRisk({
      gpa: 19,
      attendance: 98,
      cursosDesaprobados: 0,
      creditosAprobados: 180,
      creditosTotales: 200,
    })
    expect(result.explanation).toMatch(/no presenta factores/i)
  })

  test('each factor should have a label, message, value, score and severity', () => {
    const result = calculateRisk({
      gpa: 5,
      attendance: 30,
      cursosDesaprobados: 4,
      creditosAprobados: 20,
      creditosTotales: 200,
    })
    result.factors.forEach((f) => {
      expect(f.key).toBeDefined()
      expect(f.label).toBeDefined()
      expect(f.message).toBeDefined()
      expect(f.value).toBeDefined()
      expect(typeof f.score).toBe('number')
      expect(['high', 'medium', 'low']).toContain(f.severity)
      expect(typeof f.weight).toBe('number')
    })
  })

  // ─── Helper functions (getRiskFactors, buildRiskExplanation) ──────────────

  test('getRiskFactors should be exportable and standalone-callable', () => {
    const components = {
      gpaScore: 25,
      attendanceScore: 30,
      failedCoursesScore: 0,
      progressScore: 10,
    }
    const factors = getRiskFactors(
      { gpa: 5, attendance: 30, cursosDesaprobados: 0, creditosAprobados: 20, creditosTotales: 200 },
      components,
    )
    const keys = factors.map((f) => f.key)
    expect(keys).toContain('low_gpa')
    expect(keys).toContain('low_attendance')
    expect(keys).toContain('low_progress')
  })

  test('getRiskFactors should return [] for missing data', () => {
    expect(getRiskFactors(null, null)).toEqual([])
    expect(getRiskFactors({}, null)).toEqual([])
  })

  test('buildRiskExplanation should match getRiskFactors output', () => {
    const components = {
      gpaScore: 20,
      attendanceScore: 30,
      failedCoursesScore: 25,
      progressScore: 50,
    }
    const student = { gpa: 4, attendance: 30, cursosDesaprobados: 3, creditosAprobados: 100, creditosTotales: 200 }
    const factors = getRiskFactors(student, components)
    const explanation = buildRiskExplanation(student, components)
    factors.forEach((f) => expect(explanation).toContain(f.message))
  })

  // ─── Integration with processStudentsWithRisk ─────────────────────────────

  test('processStudentsWithRisk should attach factors + explanation to every student', () => {
    const processed = processStudentsWithRisk([
      { id: 1, gpa: 5, attendance: 30, cursosDesaprobados: 4, creditosAprobados: 20, creditosTotales: 200 },
      { id: 2, gpa: 18, attendance: 95, cursosDesaprobados: 0, creditosAprobados: 150, creditosTotales: 200 },
    ])
    expect(processed[0].riskFactors.length).toBeGreaterThan(0)
    expect(processed[0].riskExplanation.length).toBeGreaterThan(0)
    expect(processed[1].riskFactors).toEqual([])
  })
})
