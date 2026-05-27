'use client'

import { useState } from 'react'
import {
  BarChart3,
  FileText,
  Users,
  TrendingUp,
  Heart,
  Brain,
  Target,
} from 'lucide-react'
import { SidebarLayout } from '@/components/dashboard/sidebar-layout'
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts'

interface InterviewFinding {
  estudiante: string
  problemas: string[]
  necesidades: string[]
  motivaciones: string[]
}

export default function CoordinadorPage() {
  const performanceData = [
    { name: 'Excelente', value: 15, fill: '#00d084' },
    { name: 'Bueno', value: 28, fill: '#00a8cc' },
    { name: 'Regular', value: 32, fill: '#ffb703' },
    { name: 'Deficiente', value: 25, fill: '#ef476f' },
  ]

  const riskData = [
    { carrera: 'Ing. Informática', alto: 8, medio: 12, bajo: 20 },
    { carrera: 'Administración', alto: 5, medio: 10, bajo: 22 },
    { carrera: 'Ing. Civil', alto: 10, medio: 15, bajo: 18 },
    { carrera: 'Psicología', alto: 3, medio: 8, bajo: 25 },
  ]

  const trendData = [
    { mes: 'Ene', estudiantes: 100, riesgo: 35 },
    { mes: 'Feb', estudiantes: 105, riesgo: 38 },
    { mes: 'Mar', estudiantes: 108, riesgo: 32 },
    { mes: 'Abr', estudiantes: 110, riesgo: 28 },
  ]

  const [findings] = useState<InterviewFinding[]>([
    {
      estudiante: 'Juan García',
      problemas: ['Dificultad en matemáticas', 'Falta de concentración', 'Problemas familiares'],
      necesidades: ['Apoyo académico', 'Orientación psicológica', 'Becas económicas'],
      motivaciones: ['Graduarse a tiempo', 'Mejorar promedio', 'Trabajar en su carrera'],
    },
    {
      estudiante: 'María López',
      problemas: ['Carga académica pesada', 'Gestión del tiempo', 'Ansiedad'],
      necesidades: ['Mentoría personalizada', 'Técnicas de estudio', 'Soporte emocional'],
      motivaciones: ['Excelencia académica', 'Continuar con postgrado', 'Liderazgo'],
    },
  ])

  const menuItems = [
    { label: 'Analítica Académica', href: '/dashboard/coordinador', icon: <BarChart3 className="h-5 w-5" /> },
    { label: 'Reportes', href: '/dashboard/coordinador?tab=reportes', icon: <FileText className="h-5 w-5" /> },
    { label: 'Hallazgos de Entrevistas', href: '/dashboard/coordinador?tab=hallazgos', icon: <Users className="h-5 w-5" /> },
  ]

  return (
    <SidebarLayout role="coordinador" menuItems={menuItems}>
      <div className="max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Panel de Coordinador Académico</h1>
          <p className="text-foreground/70">Analítica, reportes y hallazgos de entrevistas</p>
        </div>

        {/* KPI Cards */}
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: 'Tasa de Aprobación', value: '88%', color: 'bg-green-500/20 text-green-400' },
            { label: 'Estudiantes en Riesgo', value: '28%', color: 'bg-red-500/20 text-red-400' },
            { label: 'Promedio General', value: '3.42', color: 'bg-primary/20 text-primary' },
            { label: 'Deserción Evitada', value: '12', color: 'bg-secondary/20 text-secondary' },
          ].map((kpi, idx) => (
            <div key={idx} className={`rounded-xl border border-primary/20 bg-card/40 p-6 backdrop-blur-xl ${kpi.color}`}>
              <p className="text-sm font-medium text-foreground/70">{kpi.label}</p>
              <p className="mt-2 text-3xl font-bold">{kpi.value}</p>
            </div>
          ))}
        </div>

        {/* Charts Section */}
        <div className="mb-8 grid gap-6 lg:grid-cols-2">
          {/* Performance Distribution */}
          <div className="rounded-2xl border border-primary/20 bg-card/40 p-8 backdrop-blur-xl">
            <h3 className="mb-6 text-lg font-bold text-foreground">Distribución de Desempeño</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={performanceData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry) => `${entry.name} (${entry.value})`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {performanceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Risk Distribution by Career */}
          <div className="rounded-2xl border border-primary/20 bg-card/40 p-8 backdrop-blur-xl">
            <h3 className="mb-6 text-lg font-bold text-foreground">Riesgo por Carrera</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={riskData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,168,204,0.1)" />
                <XAxis dataKey="carrera" stroke="rgba(255,255,255,0.5)" style={{ fontSize: '12px' }} />
                <YAxis stroke="rgba(255,255,255,0.5)" style={{ fontSize: '12px' }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'rgba(12,20,69,0.8)', border: 'none', borderRadius: '8px' }}
                  labelStyle={{ color: '#fff' }}
                />
                <Legend />
                <Bar dataKey="alto" fill="#ef476f" name="Riesgo Alto" />
                <Bar dataKey="medio" fill="#ffb703" name="Riesgo Medio" />
                <Bar dataKey="bajo" fill="#00d084" name="Riesgo Bajo" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Trend Chart */}
        <div className="mb-8 rounded-2xl border border-primary/20 bg-card/40 p-8 backdrop-blur-xl">
          <h3 className="mb-6 text-lg font-bold text-foreground">Tendencia de Estudiantes en Riesgo</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,168,204,0.1)" />
              <XAxis dataKey="mes" stroke="rgba(255,255,255,0.5)" />
              <YAxis stroke="rgba(255,255,255,0.5)" />
              <Tooltip 
                contentStyle={{ backgroundColor: 'rgba(12,20,69,0.8)', border: 'none', borderRadius: '8px' }}
                labelStyle={{ color: '#fff' }}
              />
              <Legend />
              <Line type="monotone" dataKey="estudiantes" stroke="#00a8cc" strokeWidth={2} name="Total de Estudiantes" />
              <Line type="monotone" dataKey="riesgo" stroke="#ef476f" strokeWidth={2} name="En Riesgo" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Interview Findings */}
        <div className="rounded-2xl border border-primary/20 bg-card/40 p-8 backdrop-blur-xl">
          <h3 className="mb-6 text-lg font-bold text-foreground flex items-center gap-2">
            <Users className="h-5 w-5" />
            Hallazgos de Entrevistas (Empathy Map)
          </h3>

          <div className="space-y-8">
            {findings.map((finding, idx) => (
              <div key={idx} className="border-t border-primary/20 pt-6 first:border-t-0 first:pt-0">
                <h4 className="mb-6 text-lg font-semibold text-secondary">{finding.estudiante}</h4>

                <div className="grid gap-6 sm:grid-cols-3">
                  {/* Problemas */}
                  <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-4">
                    <div className="mb-3 flex items-center gap-2">
                      <Brain className="h-5 w-5 text-red-400" />
                      <h5 className="font-semibold text-foreground">Problemas</h5>
                    </div>
                    <ul className="space-y-2 text-sm text-foreground/80">
                      {finding.problemas.map((p, i) => (
                        <li key={i} className="flex gap-2">
                          <span className="mt-1 h-1.5 w-1.5 rounded-full bg-red-400 flex-shrink-0"></span>
                          {p}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Necesidades */}
                  <div className="rounded-xl border border-yellow-500/20 bg-yellow-500/10 p-4">
                    <div className="mb-3 flex items-center gap-2">
                      <Target className="h-5 w-5 text-yellow-400" />
                      <h5 className="font-semibold text-foreground">Necesidades</h5>
                    </div>
                    <ul className="space-y-2 text-sm text-foreground/80">
                      {finding.necesidades.map((n, i) => (
                        <li key={i} className="flex gap-2">
                          <span className="mt-1 h-1.5 w-1.5 rounded-full bg-yellow-400 flex-shrink-0"></span>
                          {n}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Motivaciones */}
                  <div className="rounded-xl border border-green-500/20 bg-green-500/10 p-4">
                    <div className="mb-3 flex items-center gap-2">
                      <Heart className="h-5 w-5 text-green-400" />
                      <h5 className="font-semibold text-foreground">Motivaciones</h5>
                    </div>
                    <ul className="space-y-2 text-sm text-foreground/80">
                      {finding.motivaciones.map((m, i) => (
                        <li key={i} className="flex gap-2">
                          <span className="mt-1 h-1.5 w-1.5 rounded-full bg-green-400 flex-shrink-0"></span>
                          {m}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </SidebarLayout>
  )
}
