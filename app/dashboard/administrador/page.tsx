'use client'

import { useState, useEffect } from 'react'
import {
  Users,
  BookOpen,
  Settings,
  UserCheck,
  BarChart3,
  Plus,
  Search,
  AlertCircle,
  CheckCircle,
  Pencil,
  Trash2,
} from 'lucide-react'

// Alessandro
import { fetchStudents } from '@/src/api/studentsApi'

// 🔥 API BECAS ALESSANDRO
import { getScholarships } from '@/src/services/scholarshipService'

// Mauricio
// import { students as aiStudents } from '@/src/data/students'

import { SidebarLayout } from '@/components/dashboard/sidebar-layout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export default function AdministradorPage() {
  const [tab, setTab] = useState<'estudiantes' | 'roles' | 'becas' | 'reportes'>('estudiantes')

  // AGREGADO
  const [students, setStudents] = useState<any[]>([])

  const [formData, setFormData] = useState({
    nombre: '',
    codigo: '',
    correo: '',
    ciclo: '',
    carrera: '',
  })

  const [errors, setErrors] = useState<{ [key: string]: string }>({})
  const [successMessage, setSuccessMessage] = useState('')

  // 🔥 ESTADO BECAS

  const [scholarships, setScholarships] = useState<any[]>([])

  const [scholarshipForm, setScholarshipForm] = useState({
    nombre: '',
    monto: '',
    requisitos: '',
  })

  // AGREGADO CARGAR ESTUDIANTES DESDE API FAKE DE ALESSANDRO

  useEffect(() => {
    const data = fetchStudents()

    const formattedStudents = data.map((student: any) => ({
      id: student.id,
      nombre: student.name,
      codigo: student.codigo,
      correo: student.correo,
      ciclo: student.ciclo,
      carrera: student.carrera,

      // FUTURO MAURICIO
      // ESTO SERVIRÁ PARA MOSTRAR
      // HIGH / MEDIUM / LOW

      risk: student.risk,

      // RECOMENDACIONES IA
      recommendation: student.recommendation,
    }))

    setStudents(formattedStudents)
  }, [])

  // 🔥 CARGAR BECAS DESDE API FAKE DE ALESSANDRO

  useEffect(() => {
    const data = getScholarships()

    setScholarships(data)
  }, [])

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

    if (!formData.nombre.trim())
      newErrors.nombre = 'El nombre es requerido'

    if (!formData.codigo.trim())
      newErrors.codigo = 'El código es requerido'

    if (!formData.correo.trim())
      newErrors.correo = 'El correo es requerido'

    if (!formData.correo.includes('@'))
      newErrors.correo = 'Correo inválido'

    if (!formData.ciclo)
      newErrors.ciclo = 'El ciclo es requerido'

    if (!formData.carrera)
      newErrors.carrera = 'La carrera es requerida'

    setErrors(newErrors)

    return Object.keys(newErrors).length === 0
  }

  const handleAddStudent = (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    const newStudent = {
      id: students.length + 1,
      ...formData,
      risk: 'LOW',
    }

    setStudents(prev => [...prev, newStudent])

    setFormData({
      nombre: '',
      codigo: '',
      correo: '',
      ciclo: '',
      carrera: '',
    })

    setErrors({})
    setSuccessMessage('Estudiante agregado exitosamente')

    setTimeout(() => setSuccessMessage(''), 3000)
  }

  // 🔥 REGISTRAR NUEVA BECA

  const handleAddScholarship = (e: React.FormEvent) => {
    e.preventDefault()

    const newScholarship = {
      id: scholarships.length + 1,
      ...scholarshipForm,
    }

    setScholarships(prev => [...prev, newScholarship])

    setScholarshipForm({
      nombre: '',
      monto: '',
      requisitos: '',
    })
  }

  const menuItems = [
    {
      label: 'Gestión de Estudiantes',
      href: '/dashboard/administrador',
      icon: <Users className="h-5 w-5" />,
    },
    {
      label: 'Registro de Becas',
      href: '/dashboard/administrador?tab=becas',
      icon: <BookOpen className="h-5 w-5" />,
    },
    {
      label: 'Asignación de Roles',
      href: '/dashboard/administrador?tab=roles',
      icon: <UserCheck className="h-5 w-5" />,
    },
    {
      label: 'Reportes Académicos',
      href: '/dashboard/administrador?tab=reportes',
      icon: <BarChart3 className="h-5 w-5" />,
    },
    {
      label: 'Configuración',
      href: '/dashboard/administrador?tab=config',
      icon: <Settings className="h-5 w-5" />,
    },
  ]

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

        {/* Tabs */}

        <div className="mb-6 flex flex-wrap gap-2 border-b border-primary/20">
          {[
            { id: 'estudiantes', label: 'Gestión de Estudiantes' },
            { id: 'becas', label: 'Registro de Becas' },
            { id: 'roles', label: 'Asignación de Roles' },
            { id: 'reportes', label: 'Reportes Académicos' },
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

        {/* GESTIÓN ESTUDIANTES */}

        {tab === 'estudiantes' && (
          <div className="space-y-6">

            {/* FORMULARIO */}

            <div className="rounded-2xl border border-primary/20 bg-card/40 p-8 backdrop-blur-xl">
              <h2 className="mb-6 text-xl font-bold text-foreground">
                Registrar Nuevo Estudiante
              </h2>

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

                  {/* Nombre */}

                  <div className="space-y-2">
                    <Label
                      htmlFor="nombre"
                      className="text-foreground"
                    >
                      Nombre Completo
                    </Label>

                    <Input
                      id="nombre"
                      name="nombre"
                      value={formData.nombre}
                      onChange={handleInputChange}
                      placeholder="Juan García"
                      className="border-primary/20 bg-background/50"
                    />

                    {errors.nombre && (
                      <p className="flex items-center gap-1 text-xs text-red-500">
                        <AlertCircle className="h-3 w-3" />
                        {errors.nombre}
                      </p>
                    )}
                  </div>

                  {/* Código */}

                  <div className="space-y-2">
                    <Label
                      htmlFor="codigo"
                      className="text-foreground"
                    >
                      Código de Estudiante
                    </Label>

                    <Input
                      id="codigo"
                      name="codigo"
                      value={formData.codigo}
                      onChange={handleInputChange}
                      placeholder="E001"
                      className="border-primary/20 bg-background/50"
                    />

                    {errors.codigo && (
                      <p className="flex items-center gap-1 text-xs text-red-500">
                        <AlertCircle className="h-3 w-3" />
                        {errors.codigo}
                      </p>
                    )}
                  </div>

                  {/* Correo */}

                  <div className="space-y-2">
                    <Label
                      htmlFor="correo"
                      className="text-foreground"
                    >
                      Correo Institucional
                    </Label>

                    <Input
                      id="correo"
                      name="correo"
                      type="email"
                      value={formData.correo}
                      onChange={handleInputChange}
                      placeholder="juan.garcia@uni.edu"
                      className="border-primary/20 bg-background/50"
                    />

                    {errors.correo && (
                      <p className="flex items-center gap-1 text-xs text-red-500">
                        <AlertCircle className="h-3 w-3" />
                        {errors.correo}
                      </p>
                    )}
                  </div>

                  {/* Ciclo */}

                  <div className="space-y-2">
                    <Label
                      htmlFor="ciclo"
                      className="text-foreground"
                    >
                      Ciclo Académico
                    </Label>

                    <Select
                      value={formData.ciclo}
                      onValueChange={(value) =>
                        handleSelectChange('ciclo', value)
                      }
                    >
                      <SelectTrigger className="border-primary/20 bg-background/50">
                        <SelectValue placeholder="Selecciona ciclo" />
                      </SelectTrigger>

                      <SelectContent>
                        {[
                          'I',
                          'II',
                          'III',
                          'IV',
                          'V',
                          'VI',
                          'VII',
                          'VIII',
                          'IX',
                          'X',
                        ].map(c => (
                          <SelectItem key={c} value={c}>
                            {c}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    {errors.ciclo && (
                      <p className="flex items-center gap-1 text-xs text-red-500">
                        <AlertCircle className="h-3 w-3" />
                        {errors.ciclo}
                      </p>
                    )}
                  </div>

                  {/* Carrera */}

                  <div className="space-y-2 sm:col-span-2">
                    <Label
                      htmlFor="carrera"
                      className="text-foreground"
                    >
                      Carrera
                    </Label>

                    <Select
                      value={formData.carrera}
                      onValueChange={(value) =>
                        handleSelectChange('carrera', value)
                      }
                    >
                      <SelectTrigger className="border-primary/20 bg-background/50">
                        <SelectValue placeholder="Selecciona carrera" />
                      </SelectTrigger>

                      <SelectContent>
                        {[
                          'Ingeniería Informática',
                          'Administración',
                          'Ingeniería Civil',
                          'Psicología',
                          'Contabilidad',
                          'Enfermería',
                        ].map(c => (
                          <SelectItem key={c} value={c}>
                            {c}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    {errors.carrera && (
                      <p className="flex items-center gap-1 text-xs text-red-500">
                        <AlertCircle className="h-3 w-3" />
                        {errors.carrera}
                      </p>
                    )}
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-primary to-secondary"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Agregar Estudiante
                </Button>
              </form>
            </div>

            {/* TABLA */}

            <div className="rounded-2xl border border-primary/20 bg-card/40 p-8 backdrop-blur-xl">
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-xl font-bold text-foreground">
                  Estudiantes Registrados
                </h2>

                <div className="relative w-64">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground/50" />

                  <Input
                    placeholder="Buscar estudiante..."
                    className="border-primary/20 bg-background/50 pl-10"
                  />
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-primary/20">
                      <th className="px-4 py-3 text-left font-semibold text-foreground">
                        Nombre
                      </th>

                      <th className="px-4 py-3 text-left font-semibold text-foreground">
                        Código
                      </th>

                      <th className="px-4 py-3 text-left font-semibold text-foreground">
                        Correo
                      </th>

                      <th className="px-4 py-3 text-left font-semibold text-foreground">
                        Ciclo
                      </th>

                      <th className="px-4 py-3 text-left font-semibold text-foreground">
                        Carrera
                      </th>

                      {/* COLUMNA IA */}

                      <th className="px-4 py-3 text-left font-semibold text-foreground">
                        Riesgo IA
                      </th>

                      <th className="px-4 py-3 text-left font-semibold text-foreground">
                        Acciones
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {students.map(student => (
                      <tr
                        key={student.id}
                        className="border-b border-primary/10 transition-colors hover:bg-primary/5"
                      >
                        <td className="px-4 py-3 text-foreground">
                          {student.nombre}
                        </td>

                        <td className="px-4 py-3 text-foreground/70">
                          {student.codigo}
                        </td>

                        <td className="px-4 py-3 text-foreground/70">
                          {student.correo}
                        </td>

                        <td className="px-4 py-3 text-foreground/70">
                          {student.ciclo}
                        </td>

                        <td className="px-4 py-3 text-foreground/70">
                          {student.carrera}
                        </td>

                        {/* BADGE IA */}

                        <td className="px-4 py-3">
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-semibold ${
                              student.risk === 'HIGH'
                                ? 'bg-red-500/20 text-red-400'
                                : student.risk === 'MEDIUM'
                                ? 'bg-yellow-500/20 text-yellow-400'
                                : 'bg-green-500/20 text-green-400'
                            }`}
                          >
                            {student.risk || 'LOW'}
                          </span>
                        </td>

                        <td className="flex gap-2 px-4 py-3">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-secondary hover:bg-secondary/10"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>

                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-400 hover:bg-red-500/10"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB BECAS */}

        {tab === 'becas' && (
          <div className="space-y-6">

            {/* FORM BECAS */}

            <div className="rounded-2xl border border-primary/20 bg-card/40 p-8 backdrop-blur-xl">
              <h2 className="mb-6 text-xl font-bold text-foreground">
                Registrar Nueva Beca
              </h2>

              <form
                onSubmit={handleAddScholarship}
                className="space-y-5"
              >
                <div className="grid gap-4">

                  <div className="space-y-2">
                    <Label className="text-foreground">
                      Nombre de la Beca
                    </Label>

                    <Input
                      name="nombre"
                      value={scholarshipForm.nombre}
                      onChange={handleScholarshipInputChange}
                      placeholder="Beca Excelencia"
                      className="border-primary/20 bg-background/50"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-foreground">
                      Monto
                    </Label>

                    <Input
                      name="monto"
                      value={scholarshipForm.monto}
                      onChange={handleScholarshipInputChange}
                      placeholder="5000"
                      className="border-primary/20 bg-background/50"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-foreground">
                      Requisitos
                    </Label>

                    <Input
                      name="requisitos"
                      value={scholarshipForm.requisitos}
                      onChange={handleScholarshipInputChange}
                      placeholder="Promedio mayor a 16"
                      className="border-primary/20 bg-background/50"
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-primary to-secondary"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Registrar Beca
                </Button>
              </form>
            </div>

            {/* TABLA BECAS */}

            <div className="rounded-2xl border border-primary/20 bg-card/40 p-8 backdrop-blur-xl">
              <h2 className="mb-6 text-xl font-bold text-foreground">
                Becas Registradas
              </h2>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-primary/20">
                      <th className="px-4 py-3 text-left font-semibold text-foreground">
                        Nombre
                      </th>

                      <th className="px-4 py-3 text-left font-semibold text-foreground">
                        Monto
                      </th>

                      <th className="px-4 py-3 text-left font-semibold text-foreground">
                        Requisitos
                      </th>

                      <th className="px-4 py-3 text-left font-semibold text-foreground">
                        Acciones
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {scholarships.map((scholarship) => (
                      <tr
                        key={scholarship.id}
                        className="border-b border-primary/10"
                      >
                        <td className="px-4 py-3 text-foreground">
                          {scholarship.nombre}
                        </td>

                        <td className="px-4 py-3 text-foreground/70">
                          {scholarship.monto}
                        </td>

                        <td className="px-4 py-3 text-foreground/70">
                          {scholarship.requisitos}
                        </td>

                        <td className="flex gap-2 px-4 py-3">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-secondary hover:bg-secondary/10"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>

                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-400 hover:bg-red-500/10"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ROLES */}

        {tab === 'roles' && (
          <div className="rounded-2xl border border-primary/20 bg-card/40 p-8 backdrop-blur-xl">
            <h2 className="mb-6 text-xl font-bold text-foreground">
              Asignación de Roles
            </h2>

            <p className="text-foreground/70">
              Módulo de asignación de roles (en desarrollo)
            </p>
          </div>
        )}

        {/* REPORTES */}

        {tab === 'reportes' && (
          <div className="rounded-2xl border border-primary/20 bg-card/40 p-8 backdrop-blur-xl">
            <h2 className="mb-6 text-xl font-bold text-foreground">
              Reportes Académicos
            </h2>

            <p className="text-foreground/70">
              Módulo de reportes (en desarrollo)
            </p>
          </div>
        )}
      </div>
    </SidebarLayout>
  )
}