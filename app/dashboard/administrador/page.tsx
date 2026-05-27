'use client'

import { useState } from 'react'
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
} from 'lucide-react'
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
  const [students, setStudents] = useState([
    { id: 1, nombre: 'Juan García', codigo: 'E001', correo: 'juan.garcia@uni.edu', ciclo: 'VI', carrera: 'Ingeniería Informática' },
    { id: 2, nombre: 'María López', codigo: 'E002', correo: 'maria.lopez@uni.edu', ciclo: 'IV', carrera: 'Administración' },
    { id: 3, nombre: 'Carlos Rodríguez', codigo: 'E003', correo: 'carlos.r@uni.edu', ciclo: 'V', carrera: 'Ingeniería Civil' },
  ])
  
  const [formData, setFormData] = useState({
    nombre: '',
    codigo: '',
    correo: '',
    ciclo: '',
    carrera: '',
  })

  const [errors, setErrors] = useState<{ [key: string]: string }>({})
  const [successMessage, setSuccessMessage] = useState('')

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }))
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

  const handleAddStudent = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    const newStudent = {
      id: students.length + 1,
      ...formData,
    }
    
    setStudents(prev => [...prev, newStudent])
    setFormData({ nombre: '', codigo: '', correo: '', ciclo: '', carrera: '' })
    setErrors({})
    setSuccessMessage('Estudiante agregado exitosamente')
    
    setTimeout(() => setSuccessMessage(''), 3000)
  }

  const menuItems = [
    { label: 'Gestión de Estudiantes', href: '/dashboard/administrador', icon: <Users className="h-5 w-5" /> },
    { label: 'Registro de Becas', href: '/dashboard/administrador?tab=becas', icon: <BookOpen className="h-5 w-5" /> },
    { label: 'Asignación de Roles', href: '/dashboard/administrador?tab=roles', icon: <UserCheck className="h-5 w-5" /> },
    { label: 'Reportes Académicos', href: '/dashboard/administrador?tab=reportes', icon: <BarChart3 className="h-5 w-5" /> },
    { label: 'Configuración', href: '/dashboard/administrador?tab=config', icon: <Settings className="h-5 w-5" /> },
  ]

  return (
    <SidebarLayout role="administrador" menuItems={menuItems}>
      <div className="max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Panel de Administración</h1>
          <p className="text-foreground/70">Gestiona estudiantes, becas y asignación de roles</p>
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

        {/* Gestión de Estudiantes Tab */}
        {tab === 'estudiantes' && (
          <div className="space-y-6">
            {/* Registration Form */}
            <div className="rounded-2xl border border-primary/20 bg-card/40 p-8 backdrop-blur-xl">
              <h2 className="mb-6 text-xl font-bold text-foreground">Registrar Nuevo Estudiante</h2>
              
              {successMessage && (
                <div className="mb-6 flex items-center gap-3 rounded-lg border border-green-500/20 bg-green-500/10 p-4">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <p className="text-sm text-green-500">{successMessage}</p>
                </div>
              )}

              <form onSubmit={handleAddStudent} className="space-y-5">
                <div className="grid gap-4 sm:grid-cols-2">
                  {/* Nombre */}
                  <div className="space-y-2">
                    <Label htmlFor="nombre" className="text-foreground">Nombre Completo</Label>
                    <Input
                      id="nombre"
                      name="nombre"
                      value={formData.nombre}
                      onChange={handleInputChange}
                      placeholder="Juan García"
                      className="border-primary/20 bg-background/50"
                    />
                    {errors.nombre && (
                      <p className="text-xs text-red-500 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" /> {errors.nombre}
                      </p>
                    )}
                  </div>

                  {/* Código */}
                  <div className="space-y-2">
                    <Label htmlFor="codigo" className="text-foreground">Código de Estudiante</Label>
                    <Input
                      id="codigo"
                      name="codigo"
                      value={formData.codigo}
                      onChange={handleInputChange}
                      placeholder="E001"
                      className="border-primary/20 bg-background/50"
                    />
                    {errors.codigo && (
                      <p className="text-xs text-red-500 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" /> {errors.codigo}
                      </p>
                    )}
                  </div>

                  {/* Correo */}
                  <div className="space-y-2">
                    <Label htmlFor="correo" className="text-foreground">Correo Institucional</Label>
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
                      <p className="text-xs text-red-500 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" /> {errors.correo}
                      </p>
                    )}
                  </div>

                  {/* Ciclo */}
                  <div className="space-y-2">
                    <Label htmlFor="ciclo" className="text-foreground">Ciclo Académico</Label>
                    <Select value={formData.ciclo} onValueChange={(value) => handleSelectChange('ciclo', value)}>
                      <SelectTrigger className="border-primary/20 bg-background/50">
                        <SelectValue placeholder="Selecciona ciclo" />
                      </SelectTrigger>
                      <SelectContent>
                        {['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'].map(c => (
                          <SelectItem key={c} value={c}>{c}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.ciclo && (
                      <p className="text-xs text-red-500 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" /> {errors.ciclo}
                      </p>
                    )}
                  </div>

                  {/* Carrera */}
                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="carrera" className="text-foreground">Carrera</Label>
                    <Select value={formData.carrera} onValueChange={(value) => handleSelectChange('carrera', value)}>
                      <SelectTrigger className="border-primary/20 bg-background/50">
                        <SelectValue placeholder="Selecciona carrera" />
                      </SelectTrigger>
                      <SelectContent>
                        {['Ingeniería Informática', 'Administración', 'Ingeniería Civil', 'Psicología', 'Contabilidad', 'Enfermería'].map(c => (
                          <SelectItem key={c} value={c}>{c}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.carrera && (
                      <p className="text-xs text-red-500 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" /> {errors.carrera}
                      </p>
                    )}
                  </div>
                </div>

                <Button type="submit" className="w-full bg-gradient-to-r from-primary to-secondary">
                  <Plus className="mr-2 h-4 w-4" />
                  Agregar Estudiante
                </Button>
              </form>
            </div>

            {/* Students Table */}
            <div className="rounded-2xl border border-primary/20 bg-card/40 p-8 backdrop-blur-xl">
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-xl font-bold text-foreground">Estudiantes Registrados</h2>
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
                      <th className="px-4 py-3 text-left font-semibold text-foreground">Nombre</th>
                      <th className="px-4 py-3 text-left font-semibold text-foreground">Código</th>
                      <th className="px-4 py-3 text-left font-semibold text-foreground">Correo</th>
                      <th className="px-4 py-3 text-left font-semibold text-foreground">Ciclo</th>
                      <th className="px-4 py-3 text-left font-semibold text-foreground">Carrera</th>
                      <th className="px-4 py-3 text-left font-semibold text-foreground">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.map(student => (
                      <tr key={student.id} className="border-b border-primary/10 hover:bg-primary/5 transition-colors">
                        <td className="px-4 py-3 text-foreground">{student.nombre}</td>
                        <td className="px-4 py-3 text-foreground/70">{student.codigo}</td>
                        <td className="px-4 py-3 text-foreground/70">{student.correo}</td>
                        <td className="px-4 py-3 text-foreground/70">{student.ciclo}</td>
                        <td className="px-4 py-3 text-foreground/70">{student.carrera}</td>
                        <td className="px-4 py-3">
                          <Button variant="ghost" size="sm" className="text-secondary hover:bg-secondary/10">
                            Editar
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

        {/* Becas Tab */}
        {tab === 'becas' && (
          <div className="rounded-2xl border border-primary/20 bg-card/40 p-8 backdrop-blur-xl">
            <h2 className="mb-6 text-xl font-bold text-foreground">Registro de Becas</h2>
            <p className="text-foreground/70">Módulo de gestión de becas (en desarrollo)</p>
          </div>
        )}

        {/* Roles Tab */}
        {tab === 'roles' && (
          <div className="rounded-2xl border border-primary/20 bg-card/40 p-8 backdrop-blur-xl">
            <h2 className="mb-6 text-xl font-bold text-foreground">Asignación de Roles</h2>
            <p className="text-foreground/70">Módulo de asignación de roles (en desarrollo)</p>
          </div>
        )}

        {/* Reportes Tab */}
        {tab === 'reportes' && (
          <div className="rounded-2xl border border-primary/20 bg-card/40 p-8 backdrop-blur-xl">
            <h2 className="mb-6 text-xl font-bold text-foreground">Reportes Académicos</h2>
            <p className="text-foreground/70">Módulo de reportes (en desarrollo)</p>
          </div>
        )}
      </div>
    </SidebarLayout>
  )
}
