'use client'

import { useState } from 'react'
import {
  AlertTriangle,
  MessageSquare,
  TrendingDown,
  Calendar,
  Clock,
  CheckCircle,
} from 'lucide-react'
import { SidebarLayout } from '@/components/dashboard/sidebar-layout'
import { Button } from '@/components/ui/button'

interface StudentAlert {
  id: number
  nombre: string
  riesgo: 'HIGH' | 'MEDIUM' | 'LOW'
  razon: string
  fecha: string
}

interface TutoringRequest {
  id: number
  estudiante: string
  motivo: string
  fecha: string
  estado: 'pendiente' | 'aceptada' | 'completada'
}

export default function TutorPage() {
  const [alerts] = useState<StudentAlert[]>([
    { id: 1, nombre: 'Juan García', riesgo: 'HIGH', razon: 'Ausencias frecuentes', fecha: '2024-01-15' },
    { id: 2, nombre: 'María López', riesgo: 'MEDIUM', razon: 'Calificaciones bajas', fecha: '2024-01-14' },
    { id: 3, nombre: 'Carlos Rodríguez', riesgo: 'HIGH', razon: 'No asiste a clases', fecha: '2024-01-13' },
    { id: 4, nombre: 'Ana Martínez', riesgo: 'LOW', razon: 'Mejora académica', fecha: '2024-01-12' },
  ])

  const [requests] = useState<TutoringRequest[]>([
    { id: 1, estudiante: 'Pedro Sánchez', motivo: 'Ayuda en Matemáticas', fecha: '2024-01-15', estado: 'pendiente' },
    { id: 2, estudiante: 'Laura González', motivo: 'Orientación vocacional', fecha: '2024-01-14', estado: 'aceptada' },
    { id: 3, estudiante: 'Diego Fernández', motivo: 'Dificultades en algoritmos', fecha: '2024-01-10', estado: 'completada' },
  ])

  const getRiesgoColor = (riesgo: string) => {
    switch (riesgo) {
      case 'HIGH':
        return 'bg-red-500/20 text-red-400 border-red-500/20'
      case 'MEDIUM':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/20'
      case 'LOW':
        return 'bg-green-500/20 text-green-400 border-green-500/20'
      default:
        return ''
    }
  }

  const getEstadoBadge = (estado: string) => {
    switch (estado) {
      case 'pendiente':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/20'
      case 'aceptada':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/20'
      case 'completada':
        return 'bg-green-500/20 text-green-400 border-green-500/20'
      default:
        return ''
    }
  }

  const menuItems = [
    { label: 'Alertas de Estudiantes', href: '/dashboard/tutor', icon: <AlertTriangle className="h-5 w-5" /> },
    { label: 'Solicitudes de Tutoría', href: '/dashboard/tutor?tab=solicitudes', icon: <MessageSquare className="h-5 w-5" /> },
    { label: 'Seguimiento Académico', href: '/dashboard/tutor?tab=seguimiento', icon: <TrendingDown className="h-5 w-5" /> },
  ]

  return (
    <SidebarLayout role="tutor" menuItems={menuItems}>
      <div className="max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Panel de Tutor Académico</h1>
          <p className="text-foreground/70">Gestiona alertas de estudiantes y solicitudes de tutoría</p>
        </div>

        {/* KPI Cards */}
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: 'Alertas Activas', value: '4', color: 'bg-red-500/20 text-red-400' },
            { label: 'Solicitudes Pendientes', value: '1', color: 'bg-yellow-500/20 text-yellow-400' },
            { label: 'Tutoría Completadas', value: '3', color: 'bg-green-500/20 text-green-400' },
            { label: 'Estudiantes Monitoreados', value: '42', color: 'bg-primary/20 text-primary' },
          ].map((kpi, idx) => (
            <div key={idx} className={`rounded-xl border border-primary/20 bg-card/40 p-6 backdrop-blur-xl ${kpi.color}`}>
              <p className="text-sm font-medium text-foreground/70">{kpi.label}</p>
              <p className="mt-2 text-3xl font-bold">{kpi.value}</p>
            </div>
          ))}
        </div>

        {/* Alerts Section */}
        <div className="mb-8 rounded-2xl border border-primary/20 bg-card/40 p-8 backdrop-blur-xl">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-400" />
              Alertas de Estudiantes en Riesgo
            </h2>
            <span className="text-sm text-foreground/70">{alerts.length} alertas activas</span>
          </div>

          <div className="space-y-3">
            {alerts.map(alert => (
              <div key={alert.id} className="flex items-center justify-between rounded-lg border border-primary/20 bg-background/30 p-4 hover:bg-primary/5 transition-colors">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center">
                      <AlertTriangle className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">{alert.nombre}</p>
                      <p className="text-xs text-foreground/60">{alert.razon}</p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className={`rounded-full border px-3 py-1 text-xs font-semibold ${getRiesgoColor(alert.riesgo)}`}>
                    {alert.riesgo === 'HIGH' ? 'ALTO' : alert.riesgo === 'MEDIUM' ? 'MEDIO' : 'BAJO'}
                  </div>
                  <Button variant="ghost" size="sm" className="text-secondary hover:bg-secondary/10">
                    Contactar
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tutoring Requests Section */}
        <div className="rounded-2xl border border-primary/20 bg-card/40 p-8 backdrop-blur-xl">
          <h2 className="mb-6 text-xl font-bold text-foreground flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-secondary" />
            Solicitudes de Tutoría
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-primary/20">
                  <th className="px-4 py-3 text-left font-semibold text-foreground">Estudiante</th>
                  <th className="px-4 py-3 text-left font-semibold text-foreground">Motivo</th>
                  <th className="px-4 py-3 text-left font-semibold text-foreground">Fecha</th>
                  <th className="px-4 py-3 text-left font-semibold text-foreground">Estado</th>
                  <th className="px-4 py-3 text-left font-semibold text-foreground">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {requests.map(request => (
                  <tr key={request.id} className="border-b border-primary/10 hover:bg-primary/5 transition-colors">
                    <td className="px-4 py-3 text-foreground font-medium">{request.estudiante}</td>
                    <td className="px-4 py-3 text-foreground/70">{request.motivo}</td>
                    <td className="px-4 py-3 text-foreground/70 flex items-center gap-1">
                      <Clock className="h-4 w-4" /> {request.fecha}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${getEstadoBadge(request.estado)}`}>
                        {request.estado === 'pendiente' ? 'Pendiente' : request.estado === 'aceptada' ? 'Aceptada' : 'Completada'}
                      </span>
                    </td>
                    <td className="px-4 py-3 flex gap-2">
                      {request.estado === 'pendiente' && (
                        <>
                          <Button variant="ghost" size="sm" className="text-green-500 hover:bg-green-500/10">
                            <CheckCircle className="h-4 w-4 mr-1" /> Aceptar
                          </Button>
                        </>
                      )}
                      {request.estado === 'aceptada' && (
                        <Button variant="ghost" size="sm" className="text-blue-500 hover:bg-blue-500/10">
                          <Calendar className="h-4 w-4 mr-1" /> Agendar
                        </Button>
                      )}
                      {request.estado === 'completada' && (
                        <Button variant="ghost" size="sm" className="text-foreground/50" disabled>
                          Completada
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </SidebarLayout>
  )
}
