'use client'

import { useState, useEffect } from 'react'

import {
  AlertTriangle,
  MessageSquare,
  TrendingDown,
  Calendar,
  Clock,
  CheckCircle,
} from 'lucide-react'

// ALERTAS IA MAURICIO
import { alerts } from '@/src/data/students'

// API TUTORÍAS ALESSANDRO
import { getTutoringRequests } from '@/src/services/tutoringService'

import { SidebarLayout } from '@/components/dashboard/sidebar-layout'
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
              value: '42',
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

        {/* ALERTAS IA */}
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

          <div className="space-y-3">
            {alerts.map((alert: any) => (
              <div
                key={alert.student}
                className="flex items-center justify-between rounded-lg border border-primary/20 bg-background/30 p-4 hover:bg-primary/5 transition-colors"
              >
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
                        {alert.message}
                      </p>
                      <p className="mt-1 text-xs text-yellow-400">
                        {alert.recommendation}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="rounded-full border border-red-500/20 bg-red-500/10 px-3 py-1 text-xs font-semibold text-red-400">
                  ALTO
                </div>
              </div>
            ))}
          </div>
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