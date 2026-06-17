'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/src/lib/supabase'
import { FileText, Loader2 } from 'lucide-react'

export default function HistorialIntervenciones({ 
  estudianteId,
  refreshKey 
}: { 
  estudianteId: string | number;
  refreshKey: number;
}) {
  const [historial, setHistorial] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchHistorial() {
      setLoading(true)
      const { data, error } = await supabase
        .from('intervenciones_tutor')
        .select('*')
        .eq('estudiante_id', estudianteId)
        .order('fecha', { ascending: false }) // CRITERIO DE ACEPTACIÓN 3: Más reciente primero

      if (!error && data) {
        setHistorial(data)
      }
      setLoading(false)
    }

    if (estudianteId) {
      fetchHistorial()
    }
  }, [estudianteId, refreshKey])

  return (
    <div className="p-4 rounded-xl border border-primary/10 bg-background/20">
      <h4 className="text-xs font-semibold uppercase text-foreground/50 mb-3 flex items-center gap-1.5">
        <FileText className="h-3.5 w-3.5" /> Historial de Intervenciones
      </h4>
      
      <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
        {loading ? (
          <div className="flex items-center justify-center py-4 text-primary">
            <Loader2 className="h-5 w-5 animate-spin" />
          </div>
        ) : historial.length === 0 ? (
          <p className="text-xs text-foreground/40 italic py-2">
            No se registran acciones de acompañamiento previas para este estudiante.
          </p>
        ) : (
          historial.map((item) => {
            // SOLUCIÓN ZONA HORARIA: Extraemos solo el año, mes y día de la BD (YYYY-MM-DD)
            const fechaPura = item.fecha.split('T')[0];
            const [año, mes, dia] = fechaPura.split('-');
            
            // Forzamos a que cree la fecha local exacta ingresada por el usuario
            const fechaLocal = new Date(Number(año), Number(mes) - 1, Number(dia));
            const fechaFormateada = fechaLocal.toLocaleDateString('es-PE', {
              year: 'numeric', month: 'short', day: 'numeric'
            }).toUpperCase(); // Formato: "16 JUN. 2026"

            return (
              <div key={item.id} className="border-l-2 border-primary/40 pl-3 py-2 bg-primary/5 rounded-r-md pr-2">
                <div className="flex justify-between items-start mb-1">
                  <p className="text-[10px] text-foreground/50 font-semibold uppercase tracking-wider">
                    {fechaFormateada} — POR: {item.responsable}
                  </p>
                  <span className="text-[9px] bg-primary/10 text-primary px-1.5 py-0.5 rounded border border-primary/20 font-medium">
                    {item.tipo_accion}
                  </span>
                </div>
                {/* CRITERIO DE ACEPTACIÓN 2: Mostrar la observación */}
                <p className="text-xs text-foreground/90">{item.observacion}</p>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}