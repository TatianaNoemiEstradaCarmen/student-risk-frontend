'use client'

import AcademicRecommendationsPanel from '@/components/student/AcademicRecommendationsPanel'
import { useState, useEffect } from 'react'
import {
  BookOpen,
  Gift,
  MessageSquare,
  Send,
  AlertTriangle,
  TrendingUp,
  DollarSign,
  AlertCircle,
  CheckCircle
} from 'lucide-react'

import { getTutoringRequests } from '@/src/services/tutoringService'
import { getScholarships } from '@/src/services/scholarshipService'
import { alerts } from '@/src/data/students'
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
  fecha: string
  estado: string
}

type StudentTab = 'solicitudes' | 'recomendaciones' | 'becas' | 'alertas'

export default function EstudiantePage() {
  const [tab, setTab] = useState<StudentTab>('solicitudes')

  const [formData, setFormData] = useState({
    motivo: '',
    descripcion: '',
  })

  const [submittedRequests, setSubmittedRequests] = useState<TutoringRequest[]>([])
  const [successMessage, setSuccessMessage] = useState('')
  const [scholarships, setScholarships] = useState<Scholarship[]>([])

  useEffect(() => {
    const savedRequests = localStorage.getItem('tutoringRequests')

    if (savedRequests) {
      setSubmittedRequests(JSON.parse(savedRequests))
    } else {
      const data = getTutoringRequests()
      const formattedRequests = data.map((request: any) => ({
        id: request.id,
        motivo: request.motivo,
        descripcion: request.descripcion,
        estudiante: request.estudiante,
        fecha: request.fecha,
        estado: request.estado,
      }))
      setSubmittedRequests(formattedRequests)
    }
  }, [])

  useEffect(() => {
    const loadScholarships = async () => {
      const data = await getScholarships()
      setScholarships(data || [])
    }
  
    loadScholarships()
  }, [])

  useEffect(() => {
    const syncTabFromUrl = () => {
      const params = new URLSearchParams(window.location.search)
      const currentTab = params.get('tab')

      if (
        currentTab === 'solicitudes' ||
        currentTab === 'recomendaciones' ||
        currentTab === 'becas' ||
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

    const nextUrl = `/dashboard/estudiante?tab=${newTab}`
    window.history.replaceState(null, '', nextUrl)
    window.dispatchEvent(new Event('student-tab-change'))
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmitRequest = (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.motivo.trim() || !formData.descripcion.trim()) {
      alert('Todos los campos son obligatorios')
      return
    }

    const newRequest = {
      id: submittedRequests.length + 1,
      estudiante: 'Estudiante Actual',
      motivo: formData.motivo,
      descripcion: formData.descripcion,
      fecha: new Date().toISOString().split('T')[0],
      estado: 'Pendiente',
    }

    const updatedRequests = [...submittedRequests, newRequest]
    setSubmittedRequests(updatedRequests)
    localStorage.setItem('tutoringRequests', JSON.stringify(updatedRequests))

    setFormData({ motivo: '', descripcion: '' })
    setSuccessMessage('Solicitud de tutoría enviada exitosamente')

    setTimeout(() => setSuccessMessage(''), 3000)
  }

  const menuItems = [
    { label: 'Solicitar Tutoría', href: '/dashboard/estudiante?tab=solicitudes', icon: <MessageSquare className="h-5 w-5" /> },
    { label: 'Recomendaciones de Apoyo', href: '/dashboard/estudiante?tab=recomendaciones', icon: <BookOpen className="h-5 w-5" /> },
    { label: 'Becas Disponibles', href: '/dashboard/estudiante?tab=becas', icon: <Gift className="h-5 w-5" /> },
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

        <div className="mb-6 flex flex-wrap gap-2 border-b border-primary/20">
          {[
            { id: 'solicitudes', label: 'Solicitar Tutoría' },
            { id: 'recomendaciones', label: 'Recomendaciones de Apoyo' },
            { id: 'becas', label: 'Becas Disponibles' },
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

        {tab === 'recomendaciones' && (
          <AcademicRecommendationsPanel />
        )}

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
                      <p>
                        <strong>Tipo:</strong> {scholarship.tipo}
                      </p>

                      <p>
                        <strong>Promedio mínimo:</strong> {scholarship.promedio_minimo}
                      </p>

                      <p>
                        <strong>Cupos:</strong> {scholarship.cupos}
                      </p>

                      <p>
                        <strong>Vigencia:</strong> {scholarship.fecha_fin}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-3">
                    <div className="rounded-lg border border-secondary/20 bg-secondary/10 px-4 py-2">
                      <p className="text-xs text-foreground/70">Monto Mensual</p>
                      <p className="text-2xl font-bold text-secondary flex items-center gap-1">
                        {scholarship.monto}
                      </p>
                    </div>
                    <Button className="bg-gradient-to-r from-primary to-secondary">Solicitar</Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === 'alertas' && (
          <div className="space-y-4">
            {alerts.map(alert => {
              const myRisk = calculateRisk({
                gpa: 11,
                attendance: 65,
                cursosDesaprobados: 2,
                creditosAprobados: 72,
                creditosTotales: 200,
              })

              const comps: any = myRisk.components

              return (
                <div
                  key={alert.student}
                  className="rounded-xl border border-red-500/20 bg-red-500/10 p-6 backdrop-blur-xl"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <AlertTriangle className="mt-1 h-5 w-5 text-red-400" />
                      <div className="flex-1">
                        <h3 className="font-semibold text-foreground">{alert.student}</h3>
                        <p className="text-sm text-foreground/80 mt-1">{alert.message}</p>
                        <p className="text-xs text-yellow-400 mt-2">{alert.recommendation}</p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="rounded-full border border-red-500/20 bg-red-500/10 px-3 py-1 text-xs font-semibold text-red-400">
                        Score: {myRisk.riskScore.toFixed(1)}
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-4 gap-3">
                    {[
                      { label: 'Notas', score: comps.gpaScore, color: 'bg-red-500' },
                      { label: 'Asistencia', score: comps.attendanceScore, color: 'bg-yellow-500' },
                      { label: 'Desaprobados', score: comps.failedCoursesScore, color: 'bg-orange-500' },
                      { label: 'Progreso', score: comps.progressScore, color: 'bg-blue-500' },
                    ].map((item) => (
                      <div key={item.label} className="text-center">
                        <p className="text-[10px] text-foreground/50 mb-1">{item.label}</p>
                        <div className="h-2 w-full rounded-full bg-black/20 overflow-hidden">
                          <div
                            className={`h-2 rounded-full ${item.color} transition-all`}
                            style={{ width: `${item.score}%` }}
                          />
                        </div>
                        <p className="mt-1 text-xs font-medium text-foreground/80">
                          {item.score.toFixed(0)}%
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </SidebarLayout>
  )
}
