/**
 * MotorIA.ts
 * ==========
 * Algoritmos de IA reales implementados desde cero en TypeScript puro.
 * Sin dependencias externas. Corre en el browser.
 *
 * Coloca en: src/services/MotorIA.ts
 *
 * Contiene:
 *   1. Normalización de datos (Min-Max Scaling)
 *   2. KNN — Clasificación por vecinos más cercanos
 *   3. K-Means — Clustering para descubrir grupos naturales
 *   4. Regresión Logística — Probabilidad real de deserción
 *   5. Análisis de importancia de variables (feature importance)
 */

// ─────────────────────────────────────────────────────────────────────────────
// TIPOS
// ─────────────────────────────────────────────────────────────────────────────

export interface StudentFeatures {
  id: number | string
  nombre: string
  carrera: string
  ciclo: string
  promedio: number     // 0–20
  asistencia: number   // 0–100
  desaprobados: number // 0–N
}

export interface KNNResult {
  studentId: number | string
  nombre: string
  probabilidadDesercion: number  // 0–1
  nivel: 'ALTO' | 'MEDIO' | 'BAJO'
  vecinosMasCercanos: { nombre: string; distancia: number; desertor: boolean }[]
  confianza: number  // 0–1, qué tan unánimes fueron los vecinos
}

export interface Cluster {
  id: number
  nombre: string
  descripcion: string
  color: string
  centroide: { promedio: number; asistencia: number; desaprobados: number }
  miembros: StudentFeatures[]
  riesgoPromedio: number
  perfil: string
}

export interface KMeansResult {
  clusters: Cluster[]
  iteraciones: number
  convergioEn: number
}

export interface LogRegResult {
  studentId: number | string
  nombre: string
  probabilidad: number   // 0–1 probabilidad de deserción
  nivel: 'ALTO' | 'MEDIO' | 'BAJO'
  contribuciones: {
    variable: string
    valor: number
    peso: number
    impacto: 'positivo' | 'negativo'  // positivo = aumenta riesgo
  }[]
}

export interface FeatureImportance {
  variable: string
  importancia: number  // 0–1
  descripcion: string
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. NORMALIZACIÓN (Min-Max Scaling)
// ─────────────────────────────────────────────────────────────────────────────

function normalize(value: number, min: number, max: number): number {
  if (max === min) return 0
  return (value - min) / (max - min)
}

function getMinMax(students: StudentFeatures[]) {
  const promedios    = students.map(s => s.promedio)
  const asistencias  = students.map(s => s.asistencia)
  const desaprobados = students.map(s => s.desaprobados)
  return {
    promedio:    { min: Math.min(...promedios),    max: Math.max(...promedios) },
    asistencia:  { min: Math.min(...asistencias),  max: Math.max(...asistencias) },
    desaprobados:{ min: Math.min(...desaprobados), max: Math.max(...desaprobados) },
  }
}

// Convierte un estudiante a vector normalizado [0–1, 0–1, 0–1]
// El vector representa RIESGO: mayor = más riesgo
function toRiskVector(
  s: StudentFeatures,
  ranges: ReturnType<typeof getMinMax>
): [number, number, number] {
  return [
    1 - normalize(s.promedio,    ranges.promedio.min,    ranges.promedio.max),    // invertido: menos promedio = más riesgo
    1 - normalize(s.asistencia,  ranges.asistencia.min,  ranges.asistencia.max),  // invertido
        normalize(s.desaprobados, ranges.desaprobados.min, ranges.desaprobados.max), // directo
  ]
}

// Distancia Euclidiana entre dos vectores
function euclidean(a: number[], b: number[]): number {
  return Math.sqrt(a.reduce((sum, ai, i) => sum + Math.pow(ai - b[i], 2), 0))
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. KNN — K-Nearest Neighbors
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Genera etiquetas de entrenamiento basadas en criterios académicos reales.
 * En producción real, estas etiquetas vendrían de datos históricos de deserción.
 * Aquí las inferimos de los propios datos (aprendizaje semi-supervisado).
 */
function generarEtiquetas(students: StudentFeatures[]): boolean[] {
  // Calculamos score de riesgo base para cada estudiante
  const scores = students.map(s => {
    let score = 0
    if (s.promedio < 10)  score += 40
    else if (s.promedio < 13) score += 20
    else if (s.promedio < 15) score += 10

    if (s.asistencia < 65)  score += 35
    else if (s.asistencia < 75) score += 18
    else if (s.asistencia < 85) score += 8

    if (s.desaprobados >= 3) score += 25
    else if (s.desaprobados >= 2) score += 15
    else if (s.desaprobados >= 1) score += 5

    return score
  })

  // El 25% con mayor score se considera "en riesgo de deserción"
  const sorted = [...scores].sort((a, b) => b - a)
  const umbral = sorted[Math.floor(sorted.length * 0.25)] ?? 50

  return scores.map(s => s >= umbral)
}

export function runKNN(
  students: StudentFeatures[],
  k: number = 5
): KNNResult[] {
  if (students.length < k + 1) k = Math.max(1, students.length - 1)

  const ranges  = getMinMax(students)
  const vectors = students.map(s => toRiskVector(s, ranges))
  const labels  = generarEtiquetas(students)

  return students.map((student, idx) => {
    const vec = vectors[idx]

    // Calcular distancia a todos los demás
    const distancias = students
      .map((other, j) => ({
        j,
        nombre: other.nombre,
        distancia: euclidean(vec, vectors[j]),
        desertor: labels[j],
      }))
      .filter(d => d.j !== idx)
      .sort((a, b) => a.distancia - b.distancia)
      .slice(0, k)

    const desertores = distancias.filter(d => d.desertor).length
    const prob = desertores / k
    const confianza = Math.abs(prob - 0.5) * 2  // 0 = 50/50, 1 = unánime

    return {
      studentId: student.id,
      nombre: student.nombre,
      probabilidadDesercion: parseFloat(prob.toFixed(3)),
      nivel: prob >= 0.6 ? 'ALTO' : prob >= 0.35 ? 'MEDIO' : 'BAJO',
      vecinosMasCercanos: distancias.map(d => ({
        nombre: d.nombre,
        distancia: parseFloat(d.distancia.toFixed(3)),
        desertor: d.desertor,
      })),
      confianza: parseFloat(confianza.toFixed(3)),
    }
  })
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. K-MEANS CLUSTERING
// ─────────────────────────────────────────────────────────────────────────────

function centroideOf(vectors: number[][]): number[] {
  if (vectors.length === 0) return [0, 0, 0]
  const n = vectors[0].length
  return Array.from({ length: n }, (_, i) =>
    vectors.reduce((sum, v) => sum + v[i], 0) / vectors.length
  )
}

function asignarCluster(vec: number[], centroides: number[][]): number {
  let minDist = Infinity
  let cluster = 0
  centroides.forEach((c, i) => {
    const d = euclidean(vec, c)
    if (d < minDist) { minDist = d; cluster = i }
  })
  return cluster
}

const CLUSTER_PROFILES = [
  {
    nombre: 'Zona Crítica',
    descripcion: 'Bajo rendimiento, alta ausentismo y múltiples desaprobaciones. Intervención urgente.',
    color: '#ef4444',
    perfil: 'Estudiantes con todas las variables en rojo. Requieren tutoría inmediata y soporte psicológico.',
  },
  {
    nombre: 'Riesgo Latente',
    descripcion: 'Una o dos variables comprometidas. En la frontera del abandono.',
    color: '#f59e0b',
    perfil: 'Presentan señales mixtas. Buen momento para intervención preventiva antes de que escale.',
  },
  {
    nombre: 'Perfil Estable',
    descripcion: 'Rendimiento y asistencia aceptables. Bajo riesgo actual.',
    color: '#22c55e',
    perfil: 'Sin señales de alarma. Seguimiento estándar recomendado.',
  },
  {
    nombre: 'Alto Rendimiento',
    descripcion: 'Excelentes indicadores académicos. Candidatos a becas o liderazgo.',
    color: '#6366f1',
    perfil: 'Promedio alto, asistencia plena, sin desaprobaciones. Grupo modelo.',
  },
]

export function runKMeans(
  students: StudentFeatures[],
  k: number = 3,
  maxIter: number = 100
): KMeansResult {
  const ranges  = getMinMax(students)
  const vectors = students.map(s => toRiskVector(s, ranges))

  // Inicialización KMeans++ (mejor que random)
  const centroides: number[][] = []
  centroides.push(vectors[Math.floor(Math.random() * vectors.length)])

  while (centroides.length < k) {
    const dists = vectors.map(v =>
      Math.min(...centroides.map(c => euclidean(v, c)))
    )
    const total = dists.reduce((a, b) => a + b, 0)
    let rand = Math.random() * total
    for (let i = 0; i < dists.length; i++) {
      rand -= dists[i]
      if (rand <= 0) { centroides.push(vectors[i]); break }
    }
  }

  let asignaciones = new Array(students.length).fill(0)
  let iteraciones  = 0
  let convergioEn  = 0

  for (let iter = 0; iter < maxIter; iter++) {
    iteraciones++
    const nuevasAsig = vectors.map(v => asignarCluster(v, centroides))

    // ¿Convergió?
    if (nuevasAsig.every((a, i) => a === asignaciones[i])) {
      convergioEn = iter + 1
      break
    }
    asignaciones = nuevasAsig

    // Actualizar centroides
    for (let ci = 0; ci < k; ci++) {
      const miembros = vectors.filter((_, i) => asignaciones[i] === ci)
      if (miembros.length > 0) centroides[ci] = centroideOf(miembros)
    }
  }

  // Calcular riesgo promedio por cluster para ordenar
  const clusterData = Array.from({ length: k }, (_, ci) => {
    const miembros = students.filter((_, i) => asignaciones[i] === ci)
    const vecs     = vectors.filter((_, i) => asignaciones[i] === ci)
    const centroide = centroideOf(vecs)
    const riesgoPromedio = centroide.reduce((a, b) => a + b, 0) / centroide.length

    return {
      ci,
      miembros,
      centroide,
      riesgoPromedio,
    }
  })

  // Ordenar clusters por riesgo descendente para asignar perfiles coherentes
  clusterData.sort((a, b) => b.riesgoPromedio - a.riesgoPromedio)

  const clusters: Cluster[] = clusterData.map((cd, rankIdx) => {
    const profile = CLUSTER_PROFILES[Math.min(rankIdx, CLUSTER_PROFILES.length - 1)]
    const c = cd.centroide

    // Desnormalizar centroide para mostrarlo
    const promedioReal    = ranges.promedio.min    + (1 - c[0]) * (ranges.promedio.max    - ranges.promedio.min)
    const asistenciaReal  = ranges.asistencia.min  + (1 - c[1]) * (ranges.asistencia.max  - ranges.asistencia.min)
    const desaprobReal    = ranges.desaprobados.min + c[2]       * (ranges.desaprobados.max - ranges.desaprobados.min)

    return {
      id: rankIdx,
      nombre: profile.nombre,
      descripcion: profile.descripcion,
      color: profile.color,
      perfil: profile.perfil,
      centroide: {
        promedio:     parseFloat(promedioReal.toFixed(1)),
        asistencia:   parseFloat(asistenciaReal.toFixed(1)),
        desaprobados: parseFloat(desaprobReal.toFixed(1)),
      },
      miembros: cd.miembros,
      riesgoPromedio: parseFloat((cd.riesgoPromedio * 100).toFixed(1)),
    }
  })

  return { clusters, iteraciones, convergioEn: convergioEn || iteraciones }
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. REGRESIÓN LOGÍSTICA
// ─────────────────────────────────────────────────────────────────────────────

function sigmoid(z: number): number {
  return 1 / (1 + Math.exp(-z))
}

/**
 * Entrena regresión logística con descenso de gradiente.
 * Aprende los pesos óptimos para cada variable a partir de los propios datos.
 */
function trainLogisticRegression(
  X: number[][],   // features normalizadas
  y: number[],     // etiquetas 0/1
  lr   = 0.1,
  epochs = 500
): number[] {
  const n = X[0].length
  let weights = new Array(n + 1).fill(0)  // +1 para el bias

  for (let epoch = 0; epoch < epochs; epoch++) {
    const gradients = new Array(n + 1).fill(0)

    for (let i = 0; i < X.length; i++) {
      const z    = weights[0] + X[i].reduce((sum, xi, j) => sum + xi * weights[j + 1], 0)
      const pred = sigmoid(z)
      const err  = pred - y[i]

      gradients[0] += err  // bias gradient
      for (let j = 0; j < n; j++) {
        gradients[j + 1] += err * X[i][j]
      }
    }

    // Actualizar pesos
    for (let j = 0; j < weights.length; j++) {
      weights[j] -= (lr / X.length) * gradients[j]
    }
  }

  return weights
}

export function runLogisticRegression(students: StudentFeatures[]): LogRegResult[] {
  const ranges  = getMinMax(students)
  const vectors = students.map(s => toRiskVector(s, ranges) as number[])
  const labels  = generarEtiquetas(students).map(b => b ? 1 : 0)

  const weights = trainLogisticRegression(vectors, labels)

  const variableNames = ['Bajo Promedio', 'Ausentismo', 'Cursos Desaprobados']

  return students.map((student, i) => {
    const vec = vectors[i]
    const z   = weights[0] + vec.reduce((sum, xi, j) => sum + xi * weights[j + 1], 0)
    const prob = sigmoid(z)

    const contribuciones = variableNames.map((variable, j) => ({
      variable,
      valor: parseFloat(vec[j].toFixed(3)),
      peso: parseFloat(weights[j + 1].toFixed(3)),
      impacto: (weights[j + 1] > 0 ? 'positivo' : 'negativo') as 'positivo' | 'negativo',
    }))

    return {
      studentId: student.id,
      nombre: student.nombre,
      probabilidad: parseFloat(prob.toFixed(3)),
      nivel: prob >= 0.6 ? 'ALTO' : prob >= 0.35 ? 'MEDIO' : 'BAJO',
      contribuciones,
    }
  })
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. IMPORTANCIA DE VARIABLES
// ─────────────────────────────────────────────────────────────────────────────

export function calcularFeatureImportance(students: StudentFeatures[]): FeatureImportance[] {
  // Permutation importance: cuánto sube el error si mezclo esa variable
  const ranges  = getMinMax(students)
  const labels  = generarEtiquetas(students)

  function errorRate(preds: boolean[]): number {
    return preds.filter((p, i) => p !== labels[i]).length / preds.length
  }

  function predecirConVector(vecs: number[][]): boolean[] {
    return vecs.map(v => {
      const score = v[0] * 0.4 + v[1] * 0.3 + v[2] * 0.3
      return score > 0.5
    })
  }

  const vectors = students.map(s => [...toRiskVector(s, ranges)] as number[])
  const baseError = errorRate(predecirConVector(vectors))

  const variables = [
    { idx: 0, variable: 'Promedio (GPA)', descripcion: 'Qué tan determinante es la nota en predecir deserción' },
    { idx: 1, variable: 'Asistencia',     descripcion: 'Impacto del ausentismo en el riesgo de abandono' },
    { idx: 2, variable: 'Desaprobaciones',descripcion: 'Peso de los cursos jalados en la predicción' },
  ]

  const importancias = variables.map(({ idx, variable, descripcion }) => {
    // Permutar (mezclar) esa variable y medir cuánto empeora
    const shuffled = [...vectors.map(v => [...v])]
    const col = shuffled.map(v => v[idx]).sort(() => Math.random() - 0.5)
    shuffled.forEach((v, i) => { v[idx] = col[i] })

    const permError = errorRate(predecirConVector(shuffled))
    const importancia = Math.max(0, permError - baseError)

    return { variable, importancia, descripcion }
  })

  // Normalizar para que sumen 1
  const total = importancias.reduce((s, f) => s + f.importancia, 0) || 1
  return importancias
    .map(f => ({ ...f, importancia: parseFloat((f.importancia / total).toFixed(3)) }))
    .sort((a, b) => b.importancia - a.importancia)
}
