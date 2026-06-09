/**
 * Manual validation script for the Risk Engine (HU-05)
 * Run with: node scripts/test-risk-engine.cjs
 * This validates all acceptance criteria without requiring Jest configuration.
 */

const path = require('path')
const fs = require('fs')

// Read and evaluate the risk engine module manually (since it uses ESM exports)
const riskEngineCode = fs.readFileSync(path.join(__dirname, '..', 'src', 'services', 'riskEngine.js'), 'utf-8')

// Create a sandbox module environment
const Module = require('module')
const vm = require('vm')

const sandbox = {
  exports: {},
  require,
  __dirname: path.join(__dirname, '..', 'src', 'services'),
  __filename: path.join(__dirname, '..', 'src', 'services', 'riskEngine.js'),
  console,
}

// Wrap the code to capture exports
const wrappedCode = `
(function(exports, require, module, __filename, __dirname) {
  ${riskEngineCode}
  return module.exports;
})
`

const func = vm.runInNewContext(wrappedCode, sandbox, { filename: 'riskEngine.js' })
const riskEngine = func(sandbox.exports, sandbox.require, { exports: sandbox.exports }, sandbox.__filename, sandbox.__dirname)

const { calculateRisk, processStudentsWithRisk } = riskEngine

let passed = 0
let failed = 0

function assert(condition, message) {
  if (condition) {
    console.log(`  ✅ ${message}`)
    passed++
  } else {
    console.log(`  ❌ ${message}`)
    failed++
  }
}

function assertEqual(actual, expected, message) {
  const pass = actual === expected
  if (pass) {
    console.log(`  ✅ ${message}`)
    passed++
  } else {
    console.log(`  ❌ ${message} (expected: ${expected}, got: ${actual})`)
    failed++
  }
}

function assertInRange(value, min, max, message) {
  const pass = value >= min && value <= max
  if (pass) {
    console.log(`  ✅ ${message}`)
    passed++
  } else {
    console.log(`  ❌ ${message} (value ${value} not in range [${min}, ${max}])`)
    failed++
  }
}

console.log('\n' + '='.repeat(60))
console.log('HU-05: Risk Engine Acceptance Tests')
console.log('='.repeat(60))

// ─── Acceptance Criterion 1: Risk levels LOW, MEDIUM, HIGH ─────────────────

console.log('\n📋 Criterion 1: System must calculate LOW, MEDIUM, or HIGH risk')

const highRisk = calculateRisk({ gpa: 8, attendance: 30, cursosDesaprobados: 4, creditosAprobados: 30, creditosTotales: 200 })
assertEqual(highRisk.risk, 'HIGH', 'High risk for poor scores')
assert(highRisk.riskScore < 40, 'High risk score < 40')
assertEqual(highRisk.recommendation, 'Requiere intervención inmediata', 'High risk recommendation correct')

const mediumRisk = calculateRisk({ gpa: 13, attendance: 70, cursosDesaprobados: 1, creditosAprobados: 80, creditosTotales: 200 })
assertEqual(mediumRisk.risk, 'MEDIUM', 'Medium risk for average scores')
assert(mediumRisk.riskScore >= 40 && mediumRisk.riskScore < 65, 'Medium risk score 40-65')
assertEqual(mediumRisk.recommendation, 'Necesita seguimiento académico', 'Medium risk recommendation correct')

const lowRisk = calculateRisk({ gpa: 18, attendance: 95, cursosDesaprobados: 0, creditosAprobados: 150, creditosTotales: 200 })
assertEqual(lowRisk.risk, 'LOW', 'Low risk for excellent scores')
assert(lowRisk.riskScore >= 65, 'Low risk score >= 65')
assertEqual(lowRisk.recommendation, 'Rendimiento estable', 'Low risk recommendation correct')

// ─── Acceptance Criterion 2: Calculation uses notas, asistencia, desaprobados ─

console.log('\n📋 Criterion 2: Calculation uses notas, asistencia, cursos desaprobados')

const gpaHigh = calculateRisk({ gpa: 18, attendance: 90, cursosDesaprobados: 0 })
const gpaLow = calculateRisk({ gpa: 5, attendance: 90, cursosDesaprobados: 0 })
assert(gpaHigh.riskScore > gpaLow.riskScore, 'GPA (notas) affects risk score - higher GPA = lower risk')

const attHigh = calculateRisk({ gpa: 15, attendance: 95, cursosDesaprobados: 0 })
const attLow = calculateRisk({ gpa: 15, attendance: 20, cursosDesaprobados: 0 })
assert(attHigh.riskScore > attLow.riskScore, 'Attendance (asistencia) affects risk score')

const failHigh = calculateRisk({ gpa: 15, attendance: 80, cursosDesaprobados: 0 })
const failLow = calculateRisk({ gpa: 15, attendance: 80, cursosDesaprobados: 4 })
assert(failHigh.riskScore > failLow.riskScore, 'Failed courses (cursos desaprobados) affects risk score')

const progHigh = calculateRisk({ gpa: 15, attendance: 80, cursosDesaprobados: 0, creditosAprobados: 180, creditosTotales: 200 })
const progLow = calculateRisk({ gpa: 15, attendance: 80, cursosDesaprobados: 0, creditosAprobados: 10, creditosTotales: 200 })
assert(progHigh.riskScore > progLow.riskScore, 'Academic progress (progreso) affects risk score')

// ─── Acceptance Criterion 3: Every student has a risk level ─────────────────

console.log('\n📋 Criterion 3: Every student must have a risk level assigned')

const students = [
  { id: 1, gpa: 10, attendance: 45, cursosDesaprobados: 3, creditosAprobados: 72, creditosTotales: 200 },
  { id: 2, gpa: 17, attendance: 92, cursosDesaprobados: 0, creditosAprobados: 128, creditosTotales: 200 },
  { id: 3, gpa: 13, attendance: 70, cursosDesaprobados: 1, creditosAprobados: 42, creditosTotales: 200 },
  { id: 4, gpa: 14, attendance: 65, cursosDesaprobados: 1, creditosAprobados: 96, creditosTotales: 200 },
]

const processed = processStudentsWithRisk(students)
assertEqual(processed.length, 4, 'All 4 students processed')

processed.forEach((s) => {
  assert(s.risk !== undefined && s.risk !== null, `Student ${s.id} has risk assigned (got ${s.risk})`)
  assert(['LOW', 'MEDIUM', 'HIGH'].includes(s.risk), `Student ${s.id} risk is valid (${s.risk})`)
  assertInRange(s.riskScore, 0, 100, `Student ${s.id} risk score in range 0-100 (${s.riskScore})`)
  assert(s.recommendation !== undefined, `Student ${s.id} has recommendation`)
  assert(s.riskComponents !== undefined, `Student ${s.id} has risk components breakdown`)
})

// ─── Edge Cases ────────────────────────────────────────────────────────────

console.log('\n📋 Edge Cases')

const missingOpt = calculateRisk({ gpa: 15, attendance: 80 })
assert(missingOpt.risk !== undefined, 'Handles missing optional fields')

const nullResult = calculateRisk(null)
assertEqual(nullResult.risk, 'MEDIUM', 'Handles null input')

assertEqual(processStudentsWithRisk(null).length, 0, 'Handles null collection')
assertEqual(processStudentsWithRisk(undefined).length, 0, 'Handles undefined collection')

// ─── Summary ───────────────────────────────────────────────────────────────

console.log('\n' + '='.repeat(60))
console.log(`Results: ${passed} passed, ${failed} failed out of ${passed + failed} tests`)
console.log('='.repeat(60))

if (failed > 0) {
  process.exit(1)
}