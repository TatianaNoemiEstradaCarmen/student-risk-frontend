'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'

import {
  AlertTriangle,
  MessageSquare,
  TrendingDown,
  Search,
  User,
  BookOpen,
  FileText,
  ChevronRight,
  Activity,
  CheckCircle,
  Phone
} from 'lucide-react'

import { SidebarLayout } from '@/components/dashboard/sidebar-layout'
import { Button } from '@/components/ui/button'
import { supabase } from '@/src/lib/supabase'

function TutorContent() {
  const searchParams = useSearchParams()
  const activeTab = searchParams.get('tab') || 'alertas'

  const [requests, setRequests] = useState<any[]>([])
  const [alerts, setAlerts] = useState<any[]>([])
  const [filtroRiesgo, setFiltroRiesgo] = useState('TODOS')
  const [loadingAlerts, setLoadingAlerts] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedStudent, setSelectedStudent] = useState<any>(null)
  const [studentsList, setStudentsList] = useState<any[]>([])
  const [loadingStudents, setLoadingStudents] = useState(false)

  const mockStudents = [
    {
      id: '1',
      nombre: 'Juan Pérez',
      codigo: '202210045',
      correo: 'juan.perez@usil.pe',
      carrera: 'Ingeniería de Sistemas e Información',
      promedio: '11.2',
      asistencia: 68,
      riesgo: 'ALTO',
      historial: [
        { fecha: '2026-05-12', tutor: 'Carlos Alva', observacion: 'El estudiante menciona problemas de cruce de horarios con su trabajo pre-profesional.' },
        { fecha: '2026-05-28', tutor: 'Carlos Alva', observacion: 'No asistió a la sesión de reforzamiento programada.' }
      ]
    },
    {
      id: '2',
      nombre: 'Carlos Mendoza',
      codigo: '202320112',
      correo: 'carlos.mendoza@usil.pe',
      carrera: 'Ingeniería de Sistemas e Información',
      promedio: '13.5',
      asistencia: 75,
      riesgo: 'MEDIO',
      historial: [
        { fecha: '2026-06-02', tutor: 'Carlos Alva', observacion: 'Muestra una mejora ligera en las notas del segundo consolidado.' }
      ]
    },
    {
      id: '3',
      nombre: 'Ana Gómez Torres',
      codigo: '202110984',
      correo: 'ana.gomez@usil.pe',
      carrera: 'Marketing',
      promedio: '16.8',
      asistencia: 95,
      riesgo: 'BAJO',
      historial: []
    }
  ]

  // ✅ Carga solicitudes desde Supabase con JOIN a estudiantes
  useEffect(() => {
    async function fetchSolicitudes() {
      const { data, error } = await supabase
        .from('solicitudes_tutoria')
        .select(`
          *,
          estudiantes (
            id,
            nombre,
            correo,
            carrera,
            codigo
          )
        `)
        .order('fecha_solicitud', { ascending: false })

      if (!error && data) {
        setRequests(data)
      }
    }
    fetchSolicitudes()
  }, [])

  useEffect(() => {
    async function fetchAlertas() {
      setLoadingAlerts(true)
      const { data, error } = await supabase
        .from('alertas_academicas')
        .select(`
          id,
          mensaje,
          recomendacion,
          nivel_riesgo,
          estudiantes (id, nombre, carrera)
        `)
      if (!error && data) setAlerts(data)
      setLoadingAlerts(false)
    }
    fetchAlertas()
  }, [])

  useEffect(() => {
    async function fetchEstudiantes() {
      setLoadingStudents(true)
      const { data, error } = await supabase
        .from('estudiantes')
        .select('*')

      if (!error && data && data.length > 0) {
        const formatted = data.map((est: any) => ({
          id: est.id.toString(),
          nombre: est.nombre,
          codigo: est.codigo || `2024${est.id}00`,
          correo: est.correo || `${est.nombre.toLowerCase().replace(/ /g, '.')}@usil.pe`,
          carrera: est.carrera || 'Ingeniería de Sistemas',
          promedio: est.promedio?.toFixed(1) || '12.0',
          asistencia: est.asistencia || 80,
          riesgo: est.nivel_riesgo || 'MEDIO',
          historial: []
        }))
        setStudentsList(formatted)
      } else {
        setStudentsList(mockStudents)
      }
      setLoadingStudents(false)
    }
    fetchEstudiantes()
  }, [])

  const filteredStudents = studentsList.filter(student =>
    student.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
    student.codigo.includes(searchQuery)
  )

  const getEstadoBadge = (estado: string) => {
    switch (estado?.toLowerCase()) {
      case 'pendiente':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/20'
      case 'aceptada':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/20'
      case 'completada':
        return 'bg-green-500/20 text-green-400 border-green-500/20'
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/20'
    }
  }

  const getUrgenciaBadge = (urgencia: string) => {
    switch (urgencia?.toLowerCase()) {
      case 'alta':
        return 'text-red-400'
      case 'media':
        return 'text-yellow-400'
      case 'baja':
        return 'text-green-400'
      default:
        return 'text-foreground/50'
    }
  }

  const menuItems = [
    { label: 'Alertas de Estudiantes', href: '/dashboard/tutor?tab=alertas', icon: <AlertTriangle className="h-5 w-5" /> },
    { label: 'Solicitudes de Tutoría', href: '/dashboard/tutor?tab=solicitudes', icon: <MessageSquare className="h-5 w-5" /> },
    { label: 'Seguimiento Académico', href: '/dashboard/tutor?tab=seguimiento', icon: <TrendingDown className="h-5 w-5" /> },
  ]

  return (
    <SidebarLayout role="tutor" menuItems={menuItems}>
      <div className="max-w-7xl">

        {/* HEADER */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Panel de Tutor Académico</h1>
          <p className="text-foreground/70">
            {activeTab === 'alertas' && 'Gestiona alertas críticas de estudiantes calculadas por IA'}
            {activeTab === 'solicitudes' && 'Revisa y agenda las citas solicitadas por los alumnos'}
            {activeTab === 'seguimiento' && 'Consulta el historial y perfil integral de seguimiento académico'}
          </p>
        </div>

        {/* TAB 1: ALERTAS */}
        {activeTab === 'alertas' && (
          <div className="mb-8 rounded-2xl border border-primary/20 bg-card/40 p-8 backdrop-blur-xl">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="flex items-center gap-2 text-xl font-bold text-foreground">
                <AlertTriangle className="h-5 w-5 text-red-400" />
                Alertas de Estudiantes en Riesgo
              </h2>
              <div className="flex items-center gap-4">
                <select
                  value={filtroRiesgo}
                  onChange={(e) => setFiltroRiesgo(e.target.value)}
                  className="rounded-md border border-primary/20 bg-background px-3 py-1.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                >
                  <option value="TODOS">Todos los niveles</option>
                  <option value="ALTO">Riesgo Alto</option>
                  <option value="MEDIO">Riesgo Medio</option>
                  <option value="BAJO">Riesgo Bajo</option>
                </select>
                <span className="text-sm text-foreground/70">{alerts.length} alertas activas</span>
              </div>
            </div>

            <div className="space-y-3">
              {loadingAlerts ? (
                <p className="text-sm text-foreground/50 text-center py-4">Conectando con Supabase...</p>
              ) : alerts.length === 0 ? (
                <p className="text-sm text-foreground/50 text-center py-4">No hay alertas registradas en la base de datos.</p>
              ) : alerts
                  .filter((alert: any) => filtroRiesgo === 'TODOS' || alert.nivel_riesgo?.toUpperCase() === filtroRiesgo)
                  .map((alert: any) => {
                    const studentName = alert.estudiantes?.nombre || 'Estudiante no registrado'
                    const riskLabel = alert.nivel_riesgo?.toUpperCase() || 'BAJO'
                    let riskColorClass = 'border-green-500/20 bg-green-500/10 text-green-400'
                    if (riskLabel === 'ALTO') riskColorClass = 'border-red-500/20 bg-red-500/10 text-red-400'
                    else if (riskLabel === 'MEDIO') riskColorClass = 'border-yellow-500/20 bg-yellow-500/10 text-yellow-400'

                    return (
                      <div key={alert.id} className="rounded-lg border border-primary/20 bg-background/30 p-4 hover:bg-primary/5 transition-colors">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3">
                              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-500/20">
                                <AlertTriangle className="h-5 w-5 text-red-400" />
                              </div>
                              <div>
                                <p className="font-semibold text-foreground">{studentName}</p>
                                <p className="text-xs text-foreground/60">{alert.mensaje}</p>
                                <p className="mt-1 text-xs text-yellow-400">{alert.recomendacion}</p>
                              </div>
                            </div>
                          </div>
                          <div className={`rounded-full border px-3 py-1 text-xs font-semibold ${riskColorClass}`}>
                            {riskLabel}
                          </div>
                        </div>
                      </div>
                    )
                  })}
            </div>
          </div>
        )}

        {/* TAB 2: SOLICITUDES DE TUTORÍA */}
        {activeTab === 'solicitudes' && (
          <div className="rounded-2xl border border-primary/20 bg-card/40 p-8 backdrop-blur-xl">
            <h2 className="mb-6 flex items-center gap-2 text-xl font-bold text-foreground">
              <MessageSquare className="h-5 w-5 text-secondary" />
              Solicitudes de Tutoría
            </h2>

            {requests.length === 0 ? (
              <p className="text-sm text-foreground/50 text-center py-8">No hay solicitudes registradas aún.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-primary/20">
                      <th className="px-4 py-3 text-left font-semibold text-foreground">Estudiante</th>
                      <th className="px-4 py-3 text-left font-semibold text-foreground">Motivo</th>
                      <th className="px-4 py-3 text-left font-semibold text-foreground">Urgencia</th>
                      <th className="px-4 py-3 text-left font-semibold text-foreground">Contacto</th>
                      <th className="px-4 py-3 text-left font-semibold text-foreground">Modalidad</th>
                      <th className="px-4 py-3 text-left font-semibold text-foreground">Estado</th>
                      <th className="px-4 py-3 text-left font-semibold text-foreground">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {requests.map((request) => (
                      <tr key={request.id} className="border-b border-primary/10 hover:bg-primary/5 transition-colors">
                        <td className="px-4 py-3">
                          <p className="font-medium text-foreground">
                            {request.estudiantes?.nombre || `Estudiante #${request.estudiante_id}`}
                          </p>
                          {request.estudiantes?.carrera && (
                            <p className="text-xs text-foreground/50">{request.estudiantes.carrera}</p>
                          )}
                        </td>
                        <td className="px-4 py-3 text-foreground/70 max-w-[180px]">
                          <p className="truncate">{request.motivo}</p>
                          {request.tipo_ayuda && (
                            <p className="text-xs text-primary/70">{request.tipo_ayuda}</p>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`font-semibold ${getUrgenciaBadge(request.urgencia)}`}>
                            {request.urgencia || '—'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-foreground/70">
                          <p>📞 {request.telefono || '—'}</p>
                          {request.estudiantes?.correo && (
                            <p className="text-xs text-foreground/50">{request.estudiantes.correo}</p>
                          )}
                        </td>
                        <td className="px-4 py-3 text-foreground/70">{request.modalidad || '—'}</td>
                        <td className="px-4 py-3">
                          <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${getEstadoBadge(request.estado)}`}>
                            {request.estado || 'Pendiente'}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex flex-col gap-1">
                            {request.estado === 'Pendiente' && (
                              <Button variant="ghost" size="sm" className="text-green-500 hover:bg-green-500/10">
                                <CheckCircle className="mr-1 h-4 w-4" /> Aceptar
                              </Button>
                            )}
                            {request.telefono && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-green-600 hover:bg-green-500/10"
                                onClick={() => {
                                  const mensaje =
                                    `Hola 👋\n\n` +
                                    `He revisado tu solicitud de tutoría.\n\n` +
                                    `Motivo: ${request.motivo}\n` +
                                    `Urgencia: ${request.urgencia}\n` +
                                    `Modalidad: ${request.modalidad}\n\n` +
                                    `¿Podrías indicarme tu disponibilidad?`
                                  window.open(
                                    `https://wa.me/51${request.telefono}?text=${encodeURIComponent(mensaje)}`
                                  )
                                }}
                              >
                                <Phone className="mr-1 h-4 w-4" /> WhatsApp
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: SEGUIMIENTO ACADÉMICO */}
        {activeTab === 'seguimiento' && (
          <div className="grid gap-6 md:grid-cols-3">
            <div className="md:col-span-1 rounded-2xl border border-primary/20 bg-card/40 p-6 backdrop-blur-xl h-fit">
              <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                <Search className="h-5 w-5 text-primary" />
                Buscar Estudiante
              </h2>
              <div className="relative mb-4">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-foreground/40" />
                <input
                  type="text"
                  placeholder="Nombre o código alumno..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-md border border-primary/20 bg-background pl-9 pr-4 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
              <div className="space-y-2 max-h-[450px] overflow-y-auto pr-1">
                {loadingStudents ? (
                  <p className="text-xs text-foreground/40 text-center py-4">Sincronizando perfiles...</p>
                ) : filteredStudents.length === 0 ? (
                  <p className="text-xs text-foreground/40 text-center py-4">No se encontraron coincidencias.</p>
                ) : filteredStudents.map(student => (
                  <button
                    key={student.id}
                    onClick={() => setSelectedStudent(student)}
                    className={`w-full text-left p-3 rounded-lg border transition-all flex items-center justify-between ${
                      selectedStudent?.id === student.id
                        ? 'border-primary bg-primary/10'
                        : 'border-primary/10 bg-background/20 hover:bg-primary/5'
                    }`}
                  >
                    <div>
                      <p className="font-semibold text-sm text-foreground">{student.nombre}</p>
                      <p className="text-[11px] text-foreground/50">{student.carrera}</p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-foreground/40" />
                  </button>
                ))}
              </div>
            </div>

            <div className="md:col-span-2">
              {selectedStudent ? (
                <div className="rounded-2xl border border-primary/20 bg-card/40 p-6 backdrop-blur-xl space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-primary/10 pb-4">
                    <div>
                      <h3 className="text-2xl font-bold text-foreground">{selectedStudent.nombre}</h3>
                      <p className="text-xs text-foreground/60">Código: {selectedStudent.codigo} | Alumno USIL</p>
                    </div>
                    <div className={`rounded-full border px-4 py-1.5 text-xs font-bold ${
                      selectedStudent.riesgo === 'ALTO' ? 'border-red-500/20 bg-red-500/10 text-red-400' :
                      selectedStudent.riesgo === 'MEDIO' ? 'border-yellow-500/20 bg-yellow-500/10 text-yellow-400' :
                      'border-green-500/20 bg-green-500/10 text-green-400'
                    }`}>
                      RIESGO {selectedStudent.riesgo}
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="p-4 rounded-xl border border-primary/10 bg-background/20">
                      <h4 className="text-xs font-semibold uppercase text-primary mb-2 flex items-center gap-1.5">
                        <User className="h-3.5 w-3.5" /> Datos del Alumno
                      </h4>
                      <p className="text-sm text-foreground"><span className="text-foreground/40">Carrera:</span> {selectedStudent.carrera}</p>
                      <p className="text-sm text-foreground mt-1"><span className="text-foreground/40">Contacto:</span> {selectedStudent.correo}</p>
                    </div>
                    <div className="p-4 rounded-xl border border-primary/10 bg-background/20">
                      <h4 className="text-xs font-semibold uppercase text-secondary mb-2 flex items-center gap-1.5">
                        <BookOpen className="h-3.5 w-3.5" /> Situación Académica
                      </h4>
                      <p className="text-sm text-foreground"><span className="text-foreground/40">Promedio Ponderado:</span> {selectedStudent.promedio}</p>
                      <p className="text-sm text-foreground mt-1"><span className="text-foreground/40">Asistencia Registrada:</span> {selectedStudent.asistencia}%</p>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl border border-primary/10 bg-background/20">
                    <h4 className="text-xs font-semibold uppercase text-foreground/50 mb-4 flex items-center gap-1.5">
                      <Activity className="h-3.5 w-3.5" /> Indicadores de Control
                    </h4>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-foreground/60">Asistencia Mínima</span>
                          <span className="text-foreground font-medium">{selectedStudent.asistencia}% / 100%</span>
                        </div>
                        <div className="h-2 w-full rounded-full bg-primary/10">
                          <div
                            className={`h-2 rounded-full transition-all ${selectedStudent.asistencia < 70 ? 'bg-red-500' : 'bg-green-500'}`}
                            style={{ width: `${selectedStudent.asistencia}%` }}
                          />
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-foreground/60">Rendimiento Técnico</span>
                          <span className="text-foreground font-medium">Nota: {selectedStudent.promedio}</span>
                        </div>
                        <div className="h-2 w-full rounded-full bg-primary/10">
                          <div
                            className="h-2 rounded-full bg-blue-500"
                            style={{ width: `${(parseFloat(selectedStudent.promedio) / 20) * 100}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl border border-primary/10 bg-background/20">
                    <h4 className="text-xs font-semibold uppercase text-foreground/50 mb-3 flex items-center gap-1.5">
                      <FileText className="h-3.5 w-3.5" /> Historial de Intervenciones
                    </h4>
                    <div className="space-y-3">
                      {selectedStudent.historial.length === 0 ? (
                        <p className="text-xs text-foreground/40 italic py-2">No se registran bitácoras previas para este ciclo.</p>
                      ) : selectedStudent.historial.map((item: any, i: number) => (
                        <div key={i} className="border-l-2 border-primary/40 pl-3 py-1 bg-primary/5 rounded-r-md pr-2">
                          <p className="text-[10px] text-foreground/40 font-medium">{item.fecha} — Docente: {item.tutor}</p>
                          <p className="text-xs text-foreground/80 mt-0.5">{item.observacion}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="h-full min-h-[350px] flex flex-col items-center justify-center rounded-2xl border border-dashed border-primary/20 bg-card/20 p-6 text-center">
                  <Search className="h-8 w-8 text-foreground/20 mb-2" />
                  <p className="text-sm text-foreground/40 max-w-sm">
                    Selecciona un alumno de la lista para desplegar su ficha académica, porcentaje de asistencia e historial de intervenciones.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

      </div>
    </SidebarLayout>
  )
}

export default function TutorPage() {
  return (
    <Suspense fallback={<div className="flex h-screen items-center justify-center text-foreground/50">Cargando panel del tutor...</div>}>
      <TutorContent />
    </Suspense>
  )
}
