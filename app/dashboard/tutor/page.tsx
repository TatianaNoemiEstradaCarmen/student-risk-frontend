'use client'

import { useState, useEffect } from 'react'

import {
  AlertTriangle,
  MessageSquare,
  TrendingDown,
  Calendar,
  Clock,
  CheckCircle,
  Info,
} from 'lucide-react'

// Fuente única de datos: misma que consume la vista de administrador (HU-07).
// El módulo src/data/students.js envuelve src/api/studentsApi.js, así que
// cuando se conecte la base de datos, ambas vistas se mantendrán sincronizadas.
import { alerts, students, riskStats } from '@/src/data/students'

// API TUTORÍAS ALESSANDRO
import { getTutoringRequests } from '@/src/services/tutoringService'

import { SidebarLayout } from '@/components/dashboard/sidebar-layout'
import { calculateRisk } from '@/src/services/riskEngine'
import { Button } from '@/components/ui/button'

export default function TutorPage() {
  // SOLICITUDES DE TUTORÍA
  const [requests, setRequests] = useState<any[]>([])

  useEffect(() => {
    const savedRequests = localStorage.getItem('tutoringRequests')

    if (savedRequests) {
      setRequests(JSON.parse(savedRequests))
    } else {
      const data = getTutoringRequests()
      setRequests(data)
    }
  }, [])

  // COLORES DE ESTADO
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

  // Color de severidad para los chips de factores (HU-07)
  const factorSeverityClass = (sev: string) =>
    sev === 'high'
      ? 'bg-red-500/20 text-red-300 border-red-500/30'
      : sev === 'medium'
        ? 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30'
        : 'bg-primary/20 text-primary border-primary/30'

  const menuItems = [
    {
      label: 'Alertas de Estudiantes',
      href: '/dashboard/tutor',
      icon: <AlertTriangle className="h-5 w-5" />,
    },
    {
      label: 'Solicitudes de Tutoría',
      href: '/dashboard/tutor?tab=solicitudes',
      icon: <MessageSquare className="h-5 w-5" />,
    },
    {
      label: 'Seguimiento Académico',
      href: '/dashboard/tutor?tab=seguimiento',
      icon: <TrendingDown className="h-5 w-5" />,
    },
  ]

  return (
    <SidebarLayout role="tutor" menuItems={menuItems}>
      <div className="max-w-7xl">
        {/* HEADER */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">
            Panel de Tutor Académico
          </h1>
          <p className="text-foreground/70">
            Gestiona alertas de estudiantes y solicitudes de tutoría
          </p>
        </div>

        {/* KPI CARDS */}
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              label: 'Alertas Activas',
              value: alerts.length,
              color: 'bg-red-500/20 text-red-400',
            },
            {
              label: 'Solicitudes Pendientes',
              value: requests.filter((r) => r.estado === 'Pendiente').length,
              color: 'bg-yellow-500/20 text-yellow-400',
            },
            {
              label: 'Tutorías Registradas',
              value: requests.length,
              color: 'bg-green-500/20 text-green-400',
            },
            {
              label: 'Estudiantes Monitoreados',
              value: riskStats.total ?? students.length,
              color: 'bg-primary/20 text-primary',
            },
          ].map((kpi, idx) => (
            <div
              key={idx}
              className={`rounded-xl border border-primary/20 bg-card/40 p-6 backdrop-blur-xl ${kpi.color}`}
            >
              <p className="text-sm font-medium text-foreground/70">
                {kpi.label}
              </p>
              <p className="mt-2 text-3xl font-bold">
                {kpi.value}
              </p>
            </div>
          ))}
        </div>

        {/* ALERTAS IA — HU-07: Factores que influyen en el riesgo */}
        <div className="mb-8 rounded-2xl border border-primary/20 bg-card/40 p-8 backdrop-blur-xl">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-xl font-bold text-foreground">
              <AlertTriangle className="h-5 w-5 text-red-400" />
              Alertas de Estudiantes en Riesgo
            </h2>
            <span className="text-sm text-foreground/70">
              {alerts.length} alertas activas
            </span>
          </div>

          {alerts.length === 0 ? (
            <div className="rounded-lg border border-green-500/20 bg-green-500/10 p-6 text-center">
              <CheckCircle className="mx-auto mb-2 h-8 w-8 text-green-400" />
              <p className="text-sm text-green-300">
                No hay estudiantes en riesgo alto. Los datos de
                {' '}{students.length} estudiantes fueron analizados.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {alerts.map((alert: any) => {
                // La alerta ya viene pre-procesada desde src/data/students.js
                // (HU-05 + HU-07: cada alerta incluye los factores que la
                // provocan y una explicación clara para el tutor).
                const comps: any = alert.components ?? {}
                const factors: any[] = alert.factors ?? []
                return (
                  <div
                    key={alert.id ?? alert.codigo ?? alert.student}
                    className="rounded-lg border border-primary/20 bg-background/30 p-4 hover:bg-primary/5 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-500/20">
                            <AlertTriangle className="h-5 w-5 text-red-400" />
                          </div>
                          <div>
                            <p className="font-semibold text-foreground">
                              {alert.student}
                            </p>
                            <p className="text-xs text-foreground/60">
                              {alert.carrera} · {alert.ciclo} · Cód. {alert.codigo}
                            </p>
                            <p className="text-xs text-foreground/60">
                              {alert.message}
                            </p>
                            <p className="mt-1 text-xs text-yellow-400">
                              {alert.recommendation}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <div className="rounded-full border border-red-500/20 bg-red-500/10 px-3 py-1 text-xs font-semibold text-red-400">
                          ALTO
                        </div>
                        <span className="text-xs text-foreground/60">
                          Score: {alert.riskScore?.toFixed(1)}
                        </span>
                      </div>
                    </div>

                    {/* Factores que influyen en el riesgo (HU-07) */}
                    {factors.length > 0 && (
                      <div className="mt-3 rounded-md border border-primary/10 bg-background/40 p-3">
                        <p className="mb-2 flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wide text-foreground/60">
                          <Info className="h-3 w-3" />
                          Factores que influyen en el riesgo
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {factors.map((f) => (
                            <span
                              key={f.key}
                              title={f.message}
                              className={`cursor-help rounded-full border px-2.5 py-1 text-[11px] font-medium ${factorSeverityClass(f.severity)}`}
                            >
                              {f.label}
                            </span>
                          ))}
                        </div>
                        {alert.explanation && (
                          <p className="mt-2 text-xs text-foreground/70">
                            {alert.explanation}
                          </p>
                        )}
                      </div>
                    )}

                    {/* Barra de desglose de componentes de riesgo (HU-05) */}
                    {comps.gpaScore != null && (
                      <div className="mt-3 grid grid-cols-4 gap-2">
                        {[
                          { label: 'Notas', score: comps.gpaScore, color: 'bg-red-500' },
                          { label: 'Asistencia', score: comps.attendanceScore, color: 'bg-yellow-500' },
                          { label: 'Desaprobados', score: comps.failedCoursesScore, color: 'bg-orange-500' },
                          { label: 'Progreso', score: comps.progressScore, color: 'bg-blue-500' },
                        ].map((item) => (
                          <div key={item.label} className="text-center">
                            <div className="h-1.5 w-full rounded-full bg-primary/10">
                              <div
                                className={`h-1.5 rounded-full ${item.color} transition-all`}
                                style={{ width: `${item.score}%` }}
                              />
                            </div>
                            <p className="mt-1 text-[10px] text-foreground/50">
                              {item.label} {item.score.toFixed(0)}%
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* TABLA SOLICITUDES */}
        <div className="rounded-2xl border border-primary/20 bg-card/40 p-8 backdrop-blur-xl">
          <h2 className="mb-6 flex items-center gap-2 text-xl font-bold text-foreground">
            <MessageSquare className="h-5 w-5 text-secondary" />
            Solicitudes de Tutoría
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-primary/20">
                  <th className="px-4 py-3 text-left font-semibold text-foreground">
                    Estudiante
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-foreground">
                    Motivo
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-foreground">
                    Estado
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-foreground">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody>
                {requests.map((request) => (
                  <tr
                    key={request.id}
                    className="border-b border-primary/10 hover:bg-primary/5 transition-colors"
                  >
                    <td className="px-4 py-3 font-medium text-foreground">
                      {request.estudiante}
                    </td>
                    <td className="px-4 py-3 text-foreground/70">
                      {request.motivo}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full border px-3 py-1 text-xs font-semibold ${getEstadoBadge(
                          request.estado.toLowerCase()
                        )}`}
                      >
                        {request.estado}
                      </span>
                    </td>
                    <td className="flex gap-2 px-4 py-3">
                      {request.estado === 'Pendiente' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-green-500 hover:bg-green-500/10"
                        >
                          <CheckCircle className="mr-1 h-4 w-4" />
                          Aceptar
                        </Button>
                      )}
                      {request.estado === 'Aceptada' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-blue-500 hover:bg-blue-500/10"
                        >
                          <Calendar className="mr-1 h-4 w-4" />
                          Agendar
                        </Button>
                      )}
                      {request.estado === 'Completada' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          disabled
                          className="text-foreground/50"
                        >
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
