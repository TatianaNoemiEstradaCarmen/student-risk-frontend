'use client'

/**
 * Laboratorio Inteligente de Riesgo Académico
 * ============================================
 * Motor de IA local — sin APIs externas de pago.
 * Compatible con Next.js + Supabase + Recharts.
 *
 * Coloca en: components/admin/AIAnalisisDesercion.tsx
 * Importa en: app/dashboard/administrador/page.tsx
 *
 * Agrega al tab list del admin:
 *   { id: 'analisis_ia', label: '🧠 Lab IA' }
 * Y en el render:
 *   {tab === 'analisis_ia' && <AIAnalisisDesercion />}
 */

import { useState, useEffect, useRef, useCallback } from 'react'
import * as XLSX from 'xlsx'
import { supabase } from '@/src/lib/supabase'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts'
import {
  Brain, Upload, Play, Save, AlertTriangle, TrendingDown, Users,
  ChevronDown, ChevronUp, Loader2, CheckCircle, BarChart3, RefreshCw,
  FileSpreadsheet, Eye, Share2, Zap, Target, ShieldAlert, ShieldX,
  ShieldCheck, BookOpen, Activity, Clock, Star, Filter,
} from 'lucide-react'
import { Button } from '@/components/ui/button'

// ─────────────────────────────────────────────────────────────────────────────
// TIPOS
// ─────────────────────────────────────────────────────────────────────────────

interface RawStudent {
  codigo: string
  nombre: string
  carrera: string
  ciclo: string
  promedio: number | null
  asistencia: number | null
  desaprobados: number
}

interface AnalyzedStudent extends RawStudent {
  score: number          // 0–100, mayor = mayor riesgo
  nivel: 'ALTO' | 'MEDIO' | 'BAJO'
  factores: string[]
  recomendacion: string
}

interface Patron {
  titulo: string
  descripcion: string
  afectados: number
  porcentaje: number
  severidad: 'ALTA' | 'MEDIA' | 'BAJA'
  icono: string
}

interface Alerta {
  tipo: string
  mensaje: string
  prioridad: 'URGENTE' | 'ALTA' | 'MEDIA'
  afectados: number
}

interface Recomendacion {
  accion: string
  detalle: string
  prioridad: 'URGENTE' | 'ALTA' | 'MEDIA'
  dirigidaA: 'Tutores' | 'Administración' | 'Ambos'
}

interface AnalisisResult {
  estudiantes: AnalyzedStudent[]
  patrones: Patron[]
  alertas: Alerta[]
  recomendaciones: Recomendacion[]
  resumenEjecutivo: string
  nivelAlertaGlobal: 'ALTO' | 'MEDIO' | 'BAJO'
  porCarrera: { carrera: string; total: number; alto: number; medio: number; bajo: number; pctRiesgo: number }[]
  porCiclo: { ciclo: string; alto: number; medio: number; bajo: number }[]
  fechaAnalisis: string
  archivoNombre: string
}

interface HistorialItem {
  id: number
  fecha: string
  archivo_nombre: string
  total_estudiantes: number
  alto_riesgo: number
  medio_riesgo: number
  bajo_riesgo: number
  resumen: string
  nivel_alerta: string
}

// ─────────────────────────────────────────────────────────────────────────────
// MOTOR IA LOCAL
// ─────────────────────────────────────────────────────────────────────────────

function calcularScoreRiesgo(s: RawStudent): number {
  // Componente promedio (40%): 20→0 riesgo, 0→100 riesgo
  const promScore = s.promedio !== null
    ? Math.max(0, 100 - (s.promedio / 20) * 100)
    : 70 // sin datos = riesgo moderado

  // Componente asistencia (30%): 100%→0 riesgo, 0%→100 riesgo
  const asistScore = s.asistencia !== null
    ? Math.max(0, 100 - s.asistencia)
    : 60

  // Componente desaprobados (30%): 0→0, 4+→100
  const desapScore = Math.min(100, (s.desaprobados / 4) * 100)

  return Math.round(promScore * 0.40 + asistScore * 0.30 + desapScore * 0.30)
}

function clasificarNivel(score: number): 'ALTO' | 'MEDIO' | 'BAJO' {
  if (score >= 70) return 'ALTO'
  if (score >= 40) return 'MEDIO'
  return 'BAJO'
}

function detectarFactores(s: RawStudent): string[] {
  const f: string[] = []
  if (s.promedio !== null && s.promedio < 11) f.push('Promedio crítico (<11)')
  else if (s.promedio !== null && s.promedio < 14) f.push('Promedio bajo (<14)')
  if (s.asistencia !== null && s.asistencia < 70) f.push('Ausentismo severo (<70%)')
  else if (s.asistencia !== null && s.asistencia < 80) f.push('Asistencia baja (<80%)')
  if (s.desaprobados >= 3) f.push('Múltiples desaprobaciones (≥3)')
  else if (s.desaprobados >= 2) f.push('Cursos desaprobados (≥2)')
  if (s.promedio === null && s.asistencia === null) f.push('Sin datos académicos registrados')
  return f
}

function generarRecomendacion(nivel: 'ALTO' | 'MEDIO' | 'BAJO', factores: string[]): string {
  if (nivel === 'ALTO') {
    if (factores.some(f => f.includes('Ausentismo'))) return 'Intervención inmediata: contactar al estudiante y verificar situación personal.'
    if (factores.some(f => f.includes('desaprobaciones'))) return 'Plan de recuperación académica urgente con tutor asignado.'
    return 'Tutoría personalizada urgente y derivación a soporte psicológico si es necesario.'
  }
  if (nivel === 'MEDIO') {
    if (factores.some(f => f.includes('Asistencia'))) return 'Seguimiento de asistencia y alerta temprana al tutor.'
    return 'Monitoreo quincenal y sesión de orientación académica.'
  }
  return 'Mantener seguimiento estándar y reconocer el buen desempeño.'
}

function analizarEstudiantes(raw: RawStudent[]): AnalyzedStudent[] {
  return raw.map(s => {
    const score = calcularScoreRiesgo(s)
    const nivel = clasificarNivel(score)
    const factores = detectarFactores(s)
    return { ...s, score, nivel, factores, recomendacion: generarRecomendacion(nivel, factores) }
  })
}

function detectarPatrones(estudiantes: AnalyzedStudent[]): Patron[] {
  const total = estudiantes.length
  const patrones: Patron[] = []

  // Bajo rendimiento
  const bajoProm = estudiantes.filter(s => s.promedio !== null && s.promedio < 11)
  if (bajoProm.length > 0) patrones.push({
    titulo: 'Bajo Rendimiento Académico', icono: '📉',
    descripcion: `${bajoProm.length} estudiantes con promedio menor a 11. Riesgo directo de pérdida de ciclo.`,
    afectados: bajoProm.length, porcentaje: Math.round((bajoProm.length / total) * 100), severidad: 'ALTA',
  })

  // Ausentismo
  const ausentes = estudiantes.filter(s => s.asistencia !== null && s.asistencia < 70)
  if (ausentes.length > 0) patrones.push({
    titulo: 'Ausentismo Crónico', icono: '🚫',
    descripcion: `${ausentes.length} estudiantes con asistencia bajo el 70% mínimo requerido.`,
    afectados: ausentes.length, porcentaje: Math.round((ausentes.length / total) * 100), severidad: 'ALTA',
  })

  // Múltiples desaprobaciones
  const multiDesap = estudiantes.filter(s => s.desaprobados >= 2)
  if (multiDesap.length > 0) patrones.push({
    titulo: 'Patrón de Desaprobación Múltiple', icono: '❌',
    descripcion: `${multiDesap.length} estudiantes con 2 o más cursos desaprobados simultáneamente.`,
    afectados: multiDesap.length, porcentaje: Math.round((multiDesap.length / total) * 100), severidad: 'ALTA',
  })

  // Concentración por carrera
  const porCarrera: Record<string, number[]> = {}
  for (const s of estudiantes) {
    if (!porCarrera[s.carrera]) porCarrera[s.carrera] = []
    porCarrera[s.carrera].push(s.score)
  }
  for (const [carrera, scores] of Object.entries(porCarrera)) {
    const promScores = scores.reduce((a, b) => a + b, 0) / scores.length
    if (promScores >= 60 && scores.length >= 2) {
      patrones.push({
        titulo: `Concentración de Riesgo — ${carrera}`, icono: '🎓',
        descripcion: `La carrera de ${carrera} presenta un score promedio de riesgo de ${Math.round(promScores)}/100.`,
        afectados: scores.length, porcentaje: Math.round((scores.length / total) * 100), severidad: promScores >= 70 ? 'ALTA' : 'MEDIA',
      })
    }
  }

  // Sin datos
  const sinDatos = estudiantes.filter(s => s.promedio === null && s.asistencia === null)
  if (sinDatos.length > 0) patrones.push({
    titulo: 'Estudiantes sin Datos Académicos', icono: '⚠️',
    descripcion: `${sinDatos.length} estudiantes no cuentan con registros académicos completos.`,
    afectados: sinDatos.length, porcentaje: Math.round((sinDatos.length / total) * 100), severidad: 'MEDIA',
  })

  // Ciclos iniciales vulnerables
  const ciclosIniciales = estudiantes.filter(s => ['I', 'II', '1', '2', '1er', '2do'].includes(String(s.ciclo).trim()) && s.nivel !== 'BAJO')
  if (ciclosIniciales.length > 0) patrones.push({
    titulo: 'Vulnerabilidad en Primeros Ciclos', icono: '🎯',
    descripcion: `${ciclosIniciales.length} estudiantes de I y II ciclo ya presentan señales de riesgo temprano.`,
    afectados: ciclosIniciales.length, porcentaje: Math.round((ciclosIniciales.length / total) * 100), severidad: 'MEDIA',
  })

  return patrones
}

function generarAlertas(estudiantes: AnalyzedStudent[]): Alerta[] {
  const alertas: Alerta[] = []
  const altoRiesgo = estudiantes.filter(s => s.nivel === 'ALTO')
  const ausentes = estudiantes.filter(s => s.asistencia !== null && s.asistencia < 60)
  const criticos = estudiantes.filter(s => s.score >= 85)

  if (altoRiesgo.length > 0) alertas.push({
    tipo: 'Grupo Crítico de Intervención',
    mensaje: `${altoRiesgo.length} estudiantes requieren intervención inmediata antes del fin de ciclo.`,
    prioridad: 'URGENTE', afectados: altoRiesgo.length,
  })

  if (ausentes.length > 0) alertas.push({
    tipo: 'Posible Abandono Inminente',
    mensaje: `${ausentes.length} estudiantes con asistencia menor al 60% tienen alta probabilidad de desertar en los próximos ciclos.`,
    prioridad: 'URGENTE', afectados: ausentes.length,
  })

  if (criticos.length > 0) alertas.push({
    tipo: 'Estudiantes que Requieren Tutoría Inmediata',
    mensaje: `${criticos.length} estudiantes con score de riesgo superior a 85/100. Atención prioritaria.`,
    prioridad: 'ALTA', afectados: criticos.length,
  })

  const porCarrera: Record<string, AnalyzedStudent[]> = {}
  for (const s of estudiantes) {
    if (!porCarrera[s.carrera]) porCarrera[s.carrera] = []
    porCarrera[s.carrera].push(s)
  }
  for (const [carrera, arr] of Object.entries(porCarrera)) {
    const pctAlto = arr.filter(s => s.nivel === 'ALTO').length / arr.length
    if (pctAlto >= 0.4) alertas.push({
      tipo: 'Carrera con Incremento de Riesgo',
      mensaje: `${carrera}: el ${Math.round(pctAlto * 100)}% de sus estudiantes está en riesgo alto.`,
      prioridad: 'ALTA', afectados: arr.filter(s => s.nivel === 'ALTO').length,
    })
  }

  return alertas
}

function generarRecomendaciones(estudiantes: AnalyzedStudent[]): Recomendacion[] {
  const recs: Recomendacion[] = []
  const altos = estudiantes.filter(s => s.nivel === 'ALTO')
  const ausentes = estudiantes.filter(s => s.asistencia !== null && s.asistencia < 70)
  const multiDesap = estudiantes.filter(s => s.desaprobados >= 2)
  const sinDatos = estudiantes.filter(s => s.promedio === null)

  if (altos.length > 0) recs.push({
    accion: 'Tutoría Personalizada Urgente',
    detalle: `Asignar tutor dedicado a los ${altos.length} estudiantes en riesgo alto. Sesión inicial en los próximos 5 días hábiles.`,
    prioridad: 'URGENTE', dirigidaA: 'Tutores',
  })
  if (ausentes.length > 0) recs.push({
    accion: 'Protocolo de Contacto por Ausentismo',
    detalle: `Llamar directamente a los ${ausentes.length} estudiantes con baja asistencia. Verificar causas y activar soporte.`,
    prioridad: 'URGENTE', dirigidaA: 'Tutores',
  })
  if (multiDesap.length > 0) recs.push({
    accion: 'Plan de Recuperación Académica',
    detalle: `Diseñar plan de refuerzo para los ${multiDesap.length} estudiantes con múltiples cursos desaprobados.`,
    prioridad: 'ALTA', dirigidaA: 'Ambos',
  })
  if (sinDatos.length > 0) recs.push({
    accion: 'Completar Registro Académico',
    detalle: `Solicitar actualización de datos a los docentes. ${sinDatos.length} estudiantes sin información completa.`,
    prioridad: 'ALTA', dirigidaA: 'Administración',
  })
  recs.push({
    accion: 'Seguimiento Psicológico Preventivo',
    detalle: 'Evaluar derivación a bienestar estudiantil para los casos con riesgo alto combinado (nota + ausentismo).',
    prioridad: 'MEDIA', dirigidaA: 'Ambos',
  })
  recs.push({
    accion: 'Taller de Técnicas de Estudio',
    detalle: 'Organizar sesiones grupales para estudiantes de riesgo medio como prevención temprana.',
    prioridad: 'MEDIA', dirigidaA: 'Administración',
  })

  return recs
}

function construirResumen(estudiantes: AnalyzedStudent[]): { texto: string; nivel: 'ALTO' | 'MEDIO' | 'BAJO' } {
  const total = estudiantes.length
  const alto = estudiantes.filter(s => s.nivel === 'ALTO').length
  const medio = estudiantes.filter(s => s.nivel === 'MEDIO').length
  const bajo = total - alto - medio
  const pctAlto = Math.round((alto / total) * 100)
  const nivelGlobal: 'ALTO' | 'MEDIO' | 'BAJO' = pctAlto >= 30 ? 'ALTO' : pctAlto >= 15 ? 'MEDIO' : 'BAJO'

  const texto = `De los ${total} estudiantes analizados, el ${pctAlto}% presenta riesgo ALTO de deserción (${alto} estudiantes). ` +
    `El ${Math.round((medio / total) * 100)}% está en riesgo medio (${medio} estudiantes) y el ${Math.round((bajo / total) * 100)}% mantiene un nivel bajo (${bajo} estudiantes). ` +
    (pctAlto >= 30
      ? 'La situación es crítica y requiere activación inmediata del protocolo de intervención.'
      : pctAlto >= 15
        ? 'Se recomienda reforzar el acompañamiento tutoral y mantener monitoreo activo.'
        : 'El panorama general es favorable, se sugiere mantener el seguimiento preventivo.')

  return { texto, nivel: nivelGlobal }
}

function agruparPorCarrera(estudiantes: AnalyzedStudent[]) {
  const map: Record<string, { alto: number; medio: number; bajo: number }> = {}
  for (const s of estudiantes) {
    if (!map[s.carrera]) map[s.carrera] = { alto: 0, medio: 0, bajo: 0 }
    if (s.nivel === 'ALTO') map[s.carrera].alto++
    else if (s.nivel === 'MEDIO') map[s.carrera].medio++
    else map[s.carrera].bajo++
  }
  return Object.entries(map).map(([carrera, d]) => {
    const total = d.alto + d.medio + d.bajo
    return { carrera, total, ...d, pctRiesgo: Math.round(((d.alto + d.medio) / total) * 100) }
  }).sort((a, b) => b.pctRiesgo - a.pctRiesgo)
}

function agruparPorCiclo(estudiantes: AnalyzedStudent[]) {
  const map: Record<string, { alto: number; medio: number; bajo: number }> = {}
  for (const s of estudiantes) {
    const ciclo = String(s.ciclo || 'N/A')
    if (!map[ciclo]) map[ciclo] = { alto: 0, medio: 0, bajo: 0 }
    if (s.nivel === 'ALTO') map[ciclo].alto++
    else if (s.nivel === 'MEDIO') map[ciclo].medio++
    else map[ciclo].bajo++
  }
  return Object.entries(map).map(([ciclo, d]) => ({ ciclo, ...d }))
}

function ejecutarAnalisisCompleto(raw: RawStudent[], archivoNombre: string): AnalisisResult {
  const estudiantes = analizarEstudiantes(raw)
  const { texto, nivel } = construirResumen(estudiantes)
  return {
    estudiantes,
    patrones: detectarPatrones(estudiantes),
    alertas: generarAlertas(estudiantes),
    recomendaciones: generarRecomendaciones(estudiantes),
    resumenEjecutivo: texto,
    nivelAlertaGlobal: nivel,
    porCarrera: agruparPorCarrera(estudiantes),
    porCiclo: agruparPorCiclo(estudiantes),
    fechaAnalisis: new Date().toISOString(),
    archivoNombre,
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// PARSEAR EXCEL
// ─────────────────────────────────────────────────────────────────────────────

function normalizarCampo(row: any, posibles: string[]): any {
  for (const key of posibles) {
    const found = Object.keys(row).find(k => k.toLowerCase().replace(/[^a-záéíóúñ]/gi, '').includes(key))
    if (found && row[found] !== undefined && row[found] !== '') return row[found]
  }
  return null
}

function parsearExcel(workbook: XLSX.WorkBook): RawStudent[] {
  const sheet = workbook.Sheets[workbook.SheetNames[0]]
  const json: any[] = XLSX.utils.sheet_to_json(sheet, { defval: null })

  return json.map((row: any) => {
    const parseNum = (v: any) => {
      const n = parseFloat(String(v ?? '').replace(',', '.'))
      return isNaN(n) ? null : n
    }
    return {
      codigo:      String(normalizarCampo(row, ['codigo', 'code', 'id']) ?? '').trim(),
      nombre:      String(normalizarCampo(row, ['nombre', 'name', 'alumno', 'estudiante']) ?? 'Sin nombre').trim(),
      carrera:     String(normalizarCampo(row, ['carrera', 'programa', 'facultad', 'career']) ?? 'Sin carrera').trim(),
      ciclo:       String(normalizarCampo(row, ['ciclo', 'semestre', 'nivel', 'cycle', 'semester']) ?? 'N/A').trim(),
      promedio:    parseNum(normalizarCampo(row, ['promedio', 'nota', 'gpa', 'average', 'calificacion'])),
      asistencia:  parseNum(normalizarCampo(row, ['asistencia', 'attendance', 'asist'])),
      desaprobados: Math.max(0, parseNum(normalizarCampo(row, ['desaprobado', 'jalado', 'reprobado', 'failed', 'cursodesaprobado'])) ?? 0),
    }
  }).filter(s => s.nombre && s.nombre !== 'Sin nombre' || s.codigo)
}

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS UI
// ─────────────────────────────────────────────────────────────────────────────

const COLORES_RIESGO = { ALTO: '#ef4444', MEDIO: '#f59e0b', BAJO: '#22c55e' }
const COLORES_PIE = ['#ef4444', '#f59e0b', '#22c55e']

function BadgeNivel({ nivel }: { nivel: 'ALTO' | 'MEDIO' | 'BAJO' }) {
  const cfg = {
    ALTO:  { cls: 'border-red-500/30 bg-red-500/15 text-red-400',    icon: <ShieldX className="h-3 w-3" />,    label: 'Alto' },
    MEDIO: { cls: 'border-yellow-500/30 bg-yellow-500/15 text-yellow-400', icon: <ShieldAlert className="h-3 w-3" />, label: 'Medio' },
    BAJO:  { cls: 'border-green-500/30 bg-green-500/15 text-green-400',  icon: <ShieldCheck className="h-3 w-3" />, label: 'Bajo' },
  }[nivel]
  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-bold ${cfg.cls}`}>
      {cfg.icon} {cfg.label}
    </span>
  )
}

function BadgePrioridad({ p }: { p: 'URGENTE' | 'ALTA' | 'MEDIA' }) {
  const cfg = {
    URGENTE: 'border-red-500/30 bg-red-500/15 text-red-400',
    ALTA:    'border-orange-500/30 bg-orange-500/15 text-orange-400',
    MEDIA:   'border-yellow-500/30 bg-yellow-500/15 text-yellow-400',
  }[p]
  return <span className={`rounded-full border px-2.5 py-0.5 text-xs font-bold ${cfg}`}>{p}</span>
}

function ScoreBar({ score, nivel }: { score: number; nivel: 'ALTO' | 'MEDIO' | 'BAJO' }) {
  const color = nivel === 'ALTO' ? 'bg-red-500' : nivel === 'MEDIO' ? 'bg-yellow-500' : 'bg-green-500'
  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 w-20 rounded-full bg-white/10 overflow-hidden">
        <div className={`h-full rounded-full transition-all ${color}`} style={{ width: `${score}%` }} />
      </div>
      <span className="text-xs font-mono text-foreground/60">{score}</span>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENTE PRINCIPAL
// ─────────────────────────────────────────────────────────────────────────────

type ActiveView = 'upload' | 'preview' | 'resultado' | 'historial'

export default function AIAnalisisDesercion() {
  const [view, setView]                   = useState<ActiveView>('upload')
  const [dragging, setDragging]           = useState(false)
  const [archivoNombre, setArchivoNombre] = useState('')
  const [rawData, setRawData]             = useState<RawStudent[]>([])
  const [analyzing, setAnalyzing]         = useState(false)
  const [resultado, setResultado]         = useState<AnalisisResult | null>(null)
  const [saving, setSaving]               = useState(false)
  const [saved, setSaved]                 = useState(false)
  const [historial, setHistorial]         = useState<HistorialItem[]>([])
  const [expandedHist, setExpandedHist]   = useState<number | null>(null)
  const [error, setError]                 = useState('')
  const [filtroNivel, setFiltroNivel]     = useState<'TODOS' | 'ALTO' | 'MEDIO' | 'BAJO'>('TODOS')
  const [activeResultTab, setActiveResultTab] = useState<'resumen' | 'estudiantes' | 'graficos' | 'recomendaciones'>('resumen')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => { fetchHistorial() }, [])

  async function fetchHistorial() {
    const { data } = await supabase
      .from('analisis_ia')
      .select('id, fecha, archivo_nombre, total_estudiantes, alto_riesgo, medio_riesgo, bajo_riesgo, resumen, nivel_alerta')
      .order('fecha', { ascending: false })
      .limit(15)
    setHistorial(data || [])
  }

  // ── Drag & Drop ───────────────────────────────────────────────────────────
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) processFile(file)
  }, [])

  function processFile(file: File) {
    setError('')
    if (!file.name.match(/\.(xlsx|xls|csv)$/i)) {
      setError('Solo se aceptan archivos Excel (.xlsx, .xls) o CSV.')
      return
    }
    setArchivoNombre(file.name)
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target!.result as ArrayBuffer)
        const workbook = XLSX.read(data, { type: 'array' })
        const parsed = parsearExcel(workbook)
        if (parsed.length === 0) {
          setError('No se encontraron datos válidos. Verifica que el archivo tenga columnas: nombre, carrera, ciclo, promedio, asistencia, desaprobados.')
          return
        }
        setRawData(parsed)
        setView('preview')
      } catch {
        setError('No se pudo leer el archivo. Asegúrate de que sea un Excel válido.')
      }
    }
    reader.readAsArrayBuffer(file)
  }

  // ── Análisis ──────────────────────────────────────────────────────────────
  async function runAnalysis() {
    setAnalyzing(true)
    setError('')
    // Simular tiempo de procesamiento para UX
    await new Promise(r => setTimeout(r, 1200))
    const result = ejecutarAnalisisCompleto(rawData, archivoNombre)
    setResultado(result)
    setSaved(false)
    setView('resultado')
    setActiveResultTab('resumen')
    setAnalyzing(false)
  }

  // ── Guardar en Supabase ───────────────────────────────────────────────────
  async function saveAnalysis() {
    if (!resultado) return
    setSaving(true)
    const alto  = resultado.estudiantes.filter(s => s.nivel === 'ALTO').length
    const medio = resultado.estudiantes.filter(s => s.nivel === 'MEDIO').length
    const bajo  = resultado.estudiantes.filter(s => s.nivel === 'BAJO').length

    const { error: dbError } = await supabase.from('analisis_ia').insert({
      fecha:              resultado.fechaAnalisis,
      archivo_nombre:     resultado.archivoNombre,
      resumen:            resultado.resumenEjecutivo,
      patrones:           JSON.stringify(resultado.patrones),
      recomendaciones:    JSON.stringify(resultado.recomendaciones),
      alertas:            JSON.stringify(resultado.alertas),
      estudiantes_criticos: JSON.stringify(
        resultado.estudiantes.filter(s => s.nivel === 'ALTO').slice(0, 20)
      ),
      nivel_alerta:       resultado.nivelAlertaGlobal,
      total_estudiantes:  resultado.estudiantes.length,
      alto_riesgo:        alto,
      medio_riesgo:       medio,
      bajo_riesgo:        bajo,
      mensaje_tutor: `Análisis del ${new Date(resultado.fechaAnalisis).toLocaleDateString('es-PE')}: ` +
        `${alto} estudiantes en riesgo alto de ${resultado.estudiantes.length} analizados. ` +
        resultado.resumenEjecutivo,
    })

    if (dbError) {
      setError('Error al guardar: ' + dbError.message)
    } else {
      setSaved(true)
      fetchHistorial()
    }
    setSaving(false)
  }

  // ── Estudiantes filtrados ─────────────────────────────────────────────────
  const estudiantesFiltrados = resultado
    ? resultado.estudiantes
        .filter(s => filtroNivel === 'TODOS' || s.nivel === filtroNivel)
        .sort((a, b) => b.score - a.score)
    : []

  // ── Datos para gráficos ───────────────────────────────────────────────────
  const pieData = resultado ? [
    { name: 'Alto', value: resultado.estudiantes.filter(s => s.nivel === 'ALTO').length },
    { name: 'Medio', value: resultado.estudiantes.filter(s => s.nivel === 'MEDIO').length },
    { name: 'Bajo', value: resultado.estudiantes.filter(s => s.nivel === 'BAJO').length },
  ] : []

  // ─────────────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">

      {/* ── HEADER ── */}
      <div className="rounded-2xl border border-primary/20 bg-gradient-to-r from-primary/10 via-card/40 to-secondary/10 p-6 backdrop-blur-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-secondary shadow-lg">
              <Brain className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground">Laboratorio Inteligente de Riesgo Académico</h2>
              <p className="text-sm text-foreground/60">Motor IA local · Análisis sin conexión externa · Compatible con Excel</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {(['upload', 'historial'] as const).map(v => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                  view === v ? 'bg-primary text-white shadow' : 'bg-primary/10 text-foreground/60 hover:bg-primary/20'
                }`}
              >
                {v === 'upload' ? '📂 Nuevo Análisis' : '🕐 Historial'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── ERROR ── */}
      {error && (
        <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-4 flex items-center gap-3">
          <AlertTriangle className="h-5 w-5 text-red-400 shrink-0" />
          <p className="text-sm text-red-400">{error}</p>
          <button onClick={() => setError('')} className="ml-auto text-red-400/60 hover:text-red-400 text-xs">✕</button>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          VISTA: UPLOAD
      ══════════════════════════════════════════════════════════════════════ */}
      {view === 'upload' && (
        <div className="space-y-6">
          {/* Drag & Drop */}
          <div
            onDragOver={e => { e.preventDefault(); setDragging(true) }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            onClick={() => inputRef.current?.click()}
            className={`relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-16 text-center cursor-pointer transition-all duration-300 ${
              dragging
                ? 'border-primary bg-primary/10 scale-[1.01]'
                : 'border-primary/30 bg-card/20 hover:border-primary/60 hover:bg-primary/5'
            }`}
          >
            <input
              ref={inputRef}
              type="file"
              accept=".xlsx,.xls,.csv"
              className="hidden"
              onChange={e => { const f = e.target.files?.[0]; if (f) processFile(f) }}
            />
            <div className={`mb-4 flex h-20 w-20 items-center justify-center rounded-2xl transition-all ${
              dragging ? 'bg-primary/20' : 'bg-primary/10'
            }`}>
              <FileSpreadsheet className={`h-10 w-10 transition-all ${dragging ? 'text-primary scale-110' : 'text-primary/60'}`} />
            </div>
            <h3 className="text-lg font-bold text-foreground mb-2">
              {dragging ? 'Suelta el archivo aquí' : 'Arrastra tu archivo Excel aquí'}
            </h3>
            <p className="text-sm text-foreground/50 mb-4">O haz clic para seleccionarlo · .xlsx · .xls · .csv</p>
            <div className="rounded-lg border border-primary/20 bg-primary/5 px-4 py-2">
              <p className="text-xs text-foreground/40">
                Columnas esperadas: <span className="font-mono text-primary/70">nombre · carrera · ciclo · promedio · asistencia · desaprobados</span>
              </p>
            </div>
          </div>

          {/* Instrucciones */}
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              { icon: <Upload className="h-5 w-5 text-primary" />, titulo: '1. Sube el Excel', desc: 'Arrastra o selecciona el archivo con los datos del semestre.' },
              { icon: <Brain className="h-5 w-5 text-secondary" />, titulo: '2. Motor IA analiza', desc: 'El sistema detecta patrones, clasifica riesgo y genera alertas automáticamente.' },
              { icon: <Share2 className="h-5 w-5 text-green-400" />, titulo: '3. Comparte con tutores', desc: 'Guarda el análisis en Supabase para que los tutores accedan al resumen.' },
            ].map(item => (
              <div key={item.titulo} className="rounded-xl border border-primary/10 bg-card/30 p-5">
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">{item.icon}</div>
                <p className="font-semibold text-foreground text-sm mb-1">{item.titulo}</p>
                <p className="text-xs text-foreground/50 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          VISTA: PREVIEW
      ══════════════════════════════════════════════════════════════════════ */}
      {view === 'preview' && (
        <div className="space-y-4">
          <div className="rounded-2xl border border-primary/20 bg-card/40 p-6 backdrop-blur-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-500/15">
                  <CheckCircle className="h-5 w-5 text-green-400" />
                </div>
                <div>
                  <p className="font-bold text-foreground">{archivoNombre}</p>
                  <p className="text-xs text-foreground/50">{rawData.length} estudiantes detectados · Listo para analizar</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => { setView('upload'); setRawData([]) }} className="border-primary/20 text-xs">
                  Cambiar archivo
                </Button>
                <Button
                  onClick={runAnalysis}
                  disabled={analyzing}
                  className="bg-gradient-to-r from-primary to-secondary text-white gap-2 text-sm"
                >
                  {analyzing
                    ? <><Loader2 className="h-4 w-4 animate-spin" /> Analizando con IA...</>
                    : <><Zap className="h-4 w-4" /> Ejecutar Análisis IA</>
                  }
                </Button>
              </div>
            </div>

            {/* Estadísticas preview */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
              {[
                { label: 'Estudiantes', value: rawData.length, color: 'text-primary' },
                { label: 'Con Promedio', value: rawData.filter(s => s.promedio !== null).length, color: 'text-blue-400' },
                { label: 'Con Asistencia', value: rawData.filter(s => s.asistencia !== null).length, color: 'text-purple-400' },
                { label: 'Carreras', value: [...new Set(rawData.map(s => s.carrera).filter(Boolean))].length, color: 'text-green-400' },
              ].map(kpi => (
                <div key={kpi.label} className="rounded-xl border border-primary/10 bg-background/30 p-4 text-center">
                  <p className={`text-2xl font-bold ${kpi.color}`}>{kpi.value}</p>
                  <p className="text-xs text-foreground/50 mt-0.5">{kpi.label}</p>
                </div>
              ))}
            </div>

            {/* Tabla preview */}
            <div className="overflow-x-auto rounded-xl border border-primary/10">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-primary/20 bg-primary/5">
                    {['Código', 'Nombre', 'Carrera', 'Ciclo', 'Promedio', 'Asistencia', 'Desaprobados'].map(h => (
                      <th key={h} className="px-3 py-3 text-left text-xs font-semibold text-foreground/60">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rawData.slice(0, 10).map((s, i) => (
                    <tr key={i} className="border-b border-primary/5 hover:bg-primary/5 transition-colors">
                      <td className="px-3 py-2.5 text-xs font-mono text-foreground/60">{s.codigo || '—'}</td>
                      <td className="px-3 py-2.5 font-medium text-foreground">{s.nombre}</td>
                      <td className="px-3 py-2.5 text-xs text-foreground/70">{s.carrera}</td>
                      <td className="px-3 py-2.5 text-xs text-center text-foreground/60">{s.ciclo}</td>
                      <td className="px-3 py-2.5 text-xs text-center">
                        <span className={s.promedio !== null && s.promedio < 11 ? 'text-red-400 font-bold' : 'text-foreground/70'}>
                          {s.promedio ?? '—'}
                        </span>
                      </td>
                      <td className="px-3 py-2.5 text-xs text-center">
                        <span className={s.asistencia !== null && s.asistencia < 70 ? 'text-red-400 font-bold' : 'text-foreground/70'}>
                          {s.asistencia !== null ? `${s.asistencia}%` : '—'}
                        </span>
                      </td>
                      <td className="px-3 py-2.5 text-xs text-center">
                        <span className={s.desaprobados >= 2 ? 'text-red-400 font-bold' : 'text-foreground/70'}>
                          {s.desaprobados}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {rawData.length > 10 && (
                <div className="px-4 py-3 border-t border-primary/10 bg-primary/5">
                  <p className="text-xs text-foreground/40 text-center">Mostrando 10 de {rawData.length} · El análisis procesará todos</p>
                </div>
              )}
            </div>
          </div>

          {/* Animación de análisis */}
          {analyzing && (
            <div className="rounded-2xl border border-primary/20 bg-card/40 p-8 backdrop-blur-xl text-center">
              <div className="flex justify-center mb-4">
                <div className="relative h-16 w-16">
                  <div className="absolute inset-0 rounded-full border-4 border-primary/20"></div>
                  <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-primary animate-spin"></div>
                  <Brain className="absolute inset-0 m-auto h-7 w-7 text-primary" />
                </div>
              </div>
              <p className="text-base font-bold text-foreground mb-1">Motor IA procesando datos...</p>
              <p className="text-sm text-foreground/50">Detectando patrones · Clasificando riesgo · Generando recomendaciones</p>
              <div className="mt-4 flex justify-center gap-1">
                {[0,1,2,3,4].map(i => (
                  <div key={i} className="h-1.5 w-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: `${i * 0.1}s` }} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          VISTA: RESULTADO
      ══════════════════════════════════════════════════════════════════════ */}
      {view === 'resultado' && resultado && (
        <div className="space-y-4">
          {/* Barra de acción */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 rounded-xl border border-primary/20 bg-card/40 px-5 py-3">
            <div className="flex items-center gap-2 text-sm text-foreground/60">
              <FileSpreadsheet className="h-4 w-4" />
              <span className="font-medium text-foreground">{resultado.archivoNombre}</span>
              <span>·</span>
              <span>{resultado.estudiantes.length} estudiantes</span>
              <span>·</span>
              <span>{new Date(resultado.fechaAnalisis).toLocaleDateString('es-PE')}</span>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setView('upload')} className="border-primary/20 text-xs gap-1">
                <Upload className="h-3 w-3" /> Nuevo
              </Button>
              <Button
                onClick={saveAnalysis}
                disabled={saving || saved}
                size="sm"
                className={`gap-2 text-xs ${saved ? 'bg-green-600 hover:bg-green-700' : 'bg-gradient-to-r from-primary to-secondary'} text-white`}
              >
                {saving ? <Loader2 className="h-3 w-3 animate-spin" /> :
                 saved  ? <CheckCircle className="h-3 w-3" /> :
                          <Share2 className="h-3 w-3" />}
                {saved ? 'Compartido con tutores' : 'Compartir con tutores'}
              </Button>
            </div>
          </div>

          {/* KPIs principales */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: 'Total Analizados', value: resultado.estudiantes.length, color: 'text-primary', bg: 'border-primary/20 bg-primary/5', icon: <Users className="h-4 w-4" /> },
              { label: 'Riesgo Alto', value: resultado.estudiantes.filter(s => s.nivel === 'ALTO').length, color: 'text-red-400', bg: 'border-red-500/20 bg-red-500/10', icon: <ShieldX className="h-4 w-4" /> },
              { label: 'Riesgo Medio', value: resultado.estudiantes.filter(s => s.nivel === 'MEDIO').length, color: 'text-yellow-400', bg: 'border-yellow-500/20 bg-yellow-500/10', icon: <ShieldAlert className="h-4 w-4" /> },
              { label: 'Riesgo Bajo', value: resultado.estudiantes.filter(s => s.nivel === 'BAJO').length, color: 'text-green-400', bg: 'border-green-500/20 bg-green-500/10', icon: <ShieldCheck className="h-4 w-4" /> },
            ].map(kpi => (
              <div key={kpi.label} className={`rounded-xl border p-4 ${kpi.bg}`}>
                <div className={`flex items-center gap-2 mb-2 ${kpi.color}`}>{kpi.icon}<span className="text-xs font-medium">{kpi.label}</span></div>
                <p className={`text-3xl font-bold ${kpi.color}`}>{kpi.value}</p>
              </div>
            ))}
          </div>

          {/* Tabs de resultado */}
          <div className="flex gap-1 rounded-xl border border-primary/10 bg-card/20 p-1">
            {([
              { id: 'resumen', label: '📊 Resumen' },
              { id: 'estudiantes', label: '👥 Estudiantes' },
              { id: 'graficos', label: '📈 Gráficos' },
              { id: 'recomendaciones', label: '💡 Recomendaciones' },
            ] as const).map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveResultTab(tab.id)}
                className={`flex-1 rounded-lg py-2 text-xs font-medium transition-all ${
                  activeResultTab === tab.id
                    ? 'bg-primary text-white shadow'
                    : 'text-foreground/60 hover:text-foreground hover:bg-primary/10'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* ── Tab: Resumen ── */}
          {activeResultTab === 'resumen' && (
            <div className="space-y-4">
              {/* Resumen ejecutivo */}
              <div className={`rounded-2xl border p-6 backdrop-blur-xl ${
                resultado.nivelAlertaGlobal === 'ALTO' ? 'border-red-500/20 bg-red-500/5' :
                resultado.nivelAlertaGlobal === 'MEDIO' ? 'border-yellow-500/20 bg-yellow-500/5' :
                'border-green-500/20 bg-green-500/5'
              }`}>
                <div className="flex items-center gap-3 mb-3">
                  <h3 className="text-lg font-bold text-foreground">Resumen Ejecutivo</h3>
                  <BadgeNivel nivel={resultado.nivelAlertaGlobal} />
                </div>
                <p className="text-sm text-foreground/80 leading-relaxed">{resultado.resumenEjecutivo}</p>
              </div>

              {/* Alertas predictivas */}
              {resultado.alertas.length > 0 && (
                <div className="rounded-2xl border border-primary/20 bg-card/40 p-6 backdrop-blur-xl">
                  <h3 className="text-base font-bold text-foreground mb-4 flex items-center gap-2">
                    <Zap className="h-4 w-4 text-yellow-400" /> Alertas Predictivas
                  </h3>
                  <div className="space-y-3">
                    {resultado.alertas.map((a, i) => (
                      <div key={i} className={`flex items-start gap-3 rounded-xl border p-4 ${
                        a.prioridad === 'URGENTE' ? 'border-red-500/20 bg-red-500/10' :
                        a.prioridad === 'ALTA'    ? 'border-orange-500/20 bg-orange-500/10' :
                        'border-yellow-500/20 bg-yellow-500/10'
                      }`}>
                        <AlertTriangle className={`h-4 w-4 mt-0.5 shrink-0 ${
                          a.prioridad === 'URGENTE' ? 'text-red-400' :
                          a.prioridad === 'ALTA' ? 'text-orange-400' : 'text-yellow-400'
                        }`} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <p className="font-semibold text-foreground text-sm">{a.tipo}</p>
                            <BadgePrioridad p={a.prioridad} />
                          </div>
                          <p className="text-xs text-foreground/70">{a.mensaje}</p>
                        </div>
                        <span className="text-xs text-foreground/40 shrink-0">{a.afectados} est.</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Patrones detectados */}
              <div className="rounded-2xl border border-primary/20 bg-card/40 p-6 backdrop-blur-xl">
                <h3 className="text-base font-bold text-foreground mb-4 flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-primary" /> Patrones Detectados por IA
                </h3>
                <div className="grid gap-3 sm:grid-cols-2">
                  {resultado.patrones.map((p, i) => (
                    <div key={i} className="rounded-xl border border-primary/10 bg-background/30 p-4">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{p.icono}</span>
                          <p className="font-semibold text-foreground text-sm leading-tight">{p.titulo}</p>
                        </div>
                        <BadgeNivel nivel={p.severidad === 'ALTA' ? 'ALTO' : p.severidad === 'MEDIA' ? 'MEDIO' : 'BAJO'} />
                      </div>
                      <p className="text-xs text-foreground/60 leading-relaxed">{p.descripcion}</p>
                      <div className="mt-3 flex items-center justify-between">
                        <div className="h-1.5 flex-1 rounded-full bg-white/10 overflow-hidden mr-3">
                          <div
                            className={`h-full rounded-full ${p.severidad === 'ALTA' ? 'bg-red-500' : p.severidad === 'MEDIA' ? 'bg-yellow-500' : 'bg-green-500'}`}
                            style={{ width: `${Math.min(p.porcentaje, 100)}%` }}
                          />
                        </div>
                        <span className="text-xs font-bold text-foreground/60 shrink-0">{p.porcentaje}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Ranking carreras vulnerables */}
              <div className="rounded-2xl border border-primary/20 bg-card/40 p-6 backdrop-blur-xl">
                <h3 className="text-base font-bold text-foreground mb-4 flex items-center gap-2">
                  <TrendingDown className="h-4 w-4 text-yellow-400" /> Carreras por Nivel de Riesgo
                </h3>
                <div className="space-y-2">
                  {resultado.porCarrera.slice(0, 6).map((c, i) => (
                    <div key={i} className="flex items-center gap-3 rounded-lg border border-primary/5 bg-background/20 px-4 py-2.5">
                      <span className="text-xs font-bold text-foreground/30 w-5 shrink-0">#{i + 1}</span>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-foreground text-sm truncate">{c.carrera}</p>
                        <p className="text-xs text-foreground/40">{c.total} estudiantes</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-24 rounded-full bg-white/10 overflow-hidden">
                          <div
                            className={`h-full rounded-full ${c.pctRiesgo >= 50 ? 'bg-red-500' : c.pctRiesgo >= 30 ? 'bg-yellow-500' : 'bg-green-500'}`}
                            style={{ width: `${c.pctRiesgo}%` }}
                          />
                        </div>
                        <span className={`text-xs font-bold w-10 text-right ${c.pctRiesgo >= 50 ? 'text-red-400' : c.pctRiesgo >= 30 ? 'text-yellow-400' : 'text-green-400'}`}>
                          {c.pctRiesgo}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── Tab: Estudiantes ── */}
          {activeResultTab === 'estudiantes' && (
            <div className="rounded-2xl border border-primary/20 bg-card/40 p-6 backdrop-blur-xl">
              <div className="mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                  <Users className="h-4 w-4 text-primary" /> Ranking de Riesgo Individual
                </h3>
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-foreground/40" />
                  {(['TODOS', 'ALTO', 'MEDIO', 'BAJO'] as const).map(n => (
                    <button
                      key={n}
                      onClick={() => setFiltroNivel(n)}
                      className={`rounded-lg px-3 py-1 text-xs font-medium transition-all ${
                        filtroNivel === n
                          ? n === 'ALTO'  ? 'bg-red-500 text-white' :
                            n === 'MEDIO' ? 'bg-yellow-500 text-white' :
                            n === 'BAJO'  ? 'bg-green-500 text-white' :
                            'bg-primary text-white'
                          : 'bg-primary/10 text-foreground/60 hover:bg-primary/20'
                      }`}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>

              <div className="overflow-x-auto rounded-xl border border-primary/10">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-primary/20 bg-primary/5">
                      {['Rk', 'Estudiante', 'Carrera', 'Ciclo', 'Promedio', 'Asistencia', 'Desap.', 'Score IA', 'Nivel', 'Recomendación'].map(h => (
                        <th key={h} className="px-3 py-3 text-left text-xs font-semibold text-foreground/60 whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {estudiantesFiltrados.slice(0, 50).map((s, i) => (
                      <tr key={i} className="border-b border-primary/5 hover:bg-primary/5 transition-colors">
                        <td className="px-3 py-2.5 text-xs text-foreground/30 font-mono">{i + 1}</td>
                        <td className="px-3 py-2.5">
                          <p className="font-medium text-foreground text-sm leading-tight">{s.nombre}</p>
                          {s.codigo && <p className="text-[10px] text-foreground/40 font-mono">{s.codigo}</p>}
                        </td>
                        <td className="px-3 py-2.5 text-xs text-foreground/70 max-w-[120px] truncate">{s.carrera}</td>
                        <td className="px-3 py-2.5 text-xs text-center text-foreground/60">{s.ciclo}</td>
                        <td className="px-3 py-2.5 text-xs text-center">
                          <span className={s.promedio !== null && s.promedio < 11 ? 'text-red-400 font-bold' : 'text-foreground/70'}>
                            {s.promedio ?? '—'}
                          </span>
                        </td>
                        <td className="px-3 py-2.5 text-xs text-center">
                          <span className={s.asistencia !== null && s.asistencia < 70 ? 'text-red-400 font-bold' : 'text-foreground/70'}>
                            {s.asistencia !== null ? `${s.asistencia}%` : '—'}
                          </span>
                        </td>
                        <td className="px-3 py-2.5 text-xs text-center">
                          <span className={s.desaprobados >= 2 ? 'text-red-400 font-bold' : 'text-foreground/70'}>{s.desaprobados}</span>
                        </td>
                        <td className="px-3 py-2.5"><ScoreBar score={s.score} nivel={s.nivel} /></td>
                        <td className="px-3 py-2.5"><BadgeNivel nivel={s.nivel} /></td>
                        <td className="px-3 py-2.5 text-xs text-foreground/60 max-w-[180px]">{s.recomendacion}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {estudiantesFiltrados.length > 50 && (
                  <div className="px-4 py-3 border-t border-primary/10 bg-primary/5 text-center">
                    <p className="text-xs text-foreground/40">Mostrando 50 de {estudiantesFiltrados.length} · Exporta para ver todos</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── Tab: Gráficos ── */}
          {activeResultTab === 'graficos' && (
            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                {/* Pie chart distribución */}
                <div className="rounded-2xl border border-primary/20 bg-card/40 p-6 backdrop-blur-xl">
                  <h3 className="text-sm font-bold text-foreground mb-4">Distribución Global de Riesgo</h3>
                  <ResponsiveContainer width="100%" height={220}>
                    <PieChart>
                      <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={90} paddingAngle={4} dataKey="value">
                        {pieData.map((_, idx) => (
                          <Cell key={idx} fill={COLORES_PIE[idx]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(v: any) => [`${v} estudiantes`]} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                {/* Top 5 estudiantes críticos */}
                <div className="rounded-2xl border border-primary/20 bg-card/40 p-6 backdrop-blur-xl">
                  <h3 className="text-sm font-bold text-foreground mb-4 flex items-center gap-2">
                    <Target className="h-4 w-4 text-red-400" /> Top 5 Estudiantes Críticos
                  </h3>
                  <div className="space-y-2.5">
                    {resultado.estudiantes
                      .filter(s => s.nivel === 'ALTO')
                      .sort((a, b) => b.score - a.score)
                      .slice(0, 5)
                      .map((s, i) => (
                        <div key={i} className="flex items-center gap-3">
                          <span className="text-xs font-bold text-red-400 w-4 shrink-0">#{i + 1}</span>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-foreground truncate">{s.nombre}</p>
                            <p className="text-[10px] text-foreground/40 truncate">{s.carrera}</p>
                          </div>
                          <ScoreBar score={s.score} nivel={s.nivel} />
                        </div>
                      ))}
                    {resultado.estudiantes.filter(s => s.nivel === 'ALTO').length === 0 && (
                      <p className="text-xs text-foreground/40 text-center py-4">No hay estudiantes en riesgo alto</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Bar chart por carrera */}
              <div className="rounded-2xl border border-primary/20 bg-card/40 p-6 backdrop-blur-xl">
                <h3 className="text-sm font-bold text-foreground mb-4">Distribución de Riesgo por Carrera</h3>
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={resultado.porCarrera.slice(0, 8)} margin={{ top: 5, right: 10, left: -10, bottom: 60 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis
                      dataKey="carrera"
                      tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }}
                      angle={-35}
                      textAnchor="end"
                      interval={0}
                    />
                    <YAxis tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }} />
                    <Tooltip
                      contentStyle={{ background: '#1e1e2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8 }}
                      labelStyle={{ color: 'rgba(255,255,255,0.7)', fontSize: 11 }}
                    />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                    <Bar dataKey="alto"  name="Alto"  fill={COLORES_RIESGO.ALTO}  radius={[4, 4, 0, 0]} />
                    <Bar dataKey="medio" name="Medio" fill={COLORES_RIESGO.MEDIO} radius={[4, 4, 0, 0]} />
                    <Bar dataKey="bajo"  name="Bajo"  fill={COLORES_RIESGO.BAJO}  radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Bar chart por ciclo */}
              {resultado.porCiclo.length > 1 && (
                <div className="rounded-2xl border border-primary/20 bg-card/40 p-6 backdrop-blur-xl">
                  <h3 className="text-sm font-bold text-foreground mb-4">Distribución de Riesgo por Ciclo</h3>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={resultado.porCiclo} margin={{ top: 5, right: 10, left: -10, bottom: 10 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                      <XAxis dataKey="ciclo" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }} />
                      <YAxis tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }} />
                      <Tooltip contentStyle={{ background: '#1e1e2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8 }} />
                      <Legend wrapperStyle={{ fontSize: 11 }} />
                      <Bar dataKey="alto"  name="Alto"  fill={COLORES_RIESGO.ALTO}  radius={[4, 4, 0, 0]} />
                      <Bar dataKey="medio" name="Medio" fill={COLORES_RIESGO.MEDIO} radius={[4, 4, 0, 0]} />
                      <Bar dataKey="bajo"  name="Bajo"  fill={COLORES_RIESGO.BAJO}  radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          )}

          {/* ── Tab: Recomendaciones ── */}
          {activeResultTab === 'recomendaciones' && (
            <div className="rounded-2xl border border-primary/20 bg-card/40 p-6 backdrop-blur-xl space-y-3">
              <h3 className="text-base font-bold text-foreground mb-4 flex items-center gap-2">
                <Star className="h-4 w-4 text-yellow-400" /> Recomendaciones Generadas por IA
              </h3>
              {resultado.recomendaciones.map((r, i) => (
                <div key={i} className={`rounded-xl border p-5 ${
                  r.prioridad === 'URGENTE' ? 'border-red-500/20 bg-red-500/8' :
                  r.prioridad === 'ALTA'    ? 'border-orange-500/20 bg-orange-500/8' :
                  'border-yellow-500/20 bg-yellow-500/8'
                }`}>
                  <div className="flex items-start gap-3">
                    <div className={`flex h-8 w-8 items-center justify-center rounded-lg shrink-0 ${
                      r.prioridad === 'URGENTE' ? 'bg-red-500/20' :
                      r.prioridad === 'ALTA'    ? 'bg-orange-500/20' :
                      'bg-yellow-500/20'
                    }`}>
                      <span className="text-sm">{i === 0 ? '🚨' : i === 1 ? '📞' : i === 2 ? '📚' : i === 3 ? '📋' : i === 4 ? '🧠' : '🎯'}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1.5">
                        <p className="font-bold text-foreground text-sm">{r.accion}</p>
                        <BadgePrioridad p={r.prioridad} />
                        <span className="rounded-full border border-primary/20 bg-primary/10 px-2 py-0.5 text-[10px] text-primary">
                          {r.dirigidaA}
                        </span>
                      </div>
                      <p className="text-xs text-foreground/70 leading-relaxed">{r.detalle}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          VISTA: HISTORIAL
      ══════════════════════════════════════════════════════════════════════ */}
      {view === 'historial' && (
        <div className="rounded-2xl border border-primary/20 bg-card/40 p-6 backdrop-blur-xl">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
              <Clock className="h-5 w-5 text-foreground/40" /> Historial de Análisis
            </h3>
            <button onClick={fetchHistorial} className="p-2 rounded-lg hover:bg-primary/10 transition-colors">
              <RefreshCw className="h-4 w-4 text-foreground/40" />
            </button>
          </div>

          {historial.length === 0 ? (
            <div className="text-center py-16">
              <Brain className="h-12 w-12 text-foreground/10 mx-auto mb-3" />
              <p className="text-foreground/40 text-sm">Aún no hay análisis guardados.</p>
              <p className="text-foreground/30 text-xs mt-1">Ejecuta un análisis y compártelo con tutores para que aparezca aquí.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {historial.map((h) => (
                <div key={h.id} className="rounded-xl border border-primary/10 bg-background/30 overflow-hidden">
                  <button
                    onClick={() => setExpandedHist(expandedHist === h.id ? null : h.id)}
                    className="w-full flex items-center gap-4 p-4 text-left hover:bg-primary/5 transition-colors"
                  >
                    <div className={`flex h-10 w-10 items-center justify-center rounded-lg shrink-0 ${
                      h.nivel_alerta === 'ALTO' ? 'bg-red-500/15' :
                      h.nivel_alerta === 'MEDIO' ? 'bg-yellow-500/15' : 'bg-green-500/15'
                    }`}>
                      <Brain className={`h-5 w-5 ${
                        h.nivel_alerta === 'ALTO' ? 'text-red-400' :
                        h.nivel_alerta === 'MEDIO' ? 'text-yellow-400' : 'text-green-400'
                      }`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-foreground text-sm">{h.archivo_nombre || 'Análisis sin nombre'}</p>
                      <p className="text-xs text-foreground/40 mt-0.5">
                        {new Date(h.fecha).toLocaleDateString('es-PE', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <div className="hidden sm:flex items-center gap-2 text-xs">
                        <span className="text-red-400 font-bold">{h.alto_riesgo} alto</span>
                        <span className="text-foreground/20">·</span>
                        <span className="text-yellow-400 font-bold">{h.medio_riesgo} medio</span>
                        <span className="text-foreground/20">·</span>
                        <span className="text-green-400 font-bold">{h.bajo_riesgo} bajo</span>
                      </div>
                      {expandedHist === h.id
                        ? <ChevronUp className="h-4 w-4 text-foreground/30" />
                        : <ChevronDown className="h-4 w-4 text-foreground/30" />
                      }
                    </div>
                  </button>

                  {expandedHist === h.id && (
                    <div className="border-t border-primary/10 p-4 space-y-3 bg-background/10">
                      <div className="grid grid-cols-3 gap-3 mb-3">
                        <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-center">
                          <p className="text-xl font-bold text-red-400">{h.alto_riesgo}</p>
                          <p className="text-[10px] text-red-400/70">Riesgo Alto</p>
                        </div>
                        <div className="rounded-lg border border-yellow-500/20 bg-yellow-500/10 p-3 text-center">
                          <p className="text-xl font-bold text-yellow-400">{h.medio_riesgo}</p>
                          <p className="text-[10px] text-yellow-400/70">Riesgo Medio</p>
                        </div>
                        <div className="rounded-lg border border-green-500/20 bg-green-500/10 p-3 text-center">
                          <p className="text-xl font-bold text-green-400">{h.bajo_riesgo}</p>
                          <p className="text-[10px] text-green-400/70">Riesgo Bajo</p>
                        </div>
                      </div>
                      <p className="text-sm text-foreground/70 leading-relaxed">{h.resumen}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}