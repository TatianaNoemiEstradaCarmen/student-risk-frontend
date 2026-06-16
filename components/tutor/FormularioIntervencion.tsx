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
  // Inicializamos la fecha con el día de hoy por comodidad
  const hoy = new Date().toISOString().split('T')[0]
  const [fecha, setFecha] = useState(hoy)
  const [tipoAccion, setTipoAccion] = useState('')
  const [observacion, setObservacion] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [exito, setExito] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setExito(false)

    // PRUEBA DE ACEPTACIÓN 2: Validar que no se permita guardar vacío (ahora incluye la fecha)
    if (!fecha || !tipoAccion || !observacion.trim()) {
      setError('Debes ingresar la fecha, el tipo de acción y escribir una observación.')
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
            fecha: fecha, // <-- Ahora enviamos la fecha elegida por el tutor
            tipo_accion: tipoAccion,
            observacion: observacion.trim(),
            responsable: 'Tutor Académico' 
          }
        ])

      if (dbError) throw dbError

      setExito(true)
      setTipoAccion('')
      setObservacion('')
      setFecha(hoy) // Reseteamos a la fecha actual
      
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
        
        <div className="grid grid-cols-2 gap-4">
          {/* NUEVO: Selector de Fecha */}
          <div>
            <label className="mb-1 block text-xs text-foreground/70">Fecha de la acción</label>
            <input
              type="date"
              value={fecha}
              onChange={(e) => setFecha(e.target.value)}
              className="w-full rounded-md border border-primary/20 bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>

          {/* Selector de Tipo de Acción */}
          <div>
            <label className="mb-1 block text-xs text-foreground/70">Tipo de Acción</label>
            <select
              value={tipoAccion}
              onChange={(e) => setTipoAccion(e.target.value)}
              className="w-full rounded-md border border-primary/20 bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
            >
              <option value="">-- Selecciona --</option>
              <option value="Reunión Virtual">Reunión Virtual</option>
              <option value="Reunión Presencial">Reunión Presencial</option>
              <option value="Llamada Telefónica">Llamada Telefónica</option>
              <option value="Correo Enviado">Correo Enviado</option>
              <option value="Mensaje de WhatsApp">Mensaje de WhatsApp</option>
            </select>
          </div>
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