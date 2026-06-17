'use client'

import { useState, useEffect } from 'react'
import { Search, Filter, Users } from 'lucide-react'
import { getStudents } from '@/src/data/students'
import { RiskCard } from '@/components/dashboard/risk-card'

export default function EstudiantesPage() {
  const [students, setStudents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    async function loadStudents() {
      setLoading(true)
      try {
        const data = await getStudents()
        setStudents(data)
      } catch (error) {
        console.error('Error cargando estudiantes:', error)
        setStudents([])
      }
      setLoading(false)
    }
    loadStudents()
  }, [])

  const filteredStudents = students.filter((student) => {
    const nombre = student.nombre || student.name || ''
    const codigo = student.codigo || ''
    const correo = student.correo || ''
    const carrera = student.carrera || ''
    const query = searchTerm.toLowerCase()

    return (
      nombre.toLowerCase().includes(query) ||
      codigo.toLowerCase().includes(query) ||
      correo.toLowerCase().includes(query) ||
      carrera.toLowerCase().includes(query)
    )
  })

  // Estadísticas rápidas
  const totalEstudiantes = students.length
  const estudiantesAltoRiesgo = students.filter(
    (s) => s.risk === 'HIGH'
  ).length
  const estudiantesMedioRiesgo = students.filter(
    (s) => s.risk === 'MEDIUM'
  ).length
  const estudiantesBajoRiesgo = students.filter(
    (s) => s.risk === 'LOW'
  ).length

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary/20 border-t-primary" />
          <p className="text-sm text-foreground/50">Cargando estudiantes desde Supabase...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Estudiantes</h1>
        <p className="text-muted-foreground mt-1">
          Gestiona y monitorea a todos tus estudiantes
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-primary/20 bg-card/40 p-4 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-primary/10 p-2">
              <Users className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{totalEstudiantes}</p>
              <p className="text-xs text-foreground/50">Total Estudiantes</p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-4 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-red-500/10 p-2">
              <div className="h-5 w-5 rounded-full bg-red-500/30 flex items-center justify-center">
                <span className="text-[10px] font-bold text-red-400">!</span>
              </div>
            </div>
            <div>
              <p className="text-2xl font-bold text-red-400">{estudiantesAltoRiesgo}</p>
              <p className="text-xs text-red-400/60">Riesgo Alto</p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-yellow-500/20 bg-yellow-500/5 p-4 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-yellow-500/10 p-2">
              <div className="h-5 w-5 rounded-full bg-yellow-500/30 flex items-center justify-center">
                <span className="text-[10px] font-bold text-yellow-400">~</span>
              </div>
            </div>
            <div>
              <p className="text-2xl font-bold text-yellow-400">{estudiantesMedioRiesgo}</p>
              <p className="text-xs text-yellow-400/60">Riesgo Medio</p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-green-500/20 bg-green-500/5 p-4 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-green-500/10 p-2">
              <div className="h-5 w-5 rounded-full bg-green-500/30 flex items-center justify-center">
                <span className="text-[10px] font-bold text-green-400">✓</span>
              </div>
            </div>
            <div>
              <p className="text-2xl font-bold text-green-400">{estudiantesBajoRiesgo}</p>
              <p className="text-xs text-green-400/60">Riesgo Bajo</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabla de Estudiantes */}
      <div className="bg-card border border-border rounded-xl p-6 backdrop-blur-sm">
        <div className="flex flex-col gap-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Buscar por nombre, código o carrera..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-input border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/50"
              />
            </div>
          </div>
        </div>

        {filteredStudents.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Users className="h-12 w-12 text-foreground/20 mb-3" />
            <p className="text-sm text-foreground/50">
              {searchTerm
                ? 'No se encontraron estudiantes con ese criterio de búsqueda.'
                : 'No hay estudiantes registrados en la base de datos.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 font-semibold text-muted-foreground text-sm">
                    Nombre
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-muted-foreground text-sm">
                    Código
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-muted-foreground text-sm">
                    Carrera
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-muted-foreground text-sm">
                    Ciclo
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-muted-foreground text-sm">
                    Correo
                  </th>
                  <th className="text-center py-3 px-4 font-semibold text-muted-foreground text-sm">
                    Evaluación de Riesgo
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map((student) => (
                  <tr
                    key={student.id}
                    className="border-b border-border/50 hover:bg-primary/5 transition-colors"
                  >
                    <td className="py-3 px-4">
                      <p className="text-foreground font-medium text-sm">
                        {student.nombre || student.name || '—'}
                      </p>
                    </td>
                    <td className="py-3 px-4">
                      <p className="text-muted-foreground text-sm">
                        {student.codigo || '—'}
                      </p>
                    </td>
                    <td className="py-3 px-4">
                      <p className="text-muted-foreground text-sm">
                        {student.carrera || '—'}
                      </p>
                    </td>
                    <td className="py-3 px-4">
                      <p className="text-muted-foreground text-sm">
                        {student.ciclo || '—'}
                      </p>
                    </td>
                    <td className="py-3 px-4">
                      <p className="text-muted-foreground text-xs">
                        {student.correo || '—'}
                      </p>
                    </td>
                    <td className="py-3 px-4">
                      <RiskCard
                        risk={student.risk || 'LOW'}
                        riskScore={student.riskScore || 0}
                        components={student.riskComponents}
                        factors={student.riskFactors || []}
                        explanation={student.riskExplanation}
                        recommendation={student.recommendation}
                        compact
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}