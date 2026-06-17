'use client'

import { useState, useEffect } from 'react'
import {
  Users,
  BookOpen,
  Briefcase,
  Settings,
  UserCheck,
  BarChart3,
  Plus,
  Search,
  AlertCircle,
  CheckCircle,
  Pencil,
  Trash2,
  ShieldCheck,
  ShieldAlert,
  ShieldX,
} from 'lucide-react'
import { getStudents, refreshStudents } from '@/src/data/students'
import { getScholarships } from '@/src/services/scholarshipService'
import { calculateRisk } from '@/src/services/riskEngine'
import { SidebarLayout } from '@/components/dashboard/sidebar-layout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import ImportStudentsPanel from '@/components/admin/ImportStudentsPanel'
import { RiskCard } from '@/components/dashboard/risk-card'
import { RiskFactorsBadge } from '@/components/dashboard/risk-factors-badge'
import type { RiskFactor } from '@/components/dashboard/risk-factors-badge'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

import SupportProceduresPanel from '@/components/admin/SupportProceduresPanel'

export default function AdministradorPage() {
  const [tab, setTab] = useState<
    | 'estudiantes'
    | 'roles'
    | 'becas'
    | 'reportes'
    | 'hallazgos'
    | 'academico'
    | 'tramitesApoyo'
    | 'importacion'
  >('estudiantes')

  const [students, setStudents] = useState<any[]>([])
  const [userRoles, setUserRoles] = useState<any[]>([])
  const [scholarships, setScholarships] = useState<any[]>([])
  const [findings, setFindings] = useState<any[]>([])
  const [academicRecords, setAcademicRecords] = useState<any[]>([])

  const [searchQuery, setSearchQuery] = useState('')

  const [formData, setFormData] = useState({
    nombre: '',
    codigo: '',
    correo: '',
    ciclo: '',
    carrera: '',
  })

  const [errors, setErrors] = useState<{ [key: string]: string }>({})
  const [successMessage, setSuccessMessage] = useState('')

  const [scholarshipForm, setScholarshipForm] = useState({
    nombre: '',
    monto: '',
    requisitos: '',
  })

  const [editingScholarshipId, setEditingScholarshipId] = useState<number | null>(null)

  const [academicForm, setAcademicForm] = useState({
    estudiante: '',
    nota: '',
    asistencia: '',
    desaprobados: '',
  })

  const [editingAcademicId, setEditingAcademicId] = useState<number | null>(null)

  const [findingForm, setFindingForm] = useState({
    estudiante: '',
    problemas: '',
    necesidades: '',
    motivaciones: '',
  })

    // ─── Cargar datos desde Supabase ─────────────────────────────────────────
  useEffect(() => {
    const loadStudents = async () => {
      try {
        const fetched = await getStudents()
        setStudents(fetched)
      } catch (error) {
        console.error('Error cargando estudiantes desde Supabase:', error)
        setStudents([])
      }
    }
    loadStudents()
  }, [])

    useEffect(() => {
    const loadScholarships = async () => {
      try {
        const data = await getScholarships()
        setScholarships(data || [])
      } catch (error) {
        console.error('Error cargando becas:', error)
        setScholarships([])
      }
    }
    loadScholarships()
  }, [])

  // ─── Estudiantes ─────────────────────────────────────────────────────────

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleScholarshipInputChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = e.target

    setScholarshipForm(prev => ({
      ...prev,
      [name]: value,
    }))
  }

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {}
    if (!formData.nombre.trim()) newErrors.nombre = 'El nombre es requerido'
    if (!formData.codigo.trim()) newErrors.codigo = 'El código es requerido'
    if (!formData.correo.trim()) newErrors.correo = 'El correo es requerido'
    if (!formData.correo.includes('@')) newErrors.correo = 'Correo inválido'
    if (!formData.ciclo) newErrors.ciclo = 'El ciclo es requerido'
    if (!formData.carrera) newErrors.carrera = 'La carrera es requerida'
    setErrors(newErrors)

    return Object.keys(newErrors).length === 0
  }

  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return

    try {
      // Insertar en Supabase
      const supabase = (await import('@/src/lib/supabase')).supabase
      const { data, error } = await supabase
        .from('estudiantes')
        .insert({
          nombre: formData.nombre.trim(),
          codigo: formData.codigo.trim(),
          correo: formData.correo.trim(),
          ciclo: formData.ciclo,
          carrera: formData.carrera,
          estado_matricula: 'Activo',
          fecha_registro: new Date().toISOString().split('T')[0],
        })
        .select()
        .single()

      if (error) {
        console.error('Error al insertar estudiante:', error.message)
        setErrors({ general: `Error al guardar: ${error.message}` })
        return
      }

      // También insertar un registro académico vacío para que el join funcione
      if (data) {
        await supabase.from('registro_academico').insert({
          estudiante_id: data.id,
          nota: 0,
          asistencia: 0,
          cursos_desaprobados: 0,
          fecha_registro: new Date().toISOString().split('T')[0],
        })
      }

      // Recargar desde Supabase para tener datos frescos con riesgo calculado
      const refreshed = await refreshStudents()
      setStudents(refreshed)

      setFormData({ nombre: '', codigo: '', correo: '', ciclo: '', carrera: '' })
      setErrors({})
      setSuccessMessage('Estudiante agregado exitosamente')
      setTimeout(() => setSuccessMessage(''), 3000)
    } catch (err: any) {
      console.error('Error agregando estudiante:', err)
      setErrors({ general: 'Error inesperado al guardar el estudiante' })
    }
  }

  const filteredStudents = students.filter(s =>
    s.nombre?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.codigo?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.correo?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // ─── Becas ───────────────────────────────────────────────────────────────

  const handleAddScholarship = (e: React.FormEvent) => {
    e.preventDefault()

    if (editingScholarshipId !== null) {
      const updated = scholarships.map(s =>
        s.id === editingScholarshipId ? { ...s, ...scholarshipForm } : s
      )
      setScholarships(updated)
      localStorage.setItem('scholarships', JSON.stringify(updated))
      setEditingScholarshipId(null)
    } else {
      const newScholarship = { id: scholarships.length + 1, ...scholarshipForm }
      const updated = [...scholarships, newScholarship]
      setScholarships(updated)
      localStorage.setItem('scholarships', JSON.stringify(updated))
    }

    setScholarshipForm({ nombre: '', monto: '', requisitos: '' })
  }

  const handleEditScholarship = (id: number) => {
    const found = scholarships.find(s => s.id === id)
    if (!found) return
    setScholarshipForm({
      nombre: found.nombre,
      monto: found.monto,
      requisitos: found.requisitos,
    })
    setEditingScholarshipId(id)
  }

  const handleDeleteScholarship = (id: number) => {
    const updated = scholarships.filter(s => s.id !== id)
    setScholarships(updated)
    localStorage.setItem('scholarships', JSON.stringify(updated))
  }

  // ─── Hallazgos ───────────────────────────────────────────────────────────

  const handleFindingInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFindingForm(prev => ({ ...prev, [name]: value }))
  }

  const handleAddFinding = (e: React.FormEvent) => {
    e.preventDefault()
    const newFinding = { id: findings.length + 1, ...findingForm }
    const updated = [...findings, newFinding]
    setFindings(updated)
    localStorage.setItem('findings', JSON.stringify(updated))
    setFindingForm({ estudiante: '', problemas: '', necesidades: '', motivaciones: '' })
  }

  const handleDeleteFinding = (id: number) => {
    const updated = findings.filter(f => f.id !== id)
    setFindings(updated)
    localStorage.setItem('findings', JSON.stringify(updated))
  }

  // ─── Registro Académico ───────────────────────────────────────────────────

  const handleAcademicInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setAcademicForm(prev => ({ ...prev, [name]: value }))
  }

  const handleAddAcademicRecord = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const supabase = (await import('@/src/lib/supabase')).supabase
      const nota = parseFloat(academicForm.nota) || 0
      const asistencia = parseFloat(academicForm.asistencia) || 0
      const cursosDesaprobados = parseInt(academicForm.desaprobados) || 0

      // Buscar el estudiante por nombre para obtener su ID
      const { data: estudianteData, error: estudianteError } = await supabase
        .from('estudiantes')
        .select('id, nombre')
        .ilike('nombre', academicForm.estudiante.trim())
        .single()

      if (estudianteError || !estudianteData) {
        console.error('Estudiante no encontrado:', academicForm.estudiante)
        const newRecord = { id: Date.now(), ...academicForm }
        const updatedRecords = [...academicRecords, newRecord]
        setAcademicRecords(updatedRecords)
        localStorage.setItem('academicRecords', JSON.stringify(updatedRecords))
        setAcademicForm({ estudiante: '', nota: '', asistencia: '', desaprobados: '' })
        return
      }

      if (editingAcademicId !== null) {
        await supabase
          .from('registro_academico')
          .update({
            nota: nota,
            asistencia: asistencia,
            cursos_desaprobados: cursosDesaprobados,
            fecha_registro: new Date().toISOString().split('T')[0],
          })
          .eq('id', editingAcademicId)
        setEditingAcademicId(null)
      } else {
        await supabase
          .from('registro_academico')
          .insert({
            estudiante_id: estudianteData.id,
            nota: nota,
            asistencia: asistencia,
            cursos_desaprobados: cursosDesaprobados,
            fecha_registro: new Date().toISOString().split('T')[0],
          })
      }

      const assessment = calculateRisk({
        gpa: nota,
        attendance: asistencia,
        cursosDesaprobados: cursosDesaprobados,
      })

      await supabase
        .from('estudiantes')
        .update({
          riesgo: assessment.risk,
          puntaje_riesgo: assessment.riskScore,
          recomendacion: assessment.recommendation,
        })
        .eq('id', estudianteData.id)

      const refreshed = await refreshStudents()
      setStudents(refreshed)

      const newRecord = { id: Date.now(), ...academicForm }
      const updatedRecords = [...academicRecords, newRecord]
      setAcademicRecords(updatedRecords)
      localStorage.setItem('academicRecords', JSON.stringify(updatedRecords))

      setAcademicForm({ estudiante: '', nota: '', asistencia: '', desaprobados: '' })
    } catch (err: any) {
      console.error('Error guardando registro académico:', err)
    }
  }

  const handleEditAcademicRecord = (id: number) => {
    const found = academicRecords.find(r => r.id === id)
    if (!found) return
    setAcademicForm({
      estudiante: found.estudiante,
      nota: found.nota,
      asistencia: found.asistencia,
      desaprobados: found.desaprobados,
    })
    setEditingAcademicId(id)
  }

  const handleDeleteAcademicRecord = (id: number) => {
    const updated = academicRecords.filter(r => r.id !== id)
    setAcademicRecords(updated)
    localStorage.setItem('academicRecords', JSON.stringify(updated))
  }

  // ─── Roles ────────────────────────────────────────────────────────────────

  const handleAssignRole = (student: any, role: string) => {
    const updated = [
      ...userRoles.filter(item => item.id !== student.id),
      { id: student.id, nombre: student.nombre, role },
    ]
    setUserRoles(updated)
    localStorage.setItem('userRoles', JSON.stringify(updated))
  }

  // ─── Menú ─────────────────────────────────────────────────────────────────

  const menuItems = [
    { label: 'Gestión de Estudiantes', href: '/dashboard/administrador', icon: <Users className="h-5 w-5" /> },
    { label: 'Registro de Becas', href: '/dashboard/administrador?tab=becas', icon: <BookOpen className="h-5 w-5" /> },
    { label: 'Asignación de Roles', href: '/dashboard/administrador?tab=roles', icon: <UserCheck className="h-5 w-5" /> },
    { label: 'Oportunidades Laborales', href: '/dashboard/administrador/oportunidades', icon: <Briefcase className="h-5 w-5" /> },

    { label: 'Configuración', href: '/dashboard/administrador?tab=config', icon: <Settings className="h-5 w-5" /> },
    { label: 'Importar Datos', href: '/dashboard/administrador?tab=importacion', icon: <Plus className="h-5 w-5" />},
  ]

  const currentRole = userRoles[0]?.role || 'estudiante'

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <SidebarLayout role="administrador" menuItems={menuItems}>
      <div className="max-w-7xl">

        {/* Header */}

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">
            Panel de Administración
          </h1>

          <p className="text-foreground/70">
            Gestiona estudiantes, becas y asignación de roles
          </p>
        </div>

        <div className="mb-6 flex flex-wrap gap-2 border-b border-primary/20">
          {[
            { id: 'estudiantes', label: 'Gestión de Estudiantes' },
            { id: 'becas', label: 'Registro de Becas' },
            { id: 'roles', label: 'Asignación de Roles' },
            { id: 'hallazgos', label: 'Hallazgos Entrevistas' },
            { id: 'academico', label: 'Registro Académico' },
            { id: 'tramitesApoyo', label: 'Trámites de Apoyo' },
            { id: 'reportes', label: 'Reportes' },
          ].map(tabItem => (
            <button
              key={tabItem.id}
              onClick={() => setTab(tabItem.id as any)}
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

        {/* ── ESTUDIANTES ── */}
        {tab === 'estudiantes' && (
          <div className="space-y-6">
            <div className="rounded-2xl border border-primary/20 bg-card/40 p-8 backdrop-blur-xl">
              <h2 className="mb-6 text-xl font-bold text-foreground">Registrar Nuevo Estudiante</h2>

              {successMessage && (
                <div className="mb-6 flex items-center gap-3 rounded-lg border border-green-500/20 bg-green-500/10 p-4">
                  <CheckCircle className="h-5 w-5 text-green-500" />

                  <p className="text-sm text-green-500">
                    {successMessage}
                  </p>
                </div>
              )}

              <form
                onSubmit={handleAddStudent}
                className="space-y-5"
              >
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="nombre">Nombre Completo</Label>
                    <Input id="nombre" name="nombre" value={formData.nombre} onChange={handleInputChange} placeholder="Juan García" className="border-primary/20 bg-background/50" />
                    {errors.nombre && <p className="text-xs text-red-500 flex items-center gap-1"><AlertCircle className="h-3 w-3" /> {errors.nombre}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="codigo">Código de Estudiante</Label>
                    <Input id="codigo" name="codigo" value={formData.codigo} onChange={handleInputChange} placeholder="E001" className="border-primary/20 bg-background/50" />
                    {errors.codigo && <p className="text-xs text-red-500 flex items-center gap-1"><AlertCircle className="h-3 w-3" /> {errors.codigo}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="correo">Correo Institucional</Label>
                    <Input id="correo" name="correo" type="email" value={formData.correo} onChange={handleInputChange} placeholder="juan.garcia@uni.edu" className="border-primary/20 bg-background/50" />
                    {errors.correo && <p className="text-xs text-red-500 flex items-center gap-1"><AlertCircle className="h-3 w-3" /> {errors.correo}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="ciclo">Ciclo Académico</Label>
                    <Select value={formData.ciclo} onValueChange={v => handleSelectChange('ciclo', v)}>
                      <SelectTrigger className="border-primary/20 bg-background/50"><SelectValue placeholder="Selecciona ciclo" /></SelectTrigger>
                      <SelectContent>
                        {['I','II','III','IV','V','VI','VII','VIII','IX','X'].map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    {errors.ciclo && <p className="text-xs text-red-500 flex items-center gap-1"><AlertCircle className="h-3 w-3" /> {errors.ciclo}</p>}
                  </div>

                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="carrera">Carrera</Label>
                    <Select value={formData.carrera} onValueChange={v => handleSelectChange('carrera', v)}>
                      <SelectTrigger className="border-primary/20 bg-background/50"><SelectValue placeholder="Selecciona carrera" /></SelectTrigger>
                      <SelectContent>
                        {['Ingeniería Informática','Administración','Ingeniería Civil','Psicología','Contabilidad','Enfermería'].map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    {errors.carrera && <p className="text-xs text-red-500 flex items-center gap-1"><AlertCircle className="h-3 w-3" /> {errors.carrera}</p>}
                  </div>
                </div>

                <Button type="submit" className="w-full bg-gradient-to-r from-primary to-secondary">
                  <Plus className="mr-2 h-4 w-4" /> Agregar Estudiante
                </Button>
              </form>
            </div>

            <div className="rounded-2xl border border-primary/20 bg-card/40 p-8 backdrop-blur-xl">
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-xl font-bold text-foreground">
                  Estudiantes Registrados
                </h2>

                <div className="relative w-64">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground/50" />

                  <Input
                    placeholder="Buscar estudiante..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="border-primary/20 bg-background/50 pl-10"
                  />
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-primary/20">
                      <th className="px-4 py-3 text-left font-semibold text-foreground">Nombre</th>
                      <th className="px-4 py-3 text-left font-semibold text-foreground">Código</th>
                      <th className="px-4 py-3 text-left font-semibold text-foreground">Correo</th>
                      <th className="px-4 py-3 text-left font-semibold text-foreground">Ciclo</th>
                      <th className="px-4 py-3 text-left font-semibold text-foreground">Carrera</th>
                      <th className="px-4 py-3 text-left font-semibold text-foreground">Evaluación de Riesgo</th>
                      <th className="px-4 py-3 text-left font-semibold text-foreground">Acciones</th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredStudents.map(student => (
                      <tr key={student.id} className="border-b border-primary/10 hover:bg-primary/5 transition-colors">
                        <td className="px-4 py-3 text-foreground">{student.nombre || student.name}</td>
                        <td className="px-4 py-3 text-foreground/70">{student.codigo}</td>
                        <td className="px-4 py-3 text-foreground/70">{student.correo}</td>
                        <td className="px-4 py-3 text-foreground/70">{student.ciclo}</td>
                        <td className="px-4 py-3 text-foreground/70">{student.carrera}</td>
                        <td className="px-4 py-3">
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
                        <td className="px-4 py-3">
                          <div className="flex flex-col gap-1.5">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="text-secondary hover:bg-secondary/10"
                              onClick={async () => {
                                try {
                                  const supabase = (await import('@/src/lib/supabase')).supabase
                                  // Forzar actualización del puntaje_riesgo para disparar el trigger
                                  const { data: regData } = await supabase
                                    .from('registro_academico')
                                    .select('nota, asistencia, cursos_desaprobados')
                                    .eq('estudiante_id', student.id)
                                    .order('fecha_registro', { ascending: false })
                                    .limit(1)
                                    .single()
                                  
                                  if (regData) {
                                    const assessment = calculateRisk({
                                      gpa: regData.nota || 0,
                                      attendance: regData.asistencia || 0,
                                      cursosDesaprobados: regData.cursos_desaprobados || 0,
                                    })
                                    
                                    await supabase
                                      .from('estudiantes')
                                      .update({
                                        riesgo: assessment.risk,
                                        puntaje_riesgo: assessment.riskScore,
                                        recomendacion: assessment.recommendation,
                                      })
                                      .eq('id', student.id)
                                    
                                    const refreshed = await refreshStudents()
                                    setStudents(refreshed)
                                  }
                                } catch (err) {
                                  console.error('Error recalculando riesgo:', err)
                                }
                              }}
                            >
                              <ShieldCheck className="h-3.5 w-3.5 mr-1" /> Recalcular
                            </Button>
                            <Button variant="ghost" size="sm" className="text-secondary hover:bg-secondary/10">
                              <Pencil className="h-3.5 w-3.5 mr-1" /> Editar
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ── BECAS ── */}
        {tab === 'becas' && (
          <div className="space-y-6">
            <div className="rounded-2xl border border-primary/20 bg-card/40 p-8 backdrop-blur-xl">
              <h2 className="mb-6 text-xl font-bold text-foreground">Registrar Nueva Beca</h2>

              <form onSubmit={handleAddScholarship} className="space-y-5">
                <div className="space-y-2">
                  <Label>Nombre de la Beca</Label>
                  <Input name="nombre" value={scholarshipForm.nombre} onChange={handleScholarshipInputChange} placeholder="Beca Excelencia" />
                </div>
                <div className="space-y-2">
                  <Label>Monto</Label>
                  <Input name="monto" value={scholarshipForm.monto} onChange={handleScholarshipInputChange} placeholder="5000" />
                </div>
                <div className="space-y-2">
                  <Label>Requisitos</Label>
                  <Input name="requisitos" value={scholarshipForm.requisitos} onChange={handleScholarshipInputChange} placeholder="Promedio mayor a 16" />
                </div>
                <Button type="submit">
                  <Plus className="mr-2 h-4 w-4" />
                  {editingScholarshipId !== null ? 'Guardar Cambios' : 'Registrar Beca'}
                </Button>
              </form>
            </div>

            <div className="rounded-2xl border border-primary/20 bg-card/40 p-8 backdrop-blur-xl">
              <h2 className="mb-6 text-xl font-bold text-foreground">Becas Registradas</h2>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-primary/20">
                    <th className="px-4 py-3 text-left">Nombre</th>
                    <th className="px-4 py-3 text-left">Monto</th>
                    <th className="px-4 py-3 text-left">Requisitos</th>
                    <th className="px-4 py-3 text-left">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {scholarships.map(scholarship => (
                    <tr key={scholarship.id} className="border-b border-primary/10">
                      <td className="px-4 py-3">{scholarship.nombre}</td>
                      <td className="px-4 py-3">{scholarship.monto}</td>
                      <td className="px-4 py-3">{scholarship.requisitos}</td>
                      <td className="px-4 py-3 flex gap-2">
                        <Button variant="ghost" size="sm" onClick={() => handleEditScholarship(scholarship.id)}>Editar</Button>
                        <Button variant="destructive" size="sm" onClick={() => handleDeleteScholarship(scholarship.id)}>Eliminar</Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── HALLAZGOS ── */}
        {tab === 'hallazgos' && (
          <div className="space-y-6">
            <div className="rounded-2xl border border-primary/20 bg-card/40 p-8 backdrop-blur-xl">
              <h2 className="mb-6 text-xl font-bold text-foreground">Registro de Hallazgos</h2>
              <form onSubmit={handleAddFinding} className="space-y-4">
                <Input name="estudiante" value={findingForm.estudiante} onChange={handleFindingInputChange} placeholder="Nombre del estudiante" />
                <Input name="problemas" value={findingForm.problemas} onChange={handleFindingInputChange} placeholder="Problemas detectados" />
                <Input name="necesidades" value={findingForm.necesidades} onChange={handleFindingInputChange} placeholder="Necesidades" />
                <Input name="motivaciones" value={findingForm.motivaciones} onChange={handleFindingInputChange} placeholder="Motivaciones" />
                <Button type="submit">
                  <Plus className="mr-2 h-4 w-4" /> Registrar Hallazgo
                </Button>
              </form>
            </div>

            <div className="rounded-2xl border border-primary/20 bg-card/40 p-8 backdrop-blur-xl">
              <h2 className="mb-6 text-xl font-bold text-foreground">Hallazgos Registrados</h2>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-primary/20">
                    <th className="px-4 py-3 text-left">Estudiante</th>
                    <th className="px-4 py-3 text-left">Problemas</th>
                    <th className="px-4 py-3 text-left">Necesidades</th>
                    <th className="px-4 py-3 text-left">Motivaciones</th>
                    <th className="px-4 py-3 text-left">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {findings.map(finding => (
                    <tr key={finding.id} className="border-b border-primary/10">
                      <td className="px-4 py-3">{finding.estudiante}</td>
                      <td className="px-4 py-3">{finding.problemas}</td>
                      <td className="px-4 py-3">{finding.necesidades}</td>
                      <td className="px-4 py-3">{finding.motivaciones}</td>
                      <td className="px-4 py-3">
                        <Button variant="destructive" size="sm" onClick={() => handleDeleteFinding(finding.id)}>Eliminar</Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── ACADÉMICO ── */}
        {tab === 'academico' && (
          <div className="space-y-6">
            <div className="rounded-2xl border border-primary/20 bg-card/40 p-8 backdrop-blur-xl">
              <h2 className="mb-6 text-xl font-bold text-foreground">Registro Académico</h2>
              <form onSubmit={handleAddAcademicRecord} className="space-y-4">
                <Input name="estudiante" value={academicForm.estudiante} onChange={handleAcademicInputChange} placeholder="Nombre del estudiante" />
                <Input name="nota" value={academicForm.nota} onChange={handleAcademicInputChange} placeholder="Nota final" />
                <Input name="asistencia" value={academicForm.asistencia} onChange={handleAcademicInputChange} placeholder="Asistencia (%)" />
                <Input name="desaprobados" value={academicForm.desaprobados} onChange={handleAcademicInputChange} placeholder="Cursos desaprobados" />
                <Button type="submit">
                  <Plus className="mr-2 h-4 w-4" />
                  {editingAcademicId !== null ? 'Guardar Cambios' : 'Guardar Registro'}
                </Button>
              </form>
            </div>

            <div className="rounded-2xl border border-primary/20 bg-card/40 p-8 backdrop-blur-xl">
              <h2 className="mb-6 text-xl font-bold text-foreground">Registros Académicos</h2>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-primary/20">
                    <th className="px-4 py-3 text-left">Estudiante</th>
                    <th className="px-4 py-3 text-left">Nota</th>
                    <th className="px-4 py-3 text-left">Asistencia</th>
                    <th className="px-4 py-3 text-left">Cursos Desaprobados</th>
                    <th className="px-4 py-3 text-left">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {academicRecords.map(record => (
                    <tr key={record.id} className="border-b border-primary/10">
                      <td className="px-4 py-3">{record.estudiante}</td>
                      <td className="px-4 py-3">{record.nota}</td>
                      <td className="px-4 py-3">{record.asistencia}%</td>
                      <td className="px-4 py-3">{record.desaprobados}</td>
                      <td className="px-4 py-3 flex gap-2">
                        <Button variant="ghost" size="sm" onClick={() => handleEditAcademicRecord(record.id)}>Editar</Button>
                        <Button variant="destructive" size="sm" onClick={() => handleDeleteAcademicRecord(record.id)}>Eliminar</Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── TRÁMITES DE APOYO ── */}
        {tab === 'tramitesApoyo' && (
          <SupportProceduresPanel />
        )}

        {tab === 'importacion' && (
          <ImportStudentsPanel />
        )}

        {/* ── ROLES ── */}
        {tab === 'roles' && (
          <div className="rounded-2xl border border-primary/20 bg-card/40 p-8 backdrop-blur-xl">
            <h2 className="mb-6 text-xl font-bold text-foreground">Asignación de Roles</h2>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-primary/20">
                  <th className="px-4 py-3 text-left">Usuario</th>
                  <th className="px-4 py-3 text-left">Rol Actual</th>
                  <th className="px-4 py-3 text-left">Cambiar Rol</th>
                </tr>
              </thead>
              <tbody>
                {students.map(student => {
                  const assignedRole = userRoles.find(item => item.id === student.id)?.role || 'estudiante'
                  return (
                    <tr key={student.id} className="border-b border-primary/10">
                      <td className="px-4 py-3">{student.nombre}</td>
                      <td className="px-4 py-3 capitalize">{assignedRole}</td>
                      <td className="px-4 py-3">
                        <Select onValueChange={value => handleAssignRole(student, value)}>
                          <SelectTrigger className="w-48"><SelectValue placeholder="Seleccionar rol" /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="administrador">Administrador</SelectItem>
                            <SelectItem value="tutor">Tutor</SelectItem>
                            <SelectItem value="coordinador">Coordinador</SelectItem>
                            <SelectItem value="estudiante">Estudiante</SelectItem>
                          </SelectContent>
                        </Select>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* ── REPORTES ── */}
        {tab === 'reportes' && (
          <div className="rounded-2xl border border-primary/20 bg-card/40 p-8 backdrop-blur-xl">
            <h2 className="mb-6 text-xl font-bold text-foreground">Reportes Académicos</h2>
            <p className="text-foreground/70">Módulo de reportes (en desarrollo)</p>

            {currentRole === 'administrador' && <p className="mt-4 text-green-500">Opciones de administrador visibles</p>}
            {currentRole === 'tutor' && <p className="mt-4 text-blue-500">Panel de tutor visible</p>}
            {currentRole === 'coordinador' && <p className="mt-4 text-yellow-500">Panel de coordinador visible</p>}
            {currentRole === 'estudiante' && <p className="mt-4 text-purple-500">Vista de estudiante visible</p>}
          </div>
        )}

      </div>
    </SidebarLayout>
  )
}