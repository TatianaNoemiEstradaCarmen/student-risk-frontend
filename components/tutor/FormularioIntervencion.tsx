'use client'

import { useState } from 'react'
import { supabase } from '@/src/lib/supabase'
import { Send, AlertCircle, CheckCircle } from 'lucide-react'

export default function FormularioIntervencion({ 
  estudianteId, 
  nombreEstudiante, 
  onGuardado 
}: { 
  estudianteId: number; 
  nombreEstudiante: string;
  onGuardado: () => void;
}) {
  const [tipoAccion, setTipoAccion] = useState('')
  const [observacion, setObservacion] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [exito, setExito] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setExito(false)

    // PRUEBA DE ACEPTACIÓN 2: Validar que no se permita guardar vacío
    if (!tipoAccion || !observacion.trim()) {
      setError('Debes seleccionar el tipo de acción y escribir una observación.')
      return
    }

    setIsSubmitting(true)

    try {
      // PRUEBA DE ACEPTACIÓN 3: Que quede asociada al estudiante correcto
      const { error: dbError } = await supabase
        .from('intervenciones_tutor')
        .insert([
          {
            estudiante_id: estudianteId,
            tipo_accion: tipoAccion,
            observacion: observacion.trim(),
            // Por ahora lo dejamos fijo, luego se conecta con el login real
            responsable: 'Tutor Académico' 
          }
        ])

      if (dbError) throw dbError

      setExito(true)
      setTipoAccion('')
      setObservacion('')
      
      // Avisamos al componente padre que se guardó para que actualice la lista (HU-11)
      setTimeout(() => {
        setExito(false)
        onGuardado()
      }, 2000)

    } catch (err: any) {
      setError('Error de conexión al guardar la acción.')
      console.error(err)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="mt-4 rounded-xl border border-primary/20 bg-card/40 p-5 backdrop-blur-xl">
      <h4 className="mb-4 text-sm font-semibold uppercase text-primary">
        Registrar Nueva Intervención
      </h4>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Selector de Tipo de Acción */}
        <div>
          <label className="mb-1 block text-xs text-foreground/70">Tipo de Acción</label>
          <select
            value={tipoAccion}
            onChange={(e) => setTipoAccion(e.target.value)}
            className="w-full rounded-md border border-primary/20 bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
          >
            <option value="">-- Selecciona una acción --</option>
            <option value="Reunión Virtual">Reunión Virtual</option>
            <option value="Reunión Presencial">Reunión Presencial</option>
            <option value="Llamada Telefónica">Llamada Telefónica</option>
            <option value="Correo Enviado">Correo Enviado</option>
            <option value="Mensaje de WhatsApp">Mensaje de WhatsApp</option>
          </select>
        </div>

        {/* Área de Observación */}
        <div>
          <label className="mb-1 block text-xs text-foreground/70">Observación / Acuerdos</label>
          <textarea
            value={observacion}
            onChange={(e) => setObservacion(e.target.value)}
            rows={3}
            placeholder={`Escribe los detalles del seguimiento con ${nombreEstudiante}...`}
            className="w-full resize-none rounded-md border border-primary/20 bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>

        {/* Mensajes de Error o Éxito */}
        {error && (
          <div className="flex items-center gap-2 rounded-md bg-red-500/10 p-2 text-xs text-red-400">
            <AlertCircle className="h-4 w-4" /> {error}
          </div>
        )}
        {exito && (
          <div className="flex items-center gap-2 rounded-md bg-green-500/10 p-2 text-xs text-green-400">
            <CheckCircle className="h-4 w-4" /> ¡Acción registrada correctamente!
          </div>
        )}

        {/* Botón Guardar */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex w-full items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
        >
          <Send className="h-4 w-4" />
          {isSubmitting ? 'Guardando...' : 'Guardar Intervención'}
        </button>
      </form>
    </div>
  )
}