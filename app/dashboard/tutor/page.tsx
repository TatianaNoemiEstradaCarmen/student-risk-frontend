'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import FormularioIntervencion from '@/components/tutor/FormularioIntervencion'
import HistorialIntervenciones from '@/components/tutor/HistorialIntervenciones' 
import SelectorEstadoAlerta from '@/components/tutor/SelectorEstadoAlerta' // 1. Componente importado (HU-12)

import {
  AlertTriangle,
  MessageSquare,
  TrendingDown,
  Calendar,
  CheckCircle,
  Search,
  ChevronRight,
  Activity,
  Phone,
  ShieldCheck,
  ShieldAlert,
  ShieldX,
} from 'lucide-react'

// API TUTORÍAS ALESSANDRO
import { getTutoringRequests } from '@/src/services/tutoringService'

import { SidebarLayout } from '@/components/dashboard/sidebar-layout'
import { Button } from '@/components/ui/button'

// IMPORTAR CLIENTE DE SUPABASE DE TATIANA
import { supabase } from '@/src/lib/supabase'
import { getStudents } from '@/src/data/students'
import { RiskCard } from '@/components/dashboard/risk-card'

function TutorContent() {
  const searchParams = useSearchParams()
  const router = useRouter() 

  const tabParam = searchParams.get('tab')
  const activeTab = tabParam || 'alertas'

  useEffect(() => {
    if (!tabParam) {
      router.replace('/dashboard/tutor?tab=alertas')
    }
  }, [tabParam, router])

  const [requests, setRequests] = useState<any[]>([])
  const [alerts, setAlerts] = useState<any[]>([])
  const [filtroRiesgo, setFiltroRiesgo] = useState('ALTO')
  const [loadingAlerts, setLoadingAlerts] = useState(true)

  const [searchQuery, setSearchQuery] = useState('')
  const [selectedStudent, setSelectedStudent] = useState<any>(null)
  const [studentsList, setStudentsList] = useState<any[]>([])
  const [loadingStudents, setLoadingStudents] = useState(false)
  
  const [refreshHistorial, setRefreshHistorial] = useState(0)

  // ─── Carga solicitudes desde Supabase (Aporte del equipo) ───
  useEffect(() => {
    async function fetchSolicitudes() {
      const { data, error } = await supabase
        .from('solicitudes_tutoria')
        .select(`
          id,
          motivo,
          urgencia,
          telefono,
          modalidad,
          estado,
          tipo_ayuda,
          fecha_solicitud,
          estudiantes:estudiante_id (
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
      } else if (error) {
        console.error('Error solicitudes:', error.message)
      }
    }
    fetchSolicitudes()
  }, [])

  // ─── Carga alertas desde Supabase (Combinado HU-12 + Aporte equipo) ───
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
          estado,
          fecha_alerta,
          estudiantes:estudiante_id (
            id,
            nombre,
            carrera,
            codigo
          )
        `)
        .order('fecha_alerta', { ascending: false })

      if (error) {
        console.error('Error alertas:', error.message, error.details, error.hint)
      }
      
      if (data && data.length > 0) {
        setAlerts(data)
      } else {
        setAlerts([])
      }
      setLoadingAlerts(false)
    }
    fetchAlertas()
  }, [])

  // ─── Carga estudiantes con motor de riesgo ───
  useEffect(() => {
    async function fetchEstudiantes() {
      setLoadingStudents(true)
      try {
        const data = await getStudents()
        setStudentsList(data || [])
      } catch (error) {
        console.error('Error estudiantes:', error)
        setStudentsList([])
      }
      setLoadingStudents(false)
    }
    fetchEstudiantes()
  }, [])

  const filteredStudents = studentsList.filter((student: any) => {
    const nombre = student.nombre || student.name || ''
    const codigo = student.codigo || ''
    const query = searchQuery.toLowerCase()
    return nombre.toLowerCase().includes(query) || codigo.toLowerCase().includes(query)
  })

  // Funciones combinadas de diseño
  const getRiskBadgeColor = (nivel: string) => {
    switch (nivel?.toUpperCase()) {
      case 'ALTO': return 'border-red-500/20 bg-red-500/10 text-red-400'
      case 'MEDIO': return 'border-yellow-500/20 bg-yellow-500/10 text-yellow-400'
      case 'BAJO': return 'border-green-500/20 bg-green-500/10 text-green-400'
      default: return 'border-gray-500/20 bg-gray-500/10 text-gray-400'
    }
  }

  const getRiskIcon = (nivel: string) => {
    switch (nivel?.toUpperCase()) {
      case 'ALTO': return <ShieldX className="h-5 w-5 text-red-400" />
      case 'MEDIO': return <ShieldAlert className="h-5 w-5 text-yellow-400" />
      default: return <ShieldCheck className="h-5 w-5 text-green-400" />
    }
  }

  const getEstadoBadge = (estado: string) => {
    switch (estado) {
      case 'pendiente': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/20'
      case 'aceptada': return 'bg-blue-500/20 text-blue-400 border-blue-500/20'
      case 'completada': return 'bg-green-500/20 text-green-400 border-green-500/20'
      default: return ''
    }
  }

  const menuItems = [
    { label: 'Alertas de Estudiantes', href: '/dashboard/tutor?tab=alertas', icon: <AlertTriangle className="h-5 w-5" /> },
    { label: 'Solicitudes de Tutoría', href: '/dashboard/tutor?tab=solicitudes', icon: <MessageSquare className="h-5 w-5" /> },
    { label: 'Seguimiento Académico', href: '/dashboard/tutor?tab=seguimiento', icon: <TrendingDown className="h-5 w-5" /> },
  ]

  if (!tabParam) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-6 w-6 animate-spin rounded-full border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <SidebarLayout role="tutor" menuItems={menuItems}>
      <div className="max-w-7xl">
        {/* HEADER */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Panel de Tutor Académico</h1>
          <p className="text-foreground/70">
            {activeTab === 'alertas' && 'Gestiona alertas críticas generadas desde los datos académicos reales'}
            {activeTab === 'solicitudes' && 'Revisa y agenda las citas solicitadas por los alumnos'}
            {activeTab === 'seguimiento' && 'Perfil integral de riesgo con factores y recomendaciones'}
          </p>
        </div>

        {/* ─── TAB: ALERTAS ─── */}
        {activeTab === 'alertas' && (
          <div className="rounded-2xl border border-primary/20 bg-card/40 p-6 backdrop-blur-xl">
            <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <h2 className="flex items-center gap-2 text-xl font-bold text-foreground">
                <AlertTriangle className="h-5 w-5 text-red-400" /> Alertas de Estudiantes en Riesgo
              </h2>
              <div className="flex items-center gap-4">
                <select value={filtroRiesgo} onChange={(e) => setFiltroRiesgo(e.target.value)} className="rounded-md border border-primary/20 bg-background px-3 py-1.5 text-sm text-foreground">
                  <option value="TODOS">Todas las alertas</option>
                  <option value="ALTO"> Riesgo Alto</option>
                  <option value="MEDIO"> Riesgo Medio</option>
                </select>
                <span className="text-sm text-foreground/70">{alerts.length} alertas</span>
              </div>
            </div>

            {loadingAlerts ? (
              <div className="flex justify-center py-12">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary/20 border-t-primary" />
              </div>
            ) : alerts.length === 0 ? (
              <div className="text-center py-12">
                <AlertTriangle className="h-12 w-12 text-foreground/20 mx-auto mb-3" />
                <p className="text-foreground/50 text-sm">No hay alertas registradas en la base de datos.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {alerts
                  .filter((a) => filtroRiesgo === 'TODOS' || a.nivel_riesgo?.toUpperCase() === filtroRiesgo)
                  .map((alert) => {
                    const student = alert.estudiantes
                    const studentName = student?.nombre || 'Sin nombre'
                    const studentCareer = student?.carrera || ''
                    const studentCode = student?.codigo || ''
                    const riskLabel = alert.nivel_riesgo?.toUpperCase() || 'BAJO'

                    return (
                      <div key={alert.id} className="rounded-xl border border-primary/20 bg-background/30 p-5 hover:bg-primary/5 transition-colors">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-start gap-4 flex-1 min-w-0">
                            <div className={`flex h-12 w-12 items-center justify-center rounded-full flex-shrink-0 ${riskLabel === 'ALTO' ? 'bg-red-500/20' : riskLabel === 'MEDIO' ? 'bg-yellow-500/20' : 'bg-green-500/20'}`}>
                              {getRiskIcon(riskLabel)}
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <p className="font-bold text-foreground text-lg">{studentName}</p>
                                {studentCode && <span className="text-xs text-foreground/40 bg-primary/5 px-2 py-0.5 rounded">{studentCode}</span>}
                              </div>
                              {studentCareer && <p className="text-xs text-foreground/40 mt-0.5">{studentCareer}</p>}
                              <p className="text-sm text-foreground/70 mt-2 leading-relaxed">{alert.mensaje}</p>
                              <div className="mt-2 flex items-start gap-1.5">
                                <span className="text-yellow-400 mt-0.5">💡</span>
                                <p className="text-xs text-yellow-400 font-medium">{alert.recomendacion}</p>
                              </div>
                            </div>
                          </div>
                          
                          {/* Integración del SelectorEstadoAlerta (HU-12) */}
                          <div className="flex flex-col items-end gap-2">
                            <div className={`rounded-full border px-4 py-1.5 text-xs font-bold whitespace-nowrap flex-shrink-0 ${getRiskBadgeColor(riskLabel)}`}>
                              {riskLabel === 'ALTO' ? 'Alto' : riskLabel === 'MEDIO' ? 'Medio' : 'Bajo'}
                            </div>
                            <SelectorEstadoAlerta 
                              alertaId={alert.id} 
                              estadoInicial={alert.estado} 
                              onActualizado={() => window.location.reload()} 
                            />
                          </div>
                        </div>
                      </div>
                    )
                  })}
              </div>
            )}
          </div>
        )}

        {/* ─── TAB: SOLICITUDES ─── */}
        {activeTab === 'solicitudes' && (
          <div className="rounded-2xl border border-primary/20 bg-card/40 p-6 backdrop-blur-xl">
            <h2 className="mb-6 flex items-center gap-2 text-xl font-bold text-foreground">
              <MessageSquare className="h-5 w-5 text-secondary" /> Solicitudes de Tutoría
            </h2>

            {requests.length === 0 ? (
              <div className="text-center py-12">
                <MessageSquare className="h-12 w-12 text-foreground/20 mx-auto mb-3" />
                <p className="text-foreground/50 text-sm">No hay solicitudes registradas.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-primary/20">
                      <th className="px-4 py-3 text-left font-semibold">Estudiante</th>
                      <th className="px-4 py-3 text-left font-semibold">Motivo</th>
                      <th className="px-4 py-3 text-left font-semibold">Urgencia</th>
                      <th className="px-4 py-3 text-left font-semibold">Contacto</th>
                      <th className="px-4 py-3 text-left font-semibold">Estado</th>
                      <th className="px-4 py-3 text-left font-semibold">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {requests.map((req) => {
                      const student = req.estudiantes
                      return (
                        <tr key={req.id} className="border-b border-primary/10 hover:bg-primary/5">
                          <td className="px-4 py-3">
                            <p className="font-medium">{student?.nombre || `ID: ${req.estudiante_id}`}</p>
                            {student?.carrera && <p className="text-xs text-foreground/50">{student.carrera}</p>}
                          </td>
                          <td className="px-4 py-3 text-foreground/70 max-w-[180px] truncate">{req.motivo || '—'}</td>
                          <td className="px-4 py-3">
                            <span className={`font-semibold text-xs ${req.urgencia?.toLowerCase() === 'alta' ? 'text-red-400' : req.urgencia?.toLowerCase() === 'media' ? 'text-yellow-400' : 'text-green-400'}`}>
                              {req.urgencia || '—'}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-foreground/70 text-xs">
                            {req.telefono && <p>📞 {req.telefono}</p>}
                            {student?.correo && <p className="text-foreground/50">{student.correo}</p>}
                          </td>
                          <td className="px-4 py-3">
                            <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${req.estado?.toLowerCase() === 'pendiente' ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/20' : req.estado?.toLowerCase() === 'completada' ? 'bg-green-500/20 text-green-400 border-green-500/20' : 'bg-blue-500/20 text-blue-400 border-blue-500/20'}`}>
                              {req.estado || 'Pendiente'}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex flex-col gap-1">
                              {req.estado === 'Pendiente' && (
                                <Button variant="ghost" size="sm" className="text-green-500 hover:bg-green-500/10">
                                  <CheckCircle className="mr-1 h-4 w-4" /> Aceptar
                                </Button>
                              )}
                              {req.telefono && (
                                <Button
                                  variant="ghost" size="sm" className="text-green-600 hover:bg-green-500/10"
                                  onClick={() => { window.open(`https://wa.me/51${req.telefono}?text=${encodeURIComponent(`Hola, revisé tu solicitud de tutoría.\nMotivo: ${req.motivo}\n¿Podrías indicarme tu disponibilidad?`)}`) }}
                                >
                                  <Phone className="mr-1 h-4 w-4" /> WhatsApp
                                </Button>
                              )}
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ─── TAB: SEGUIMIENTO ─── */}
        {activeTab === 'seguimiento' && (
          <div className="grid gap-6 md:grid-cols-3">
            <div className="md:col-span-1 rounded-2xl border border-primary/20 bg-card/40 p-6 backdrop-blur-xl h-fit">
              <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                <Search className="h-5 w-5 text-primary" /> Buscar Estudiante
              </h2>
              <div className="relative mb-4">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-foreground/40" />
                <input
                  type="text" placeholder="Nombre o código..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-md border border-primary/20 bg-background pl-9 pr-4 py-2 text-sm text-foreground"
                />
              </div>
              <div className="space-y-2 max-h-[450px] overflow-y-auto pr-1">
                {loadingStudents ? (
                  <p className="text-xs text-foreground/40 text-center py-4">Cargando...</p>
                ) : filteredStudents.length === 0 ? (
                  <p className="text-xs text-foreground/40 text-center py-4">Sin resultados</p>
                ) : (
                  filteredStudents.map((student: any) => {
                    const riskLevel = student.risk || 'LOW'
                    const dotColor = riskLevel === 'HIGH' ? 'bg-red-500' : riskLevel === 'MEDIUM' ? 'bg-yellow-500' : 'bg-green-500'
                    const textColor = riskLevel === 'HIGH' ? 'text-red-400' : riskLevel === 'MEDIUM' ? 'text-yellow-400' : 'text-green-400'

                    return (
                      <button
                        key={student.id} onClick={() => setSelectedStudent(student)}
                        className={`w-full text-left p-3 rounded-lg border transition-all ${selectedStudent?.id === student.id ? 'border-primary bg-primary/10' : 'border-primary/10 bg-background/20 hover:bg-primary/5'}`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-sm truncate">{student.nombre || student.name || 'Sin nombre'}</p>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-[10px] text-foreground/40">{student.codigo || '—'}</span>
                              <span className={`h-1.5 w-1.5 rounded-full ${dotColor}`} />
                              <span className={`text-[10px] font-medium ${textColor}`}>
                                {riskLevel === 'HIGH' ? 'Alto' : riskLevel === 'MEDIUM' ? 'Medio' : 'Bajo'}
                              </span>
                            </div>
                          </div>
                          <ChevronRight className="h-4 w-4 text-foreground/40 flex-shrink-0" />
                        </div>
                      </button>
                    )
                  })
                )}
              </div>
            </div>

            <div className="md:col-span-2">
              {selectedStudent ? (
                <div className="rounded-2xl border border-primary/20 bg-card/40 p-6 backdrop-blur-xl space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-primary/10 pb-4">
                    <div>
                      <h3 className="text-2xl font-bold text-foreground">{selectedStudent.nombre || selectedStudent.name || 'Sin nombre'}</h3>
                      <p className="text-xs text-foreground/60">Código: {selectedStudent.codigo || '—'} | {selectedStudent.carrera || 'Sin carrera'}</p>
                    </div>
                    <div className={`rounded-full border px-4 py-1.5 text-xs font-bold ${getRiskBadgeColor(selectedStudent.risk || 'LOW')}`}>
                      RIESGO {selectedStudent.risk === 'HIGH' ? 'ALTO' : selectedStudent.risk === 'MEDIUM' ? 'MEDIO' : 'BAJO'}
                    </div>
                  </div>

                  {/* Tarjeta de Riesgo Visual (Aporte del equipo) */}
                  {selectedStudent.riskScore != null && (
                    <RiskCard
                      risk={selectedStudent.risk || 'LOW'}
                      riskScore={selectedStudent.riskScore}
                      components={selectedStudent.riskComponents}
                      factors={selectedStudent.riskFactors || []}
                      explanation={selectedStudent.riskExplanation}
                      recommendation={selectedStudent.recommendation}
                    />
                  )}

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="p-4 rounded-xl border border-primary/10 bg-background/20">
                      <p className="text-sm"><span className="text-foreground/40">Promedio:</span> {selectedStudent.gpa != null ? `${selectedStudent.gpa}/20` : '—'}</p>
                      <p className="text-sm mt-1"><span className="text-foreground/40">Asistencia:</span> {selectedStudent.attendance != null ? `${selectedStudent.attendance}%` : '—'}</p>
                      <p className="text-sm mt-1"><span className="text-foreground/40">Cursos desaprobados:</span> {selectedStudent.cursosDesaprobados ?? '—'}</p>
                    </div>
                    <div className="p-4 rounded-xl border border-primary/10 bg-background/20">
                      <p className="text-sm"><span className="text-foreground/40">Carrera:</span> {selectedStudent.carrera || '—'}</p>
                      <p className="text-sm mt-1"><span className="text-foreground/40">Ciclo:</span> {selectedStudent.ciclo || '—'}</p>
                      <p className="text-sm mt-1"><span className="text-foreground/40">Correo:</span> {selectedStudent.correo || '—'}</p>
                    </div>
                  </div>

                  {/* Tus componentes de la HU-10 y HU-11 integrados con la vista mejorada */}
                  <HistorialIntervenciones 
                    estudianteId={selectedStudent.id} 
                    refreshKey={refreshHistorial} 
                  />

                  <FormularioIntervencion 
                    estudianteId={selectedStudent.id} 
                    nombreEstudiante={selectedStudent.nombre || selectedStudent.name}
                    onGuardado={() => setRefreshHistorial(prev => prev + 1)} 
                  />

                </div>
              ) : (
                <div className="h-full min-h-[350px] flex flex-col items-center justify-center rounded-2xl border border-dashed border-primary/20 bg-card/20 p-6 text-center">
                  <Search className="h-8 w-8 text-foreground/20 mb-2" />
                  <p className="text-sm text-foreground/40">Selecciona un alumno para ver su perfil de riesgo y registrar intervenciones.</p>
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