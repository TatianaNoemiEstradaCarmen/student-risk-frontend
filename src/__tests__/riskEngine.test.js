/**
 * Acceptance Tests for Risk Engine (HU-05)
 * ============================================
 * Pruebas de aceptación:
 * 1. Validar que el sistema calcule riesgo bajo, medio o alto.
 * 2. Validar que el cálculo use notas, asistencia y cursos desaprobados.
 * 3. Validar que cada estudiante tenga un nivel de riesgo asignado.
 */
import { calculateRisk, processStudentsWithRisk } from '../services/riskEngine'

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