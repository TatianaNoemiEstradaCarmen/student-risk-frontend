'use client'

import { supabase } from '@/src/lib/supabase'
import AcademicRecommendationsPanel from '@/components/student/AcademicRecommendationsPanel'
import { useState, useEffect } from 'react'
import {
  BookOpen,
  Gift,
  MessageSquare,
  Send,
  AlertTriangle,
  TrendingUp,
  AlertCircle,
  CheckCircle
} from 'lucide-react'

import { getScholarships } from '@/src/services/scholarshipService'
// ✅ CAMBIO 1: Importar servicio de trámites
import { getTramites } from '@/src/services/tramitesService'
import { getStudents } from '@/src/data/students'
import { SidebarLayout } from '@/components/dashboard/sidebar-layout'
import { calculateRisk } from '@/src/services/riskEngine'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

interface Scholarship {
  id: number
  nombre: string
  monto: string
  requisitos: string
  tipo: string
  promedio_minimo: number
  cupos: number
  fecha_fin: string
}

interface TutoringRequest {
  id: number
  estudiante: string
  motivo: string
  descripcion: string
  telefono: string
  estadoEmocional: string
  urgencia: string
  modalidad: string
  fecha: string
  estado: string
}

// ✅ CAMBIO 2: Agregar 'tramites' al tipo de tabs
type StudentTab = 'solicitudes' | 'recomendaciones' | 'becas' | 'tramites' | 'alertas'

const selectClass = 'w-full rounded-md border border-primary/20 bg-background/50 px-3 py-2 text-sm text-foreground'

export default function EstudiantePage() {
  const [tab, setTab] = useState<StudentTab>('solicitudes')
  const [formData, setFormData] = useState({
    motivo: '',
    descripcion: '',
    telefono: '',
    estadoEmocional: '',
    urgencia: '',
    modalidad: '',
    tipoAyuda: '',
  })
  const [submittedRequests, setSubmittedRequests] = useState<TutoringRequest[]>([])
  const [successMessage, setSuccessMessage] = useState('')
  const [alerts, setAlerts] = useState<any[]>([])
  const [scholarships, setScholarships] = useState<Scholarship[]>([])
  // ✅ CAMBIO 3: Agregar estado para trámites
  const [tramites, setTramites] = useState<any[]>([])

  const myRisk = calculateRisk({
    gpa: 11,
    attendance: 65,
    cursosDesaprobados: 2,
    creditosAprobados: 72,
    creditosTotales: 200,
  })

  useEffect(() => {
    const loadRequests = async () => {
      const { data, error } = await supabase
        .from('solicitudes_tutoria')
        .select('*')
        .order('fecha_solicitud', { ascending: false })

      if (!error && data) {
        const formatted = data.map((r: any) => ({
          id: r.id,
          estudiante: r.estudiante_id,
          motivo: r.motivo,
          descripcion: r.descripcion,
          telefono: r.telefono,
          estadoEmocional: r.estado_emocional,
          urgencia: r.urgencia,
          modalidad: r.modalidad,
          fecha: r.fecha_solicitud?.split('T')[0],
          estado: r.estado,
        }))
        setSubmittedRequests(formatted)
      }
    }
    loadRequests()
  }, [])

  useEffect(() => {
    const loadAlerts = async () => {
      const { data, error } = await supabase
        .from('alertas_academicas')
        .select(`
          id,
          mensaje,
          recomendacion,
          nivel_riesgo,
          fecha_alerta,
          estudiantes:estudiante_id (
            id,
            nombre
          )
        `)
        .order('fecha_alerta', { ascending: false })

      if (!error && data) {
        const formatted = data.map((a: any) => ({
          student: a.estudiantes?.nombre || 'Tú',
          message: a.mensaje,
          recommendation: a.recomendacion,
        }))
        setAlerts(formatted)
      }
    }
    loadAlerts()
  }, [])

  useEffect(() => {
    const loadScholarships = async () => {
      const data = await getScholarships()
      setScholarships(data || [])
    }
    loadScholarships()
  }, [])

  // ✅ CAMBIO 4: useEffect para cargar trámites
  useEffect(() => {
    const loadTramites = async () => {
      const data = await getTramites()
      setTramites(data || [])
    }
    loadTramites()
  }, [])

  useEffect(() => {
    const syncTabFromUrl = () => {
      const params = new URLSearchParams(window.location.search)
      const currentTab = params.get('tab')
      if (
        currentTab === 'solicitudes' ||
        currentTab === 'recomendaciones' ||
        currentTab === 'becas' ||
        currentTab === 'tramites' ||
        currentTab === 'alertas'
      ) {
        setTab(currentTab)
      } else {
        setTab('solicitudes')
      }
    }
    syncTabFromUrl()
    window.addEventListener('popstate', syncTabFromUrl)
    window.addEventListener('student-tab-change', syncTabFromUrl)
    return () => {
      window.removeEventListener('popstate', syncTabFromUrl)
      window.removeEventListener('student-tab-change', syncTabFromUrl)
    }
  }, [])

  const handleTabChange = (newTab: StudentTab) => {
    setTab(newTab)
    window.history.replaceState(null, '', `/dashboard/estudiante?tab=${newTab}`)
    window.dispatchEvent(new Event('student-tab-change'))
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmitRequest = async (e: React.FormEvent) => {
    e.preventDefault()
    if (
      !formData.motivo.trim() ||
      !formData.descripcion.trim() ||
      !formData.telefono.trim() ||
      !formData.estadoEmocional ||
      !formData.urgencia ||
      !formData.modalidad
    ) {
      alert('Todos los campos son obligatorios')
      return
    }

    const { error } = await supabase
      .from('solicitudes_tutoria')
      .insert([
        {
          estudiante_id: 1,
          motivo: formData.motivo,
          descripcion: formData.descripcion,
          telefono: formData.telefono,
          estado_emocional: formData.estadoEmocional,
          urgencia: formData.urgencia,
          modalidad: formData.modalidad,
          tipo_ayuda: formData.tipoAyuda,
          fecha_solicitud: new Date().toISOString(),
          estado: 'Pendiente',
        },
      ])

    if (error) {
      alert('Error al enviar la solicitud. Intenta de nuevo.')
      return
    }

    const { data } = await supabase
      .from('solicitudes_tutoria')
      .select('*')
      .order('fecha_solicitud', { ascending: false })

    if (data) {
      setSubmittedRequests(data.map((r: any) => ({
        id: r.id,
        estudiante: r.estudiante_id,
        motivo: r.motivo,
        descripcion: r.descripcion,
        telefono: r.telefono,
        estadoEmocional: r.estado_emocional,
        urgencia: r.urgencia,
        modalidad: r.modalidad,
        fecha: r.fecha_solicitud?.split('T')[0],
        estado: r.estado,
      })))
    }

    setFormData({
      motivo: '',
      descripcion: '',
      telefono: '',
      estadoEmocional: '',
      urgencia: '',
      modalidad: '',
      tipoAyuda: '',
    })
    setSuccessMessage('Solicitud de tutoría enviada exitosamente')
    setTimeout(() => setSuccessMessage(''), 3000)
  }

  // ✅ CAMBIO 5: Agregar trámites al menú lateral
  const menuItems = [
    { label: 'Solicitar Tutoría', href: '/dashboard/estudiante?tab=solicitudes', icon: <MessageSquare className="h-5 w-5" /> },
    { label: 'Recomendaciones de Apoyo', href: '/dashboard/estudiante?tab=recomendaciones', icon: <BookOpen className="h-5 w-5" /> },
    { label: 'Becas Disponibles', href: '/dashboard/estudiante?tab=becas', icon: <Gift className="h-5 w-5" /> },
    { label: 'Trámites de Apoyo', href: '/dashboard/estudiante?tab=tramites', icon: <BookOpen className="h-5 w-5" /> },
    { label: 'Mis Alertas Académicas', href: '/dashboard/estudiante?tab=alertas', icon: <AlertCircle className="h-5 w-5" /> },
  ]

  return (
    <SidebarLayout role="estudiante" menuItems={menuItems}>
      <div className="max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Bienvenido, Estudiante</h1>
          <p className="text-foreground/70">Gestiona tus solicitudes de tutoría, becas, recomendaciones y alertas académicas</p>
          <div className="mt-4 rounded-xl border border-yellow-500/20 bg-yellow-500/10 p-4">
            <div className="flex items-start gap-3">
              <TrendingUp className="mt-1 h-5 w-5 text-yellow-400" />
              <div>
                <p className="font-semibold text-yellow-400">Riesgo Académico Detectado</p>
                <p className="text-sm text-foreground/80">El sistema recomienda solicitar acompañamiento académico preventivo.</p>
              </div>
            </div>
          </div>
        </div>

        {/* ✅ CAMBIO 6: Agregar tab de trámites en la barra superior */}
        <div className="mb-6 flex flex-wrap gap-2 border-b border-primary/20">
          {[
            { id: 'solicitudes', label: 'Solicitar Tutoría' },
            { id: 'recomendaciones', label: 'Recomendaciones de Apoyo' },
            { id: 'becas', label: 'Becas Disponibles' },
            { id: 'tramites', label: 'Trámites de Apoyo' },
            { id: 'alertas', label: 'Mis Alertas' },
          ].map(tabItem => (
            <button
              key={tabItem.id}
              onClick={() => handleTabChange(tabItem.id as StudentTab)}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                tab === tabItem.id
                  ? 'border-b-2 border-primary text-primary'
                  : 'text-foreground/70 hover:text-foreground'
              }`}
            >
              {tabItem.label}
            </button>
          ))}
        </div>

        {tab === 'solicitudes' && (
          <div className="space-y-6">
            <div className="rounded-2xl border border-primary/20 bg-card/40 p-8 backdrop-blur-xl">
              <h2 className="mb-6 text-xl font-bold text-foreground flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Solicitar Sesión de Tutoría
              </h2>
              {successMessage && (
                <div className="mb-6 flex items-center gap-3 rounded-lg border border-green-500/20 bg-green-500/10 p-4">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <p className="text-sm text-green-500">{successMessage}</p>
                </div>
              )}
              <form onSubmit={handleSubmitRequest} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="motivo" className="text-foreground">¿En qué tema necesitas ayuda?</Label>
                  <Input
                    id="motivo"
                    name="motivo"
                    value={formData.motivo}
                    onChange={handleInputChange}
                    placeholder="Ej: Matemáticas, Algoritmos, Física, etc."
                    className="border-primary/20 bg-background/50"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="telefono" className="text-foreground">Teléfono de contacto</Label>
                  <Input
                    id="telefono"
                    name="telefono"
                    value={formData.telefono}
                    onChange={handleInputChange}
                    placeholder="999999999"
                    className="border-primary/20 bg-background/50"
                    required
                  />
                </div>

                <select name="estadoEmocional" value={formData.estadoEmocional} onChange={handleInputChange} className={selectClass}>
                  <option value="">¿Cómo te sientes?</option>
                  <option value="Bien">Bien</option>
                  <option value="Estresado">Estresado</option>
                  <option value="Ansioso">Ansioso</option>
                  <option value="Desmotivado">Desmotivado</option>
                  <option value="Preocupado">Preocupado</option>
                </select>

                <select name="urgencia" value={formData.urgencia} onChange={handleInputChange} className={selectClass}>
                  <option value="">Nivel de urgencia</option>
                  <option value="Baja">Baja</option>
                  <option value="Media">Media</option>
                  <option value="Alta">Alta</option>
                </select>

                <select name="modalidad" value={formData.modalidad} onChange={handleInputChange} className={selectClass}>
                  <option value="">Modalidad preferida</option>
                  <option value="Virtual">Virtual</option>
                  <option value="Presencial">Presencial</option>
                </select>

                <div className="space-y-2">
                  <Label className="text-foreground">Tipo de ayuda</Label>
                  <select name="tipoAyuda" value={formData.tipoAyuda} onChange={handleInputChange} className={selectClass}>
                    <option value="">Seleccione</option>
                    <option value="Académica">Académica</option>
                    <option value="Psicológica">Psicológica</option>
                    <option value="Económica">Económica</option>
                    <option value="Vocacional">Vocacional</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="descripcion" className="text-foreground">Describe tu situación con más detalle</Label>
                  <Textarea
                    id="descripcion"
                    name="descripcion"
                    value={formData.descripcion}
                    onChange={handleInputChange}
                    placeholder="Cuéntale al tutor específicamente qué conceptos te están causando dificultad..."
                    className="border-primary/20 bg-background/50 min-h-32"
                    required
                  />
                </div>
                <Button type="submit" className="w-full bg-gradient-to-r from-primary to-secondary">
                  <Send className="mr-2 h-4 w-4" />
                  Enviar Solicitud
                </Button>
              </form>
            </div>

            {submittedRequests.length > 0 && (
              <div className="rounded-2xl border border-primary/20 bg-card/40 p-8 backdrop-blur-xl">
                <h3 className="mb-6 text-lg font-bold text-foreground">Mis Solicitudes</h3>
                <div className="space-y-3">
                  {submittedRequests.map(request => (
                    <div key={request.id} className="rounded-lg border border-primary/20 bg-background/30 p-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-semibold text-foreground">{request.motivo}</p>
                          <p className="text-sm text-foreground/70">{request.descripcion}</p>
                          <p className="text-sm text-foreground/70 mt-2">📞 {request.telefono}</p>
                          <p className="text-sm text-foreground/70">😊 Estado emocional: {request.estadoEmocional}</p>
                          <p className="text-sm text-foreground/70">⚡ Urgencia: {request.urgencia}</p>
                          <p className="text-sm text-foreground/70">💻 Modalidad: {request.modalidad}</p>
                          <p className="text-xs text-foreground/50 mt-2">{request.fecha}</p>
                        </div>
                        <span className="rounded-full border border-yellow-500/20 bg-yellow-500/10 px-3 py-1 text-xs font-semibold text-yellow-400">
                          {request.estado}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {tab === 'recomendaciones' && <AcademicRecommendationsPanel />}

        {tab === 'becas' && (
          <div className="space-y-6">
            {scholarships.map(scholarship => (
              <div key={scholarship.id} className="rounded-2xl border border-primary/20 bg-card/40 p-8 backdrop-blur-xl">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <Gift className="h-6 w-6 text-secondary" />
                      <h3 className="text-lg font-bold text-foreground">{scholarship.nombre}</h3>
                    </div>
                    <p className="text-foreground/70 mb-4">Información de beca disponible para estudiantes.</p>
                    <div className="mb-4">
                      <p className="text-sm font-semibold text-foreground mb-2">Requisitos:</p>
                      <ul className="space-y-1 text-sm text-foreground/70">
                        <li className="flex items-center gap-2">
                          <span className="h-1.5 w-1.5 rounded-full bg-secondary"></span>
                          {scholarship.requisitos}
                        </li>
                      </ul>
                    </div>
                    <div className="grid grid-cols-2 gap-3 mt-4 text-sm">
                      <p><strong>Tipo:</strong> {scholarship.tipo}</p>
                      <p><strong>Promedio mínimo:</strong> {scholarship.promedio_minimo}</p>
                      <p><strong>Cupos:</strong> {scholarship.cupos}</p>
                      <p><strong>Vigencia:</strong> {scholarship.fecha_fin}</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-3">
                    <div className="rounded-lg border border-secondary/20 bg-secondary/10 px-4 py-2">
                      <p className="text-xs text-foreground/70">Monto Mensual</p>
                      <p className="text-2xl font-bold text-secondary">{scholarship.monto}</p>
                    </div>
                    <Button className="bg-gradient-to-r from-primary to-secondary">Solicitar</Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ✅ CAMBIO 7: Vista de trámites */}
        {tab === 'tramites' && (
          <div className="space-y-6">
            {tramites.length === 0 ? (
              <div className="rounded-2xl border border-primary/20 bg-card/40 p-8 backdrop-blur-xl text-center">
                <BookOpen className="h-12 w-12 text-foreground/20 mx-auto mb-3" />
                <p className="text-foreground/50 text-sm">No hay trámites disponibles.</p>
              </div>
            ) : (
              tramites.map((tramite) => (
                <div
                  key={tramite.id}
                  className="rounded-2xl border border-primary/20 bg-card/40 p-8 backdrop-blur-xl"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-foreground">
                      {tramite.nombre_tramite}
                    </h3>
                    <span className="rounded-full bg-primary/10 px-3 py-1 text-xs">
                      {tramite.codigo_tramite}
                    </span>
                  </div>

                  <p className="text-foreground/70 mb-4">
                    {tramite.descripcion}
                  </p>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <p className="font-semibold">Requisitos</p>
                      <p className="text-sm text-foreground/70">{tramite.requisitos}</p>
                    </div>
                    <div>
                      <p className="font-semibold">Área Responsable</p>
                      <p className="text-sm text-foreground/70">{tramite.area_responsable}</p>
                    </div>
                    <div>
                      <p className="font-semibold">Canal de Atención</p>
                      <p className="text-sm text-foreground/70">{tramite.canal_atencion}</p>
                    </div>
                    <div>
                      <p className="font-semibold">Prioridad</p>
                      <p className="text-sm text-foreground/70">{tramite.prioridad}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {tab === 'alertas' && (
          <div className="space-y-4">
            {alerts.length === 0 ? (
              <div className="rounded-2xl border border-primary/20 bg-card/40 p-8 backdrop-blur-xl text-center">
                <AlertCircle className="h-12 w-12 text-foreground/20 mx-auto mb-3" />
                <p className="text-foreground/50 text-sm">No tienes alertas activas.</p>
                <p className="text-foreground/30 text-xs mt-1">Las alertas aparecen cuando el sistema detecta riesgo medio o alto.</p>
              </div>
            ) : (
              alerts.map((alert, index) => {
                const comps: any = myRisk.components
                return (
                  <div key={index} className="rounded-xl border border-red-500/20 bg-red-500/10 p-6 backdrop-blur-xl">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-4">
                        <AlertTriangle className="mt-1 h-5 w-5 text-red-400" />
                        <div className="flex-1">
                          <h3 className="font-semibold text-foreground">{alert.student}</h3>
                          <p className="text-sm text-foreground/80 mt-1">{alert.message}</p>
                          <p className="text-xs text-yellow-400 mt-2">{alert.recommendation}</p>
                        </div>
                      </div>
                      <span className="rounded-full border border-red-500/20 bg-red-500/10 px-3 py-1 text-xs font-semibold text-red-400">
                        Score: {myRisk.riskScore.toFixed(1)}
                      </span>
                    </div>
                    <div className="mt-4 grid grid-cols-4 gap-3">
                      {[
                        { label: 'Notas', score: comps.gpaScore, color: 'bg-red-500' },
                        { label: 'Asistencia', score: comps.attendanceScore, color: 'bg-yellow-500' },
                        { label: 'Desaprobados', score: comps.failedCoursesScore, color: 'bg-orange-500' },
                        { label: 'Progreso', score: comps.progressScore, color: 'bg-blue-500' },
                      ].map(item => (
                        <div key={item.label} className="text-center">
                          <p className="text-[10px] text-foreground/50 mb-1">{item.label}</p>
                          <div className="h-2 w-full rounded-full bg-black/20 overflow-hidden">
                            <div className={`h-2 rounded-full ${item.color} transition-all`} style={{ width: `${item.score}%` }} />
                          </div>
                          <p className="mt-1 text-xs font-medium text-foreground/80">{item.score.toFixed(0)}%</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })
            )}
          </div>
        )}
      </div>
    </SidebarLayout>
  )
}
