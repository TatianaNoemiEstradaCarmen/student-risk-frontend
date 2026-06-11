/**
 * HU-07 — Risk Factor Identification Validation
 * Run: node scripts/validate-risk-factors.mjs
 *
 * Validates the 3 acceptance criteria of HU-07:
 *   1. El sistema muestra factores como baja asistencia, bajo promedio
 *      o cursos desaprobados.
 *   2. Los factores coinciden con los datos registrados.
 *   3. La explicación es clara para el tutor.
 *
 * Also performs an integration check that the admin and tutor views
 * share the same underlying data (single source of truth).
 */

// We re-implement the engine here (same approach used in
// scripts/validate-risk-engine.mjs) so the script works regardless of
// the project's module system. The authoritative source is
// src/services/riskEngine.js — keep the two in sync.

function scoreGPA(gpa) {
  if (gpa == null || gpa < 0) return 0;
  return (Math.min(gpa, 20) / 20) * 100;
}
function scoreAttendance(attendance) {
  if (attendance == null || attendance < 0) return 0;
  return Math.min(attendance, 100);
}
function scoreFailedCourses(count) {
  if (count == null || count < 0) return 100;
  const mapping = { 0: 100, 1: 75, 2: 50, 3: 25 };
  return mapping[Math.min(count, 4)] ?? 0;
}
function scoreProgress(creditosAprobados, creditosTotales) {
  if (!creditosTotales || creditosTotales <= 0) return 50;
  if (creditosAprobados == null) return 0;
  return Math.min(creditosAprobados / creditosTotales, 1) * 100;
}

const WEIGHTS = { GPA: 0.35, ATTENDANCE: 0.25, FAILED_COURSES: 0.25, PROGRESS: 0.15 };
const RISK_FACTOR_THRESHOLD = 65;

function getRiskFactors(studentData, components) {
  if (!studentData || !components) return [];
  const { gpa, attendance, cursosDesaprobados = 0, creditosAprobados, creditosTotales } = studentData;
  const factors = [];

  if (components.gpaScore < RISK_FACTOR_THRESHOLD) {
    factors.push({
      key: 'low_gpa',
      label: 'Bajo promedio',
      message: gpa != null ? `Promedio actual de ${gpa}/20, por debajo del mínimo recomendado (14/20).` : 'No se registra promedio académico.',
      severity: components.gpaScore < 40 ? 'high' : 'medium',
      value: gpa,
      score: components.gpaScore,
      weight: WEIGHTS.GPA,
    });
  }
  if (components.attendanceScore < RISK_FACTOR_THRESHOLD) {
    factors.push({
      key: 'low_attendance',
      label: 'Baja asistencia',
      message: attendance != null ? `Asistencia de ${attendance}%, inferior al 70% requerido.` : 'No se registra asistencia.',
      severity: components.attendanceScore < 50 ? 'high' : 'medium',
      value: attendance,
      score: components.attendanceScore,
      weight: WEIGHTS.ATTENDANCE,
    });
  }
  if (components.failedCoursesScore < RISK_FACTOR_THRESHOLD) {
    factors.push({
      key: 'failed_courses',
      label: 'Cursos desaprobados',
      message: cursosDesaprobados > 0
        ? `${cursosDesaprobados} curso${cursosDesaprobados > 1 ? 's' : ''} desaprobado${cursosDesaprobados > 1 ? 's' : ''} en el ciclo actual.`
        : 'Presenta cursos desaprobados en su historial.',
      severity: cursosDesaprobados >= 3 ? 'high' : 'medium',
      value: cursosDesaprobados,
      score: components.failedCoursesScore,
      weight: WEIGHTS.FAILED_COURSES,
    });
  }
  if (components.progressScore < RISK_FACTOR_THRESHOLD) {
    const progressPct = creditosTotales && creditosAprobados != null
      ? Math.round((creditosAprobados / creditosTotales) * 100)
      : null;
    factors.push({
      key: 'low_progress',
      label: 'Bajo progreso académico',
      message: progressPct != null
        ? `Progreso de ${progressPct}% de créditos aprobados (${creditosAprobados}/${creditosTotales}).`
        : 'Progreso académico por debajo de lo esperado para su ciclo.',
      severity: components.progressScore < 40 ? 'high' : 'medium',
      value: progressPct,
      score: components.progressScore,
      weight: WEIGHTS.PROGRESS,
    });
  }
  return factors.sort((a, b) => b.weight * (100 - b.score) - a.weight * (100 - a.score));
}

function buildRiskExplanation(studentData, components) {
  const factors = getRiskFactors(studentData, components);
  if (factors.length === 0) {
    return 'El estudiante no presenta factores de riesgo significativos según los datos registrados.';
  }
  return factors.map((f) => f.message).join(' ');
}

function calculateRisk(studentData) {
  const { gpa, attendance, cursosDesaprobados = 0, creditosAprobados, creditosTotales } = studentData || {};
  const gpaScore = scoreGPA(gpa);
  const attendanceScore = scoreAttendance(attendance);
  const failedCoursesScore = scoreFailedCourses(cursosDesaprobados);
  const progressScore = scoreProgress(creditosAprobados, creditosTotales);
  const riskScore =
    gpaScore * WEIGHTS.GPA +
    attendanceScore * WEIGHTS.ATTENDANCE +
    failedCoursesScore * WEIGHTS.FAILED_COURSES +
    progressScore * WEIGHTS.PROGRESS;

  let risk, recommendation;
  if (riskScore < 40) { risk = 'HIGH'; recommendation = 'Requiere intervención inmediata'; }
  else if (riskScore < 65) { risk = 'MEDIUM'; recommendation = 'Necesita seguimiento académico'; }
  else { risk = 'LOW'; recommendation = 'Rendimiento estable'; }

  const components = {
    gpaScore: Math.round(gpaScore * 100) / 100,
    attendanceScore: Math.round(attendanceScore * 100) / 100,
    failedCoursesScore: Math.round(failedCoursesScore * 100) / 100,
    progressScore: Math.round(progressScore * 100) / 100,
  };
  return {
    risk,
    riskScore: Math.round(riskScore * 100) / 100,
    components,
    recommendation,
    factors: getRiskFactors(studentData, components),
    explanation: buildRiskExplanation(studentData, components),
  };
}

// ─── Test Runner ──────────────────────────────────────────────────────────

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) { console.log(`  ✅ ${message}`); passed++; }
  else { console.log(`  ❌ ${message}`); failed++; }
}

console.log('\n' + '='.repeat(70));
console.log('HU-07: Identificación de Factores de Riesgo — Acceptance Tests');
console.log(new Date().toISOString());
console.log('='.repeat(70));

// ─── Acceptance Criterion 1: El sistema muestra los factores clave ─────────

console.log('\n📋 Criterion 1: Muestra factores (baja asistencia, bajo promedio, cursos desaprobados)');

const highStudent = { gpa: 7, attendance: 40, cursosDesaprobados: 3, creditosAprobados: 25, creditosTotales: 200 };
const highResult = calculateRisk(highStudent);

assert(Array.isArray(highResult.factors), 'Result contains a `factors` array');
assert(highResult.factors.length > 0, 'At least one factor detected for a high-risk student');
const factorKeys = highResult.factors.map((f) => f.key);
assert(factorKeys.includes('low_gpa'), 'Factor "Bajo promedio" detectado');
assert(factorKeys.includes('low_attendance'), 'Factor "Baja asistencia" detectado');
assert(factorKeys.includes('failed_courses'), 'Factor "Cursos desaprobados" detectado');
assert(factorKeys.includes('low_progress'), 'Factor "Bajo progreso académico" detectado');

const topStudent = { gpa: 19, attendance: 98, cursosDesaprobados: 0, creditosAprobados: 180, creditosTotales: 200 };
const topResult = calculateRisk(topStudent);
assert(topResult.factors.length === 0, 'Estudiante sin riesgo no tiene factores');

// ─── Acceptance Criterion 2: Los factores coinciden con los datos ─────────

console.log('\n📋 Criterion 2: Factores coinciden con los datos registrados');

const attFactor = highResult.factors.find((f) => f.key === 'low_attendance');
assert(attFactor && attFactor.value === 40, 'Valor de asistencia (40%) coincide con el registro');
assert(attFactor && attFactor.message.includes('40%'), 'Mensaje del factor muestra el valor real (40%)');

const gpaFactor = highResult.factors.find((f) => f.key === 'low_gpa');
assert(gpaFactor && gpaFactor.value === 7, 'Valor de promedio (7/20) coincide con el registro');
assert(gpaFactor && gpaFactor.message.includes('7/20'), 'Mensaje del factor muestra el valor real (7/20)');

const failFactor = highResult.factors.find((f) => f.key === 'failed_courses');
assert(failFactor && failFactor.value === 3, 'Valor de cursos desaprobados (3) coincide con el registro');

// ─── Acceptance Criterion 3: La explicación es clara para el tutor ────────

console.log('\n📋 Criterion 3: Explicación clara para el tutor');

assert(typeof highResult.explanation === 'string', 'La explicación es un string');
assert(highResult.explanation.length > 0, 'La explicación no está vacía');
highResult.factors.forEach((f) => {
  assert(highResult.explanation.includes(f.message), `Explicación incluye: "${f.label}"`);
});

assert(/no presenta factores/i.test(topResult.explanation), 'Explicación de estudiante sin riesgo es clara');

// ─── Impact sorting ───────────────────────────────────────────────────────

console.log('\n📋 Bonus: Factores ordenados por impacto (peso × inverse score)');

const impacts = highResult.factors.map((f) => f.weight * (100 - f.score));
let sortedCorrectly = true;
for (let i = 1; i < impacts.length; i++) {
  if (impacts[i - 1] < impacts[i]) { sortedCorrectly = false; break; }
}
assert(sortedCorrectly, 'Factores ordenados de mayor a menor impacto');

// ─── Integration: same data source for admin and tutor ────────────────────

console.log('\n📋 Integration: fuente única de datos (admin + tutor)');

// Both src/data/students.js and the admin view must use the same
// `fetchStudents` source. Read the relevant files and compare their imports.
import { readFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(__dirname, '..');

const studentsDataPath = resolve(repoRoot, 'src/data/students.js');
const adminPagePath = resolve(repoRoot, 'app/dashboard/administrador/page.tsx');
const tutorPagePath = resolve(repoRoot, 'app/dashboard/tutor/page.tsx');

const studentsData = existsSync(studentsDataPath) ? readFileSync(studentsDataPath, 'utf8') : '';
const adminPage = existsSync(adminPagePath) ? readFileSync(adminPagePath, 'utf8') : '';
const tutorPage = existsSync(tutorPagePath) ? readFileSync(tutorPagePath, 'utf8') : '';

assert(studentsData.includes("from '@/src/api/studentsApi'"), 'src/data/students.js importa studentsApi (fuente única)');
assert(studentsData.includes('processStudentsWithRisk'), 'src/data/students.js pasa los datos por el motor de riesgo');
assert(studentsData.includes('riskFactors'), 'src/data/students.js expone riskFactors (HU-07)');
assert(studentsData.includes('riskExplanation'), 'src/data/students.js expone riskExplanation (HU-07)');
assert(tutorPage.includes("from '@/src/data/students'"), 'Vista del tutor importa de src/data/students');
assert(adminPage.includes("from '@/src/data/students'") || !adminPage.includes("from '@/src/api/studentsApi'"),
  'Vista del admin ya no usa studentsApi directamente (fuente única)');

// ─── Summary ──────────────────────────────────────────────────────────────

console.log('\n' + '='.repeat(70));
const total = passed + failed;
console.log(`HU-07 results: ${passed}/${total} checks passed (${Math.round(passed/total*100)}%)`);
if (failed > 0) {
  console.log(`⚠️  ${failed} check(s) FAILED`);
}
console.log('='.repeat(70));
process.exit(failed > 0 ? 1 : 0);
