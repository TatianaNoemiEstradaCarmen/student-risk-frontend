/**
 * Students Data Facade
 * =====================
 * Single source of truth for student data consumed by UI components.
 * 
 * Tanto el administrador como el tutor consumen desde aquí.
 * Este archivo envuelve la API y garantiza que el motor de riesgo
 * siempre se aplique antes de entregar los datos a la UI.
 */
import { fetchStudents as fetchStudentsFromApi, refreshStudents as refreshStudentsApi } from "@/src/api/studentsApi"
import { processStudentsWithRisk } from "@/src/services/riskEngine"

/**
 * Obtiene todos los estudiantes con su evaluación de riesgo completa.
 * 
 * Retorna cada estudiante con estos campos adicionales:
 *   - risk: 'LOW' | 'MEDIUM' | 'HIGH'
 *   - riskScore: number (0-100)
 *   - riskComponents: { gpaScore, attendanceScore, failedCoursesScore, progressScore }
 *   - recommendation: string
 *   - riskFactors: Array<{ key, label, message, severity, value, score, weight }>
 *   - riskExplanation: string
 */
export async function getStudents() {
  const students = await fetchStudentsFromApi()
  
  // Aplicar el motor de riesgo (HU-05 + HU-07) a cada estudiante
  const studentsWithRisk = processStudentsWithRisk(students)
  
  return studentsWithRisk
}

/**
 * Fuerza una recarga desde Supabase limpiando el cache.
 * Útil después de importar o modificar estudiantes.
 */
export async function refreshStudents() {
  const students = await refreshStudentsApi()
  return processStudentsWithRisk(students)
}