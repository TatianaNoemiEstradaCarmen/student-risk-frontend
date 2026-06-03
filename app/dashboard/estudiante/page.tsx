'use client'

import { useState } from 'react'
import {
  Gift,
  MessageSquare,
  Send,
  AlertTriangle,
  TrendingUp,
  DollarSign,
  AlertCircle,
  CheckCircle
} from 'lucide-react'
import { useEffect } from 'react'

// TUTORÍAS API ALESSANDRO
import { getTutoringRequests } from '@/src/services/tutoringService'
import { getScholarships } from '@/src/services/scholarshipService'
// ALERTAS IA MAURICIO
import { alerts } from '@/src/data/students'
import { SidebarLayout } from '@/components/dashboard/sidebar-layout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

interface Scholarship {
  id: number
  nombre: string
  monto: string
  requisitos: string
}

interface TutoringRequest {
  id: number
  estudiante: string
  motivo: string
  descripcion: string
  fecha: string
  estado: string
}


export default function EstudiantePage() {
  const [tab, setTab] = useState<'solicitudes' | 'becas' | 'alertas'>('solicitudes')
  
  const [formData, setFormData] = useState({
    motivo: '',
    descripcion: '',
  })

  //const [submittedRequests, setSubmittedRequests] = useState<Array<{
  //  id: number
  //  motivo: string
  //  descripcion: string
  //  fecha: string
  //  estado: string
  //}>>([])
  // SOLICITUDES DE TUTORÍA
// VENDRÁN DESDE API FAKE DE ALESSANDRO

  const [submittedRequests, setSubmittedRequests] =
  useState<TutoringRequest[]>([])

  const [successMessage, setSuccessMessage] = useState('')

  const [scholarships, setScholarships] = useState<Scholarship[]>([])

  // CARGAR SOLICITUDES DE TUTORÍA
// DESDE tutoringService.js

  useEffect(() => {
    const savedRequests = localStorage.getItem('tutoringRequests')

    if (savedRequests) {
      setSubmittedRequests(JSON.parse(savedRequests))
    } else {
      const data = getTutoringRequests()

      const formattedRequests = data.map((request: any) => ({
        id: request.id,
        motivo: request.motivo,
        descripcion: request.descripcion,
        estudiante: request.estudiante,
        fecha: request.fecha,
        estado: request.estado,
      }))

      setSubmittedRequests(formattedRequests)
    }
  }, [])

  useEffect(() => {
    const data = getScholarships()
  
    setScholarships(data)
  }, [])

  //const alerts: Alert[] = [
  //  {
  //    id: 1,
  //    tipo: 'warning',
  //    titulo: 'Baja Asistencia',
  //    descripcion: 'Tu asistencia está por debajo del 70%. Es importante que aumentes tu asistencia a clases.',
  //    fecha: '2024-01-15',
  //  },
  //  {
  //    id: 2,
  //    tipo: 'info',
  //    titulo: 'Recordatorio de Pagos',
  //    descripcion: 'Te recordamos que las cuotas de este semestre vencen el 20 de enero.',
  //    fecha: '2024-01-10',
  //  },
  //  {
  //    id: 3,
  //    tipo: 'success',
  //    titulo: 'Mejora Académica Detectada',
  //    descripcion: 'Felicidades, tu desempeño en los últimos exámenes ha mejorado significativamente.',
  //    fecha: '2024-01-05',
  //  },
  //]

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmitRequest = (e: React.FormEvent) => {
    e.preventDefault()
    // VALIDACIÓN HU-14

    if (!formData.motivo.trim() || !formData.descripcion.trim()) {
      alert('Todos los campos son obligatorios')
      return
    }
    //if (!formData.motivo.trim() || !formData.descripcion.trim()) {
    //  return
    //}

    //const newRequest = {
    //  id: submittedRequests.length + 1,
    //  motivo: formData.motivo,
    //  descripcion: formData.descripcion,
    //  fecha: new Date().toISOString().split('T')[0],
    //  estado: 'Pendiente',
    //}

    //NUEVA SOLICITUD DE TUTORÍA

    const newRequest = {
      id: submittedRequests.length + 1,
      estudiante: 'Estudiante Actual',
      motivo: formData.motivo,
      descripcion: formData.descripcion,
      fecha: new Date().toISOString().split('T')[0],
      estado: 'Pendiente',
    }

    const updatedRequests = [...submittedRequests, newRequest]

    setSubmittedRequests(updatedRequests)

    localStorage.setItem(
      'tutoringRequests',
      JSON.stringify(updatedRequests)
    )
    setFormData({ motivo: '', descripcion: '' })
    setSuccessMessage('Solicitud de tutoría enviada exitosamente')
    
    setTimeout(() => setSuccessMessage(''), 3000)
  }


  const menuItems = [
    { label: 'Solicitar Tutoría', href: '/dashboard/estudiante', icon: <MessageSquare className="h-5 w-5" /> },
    { label: 'Becas Disponibles', href: '/dashboard/estudiante?tab=becas', icon: <Gift className="h-5 w-5" /> },
    { label: 'Mis Alertas Académicas', href: '/dashboard/estudiante?tab=alertas', icon: <AlertCircle className="h-5 w-5" /> },
  ]

  return (
    <SidebarLayout role="estudiante" menuItems={menuItems}>
      <div className="max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Bienvenido, Estudiante</h1>
          <p className="text-foreground/70">Gestiona tus solicitudes de tutoría, becas y alertas académicas</p>
          {/* ALERTA IA MAURICIO */}

          <div className="mt-4 rounded-xl border border-yellow-500/20 bg-yellow-500/10 p-4">
            <div className="flex items-start gap-3">
              <TrendingUp className="mt-1 h-5 w-5 text-yellow-400" />

              <div>
                <p className="font-semibold text-yellow-400">
                  Riesgo Académico Detectado
                </p>

                <p className="text-sm text-foreground/80">
                  El sistema recomienda solicitar acompañamiento académico preventivo.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6 flex flex-wrap gap-2 border-b border-primary/20">
          {[
            { id: 'solicitudes', label: 'Solicitar Tutoría' },
            { id: 'becas', label: 'Becas Disponibles' },
            //{ id: 'alertas', label: 'Mis Alertas' },
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

        {/* Solicitar Tutoría Tab */}
        {tab === 'solicitudes' && (
          <div className="space-y-6">
            {/* Form */}
            <div className="rounded-2xl border border-primary/20 bg-card/40 p-8 backdrop-blur-xl">
              <h2 className="mb-6 text-xl font-bold text-foreground flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Solicitar Sesión de Tutoría
              </h2>

              {successMessage && (
                <div className="mb-6 flex items-center gap-3 rounded-lg border border-green-500/20 bg-green-500/10 p-4">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <p className="text-sm text-green-500">{successMessage}</p>
                </div>
              )}

              <form onSubmit={handleSubmitRequest} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="motivo" className="text-foreground">¿En qué tema necesitas ayuda?</Label>
                  <Input
                    id="motivo"
                    name="motivo"
                    value={formData.motivo}
                    onChange={handleInputChange}
                    placeholder="Ej: Matemáticas, Algoritmos, Física, etc."
                    className="border-primary/20 bg-background/50"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="descripcion" className="text-foreground">Describe tu situación con más detalle</Label>
                  <Textarea
                    id="descripcion"
                    name="descripcion"
                    value={formData.descripcion}
                    onChange={handleInputChange}
                    placeholder="Cuéntale al tutor específicamente qué conceptos te están causando dificultad..."
                    className="border-primary/20 bg-background/50 min-h-32"
                    required
                  />
                </div>

                <Button type="submit" className="w-full bg-gradient-to-r from-primary to-secondary">
                  <Send className="mr-2 h-4 w-4" />
                  Enviar Solicitud
                </Button>
              </form>
            </div>

            {/* Submitted Requests */}
            {submittedRequests.length > 0 && (
              <div className="rounded-2xl border border-primary/20 bg-card/40 p-8 backdrop-blur-xl">
                <h3 className="mb-6 text-lg font-bold text-foreground">Mis Solicitudes</h3>
                <div className="space-y-3">
                  {submittedRequests.map(request => (
                    <div key={request.id} className="rounded-lg border border-primary/20 bg-background/30 p-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-semibold text-foreground">{request.motivo}</p>
                          <p className="text-sm text-foreground/70">{request.descripcion}</p>
                          <p className="text-xs text-foreground/50 mt-2">{request.fecha}</p>
                        </div>
                        <span className="rounded-full border border-yellow-500/20 bg-yellow-500/10 px-3 py-1 text-xs font-semibold text-yellow-400">
                          {request.estado}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Becas Tab */}
        {tab === 'becas' && (
          <div className="space-y-6">
            {scholarships.map(scholarship => (
              <div key={scholarship.id} className="rounded-2xl border border-primary/20 bg-card/40 p-8 backdrop-blur-xl">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <Gift className="h-6 w-6 text-secondary" />
                      <h3 className="text-lg font-bold text-foreground">{scholarship.nombre}</h3>
                    </div>
                    <p className="text-foreground/70 mb-4">
                      Información de beca disponible para estudiantes.
                    </p>
                    <div className="mb-4">
                      <p className="text-sm font-semibold text-foreground mb-2">Requisitos:</p>
                      <ul className="space-y-1 text-sm text-foreground/70">
                      <li className="flex items-center gap-2">
                        <span className="h-1.5 w-1.5 rounded-full bg-secondary"></span>
                        {scholarship.requisitos}
                      </li>
                    </ul>
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-end gap-3">
                    <div className="rounded-lg border border-secondary/20 bg-secondary/10 px-4 py-2">
                      <p className="text-xs text-foreground/70">Monto Mensual</p>
                      <p className="text-2xl font-bold text-secondary flex items-center gap-1">
                        
                        {scholarship.monto}
                      </p>
                    </div>
                    <Button className="bg-gradient-to-r from-primary to-secondary">
                      Solicitar
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Alertas Tab */}
        {tab === 'alertas' && (
          <div className="space-y-4">
            {alerts.map(alert => (
              <div
              key={alert.student}
              className="rounded-xl border border-red-500/20 bg-red-500/10 p-6 backdrop-blur-xl"
            >
              <div className="flex items-start gap-4">
                <AlertTriangle className="mt-1 h-5 w-5 text-red-400" />
            
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground">
                    {alert.student}
                  </h3>
            
                  <p className="text-sm text-foreground/80 mt-1">
                    {alert.message}
                  </p>
            
                  <p className="text-xs text-yellow-400 mt-2">
                    {alert.recommendation}
                  </p>
                </div>
              </div>
            </div>
            ))}
          </div>
        )}
      </div>
    </SidebarLayout>
  )
}
