'use client'

import { useState } from 'react'
import { supabase } from '@/src/lib/supabase'
import { Loader2 } from 'lucide-react'

export default function SelectorEstadoAlerta({ 
  alertaId, 
  estadoInicial, 
  onActualizado 
}: { 
  alertaId: number; 
  estadoInicial: string; 
  onActualizado: () => void;
}) {
  const [loading, setLoading] = useState(false)

  const cambiarEstado = async (nuevoEstado: string) => {
    setLoading(true)
    
    // 1. Enviamos el nuevo valor directo a la base de datos
    const { error } = await supabase
      .from('alertas_academicas')
      .update({ estado: nuevoEstado })
      .eq('id', alertaId)

    if (!error) {
      // 2. Avisamos al padre (page.tsx) para que descargue los datos frescos
      onActualizado() 
    } else {
      console.error("Error al actualizar:", error)
    }
    
    setLoading(false)
  }

  // Normalizamos el texto en minúsculas para que el <select> siempre lo reconozca sin errores
  const valorSeguro = estadoInicial?.toLowerCase() || 'pendiente'

  return (
    <div className="flex items-center gap-2">
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin text-primary" />
      ) : (
        <select
          value={valorSeguro} // Ahora el valor es 100% fiel a la base de datos
          onChange={(e) => cambiarEstado(e.target.value)}
          className="text-xs rounded-full border border-primary/20 bg-background px-2 py-1 text-foreground focus:ring-1 focus:ring-primary cursor-pointer"
        >
          <option value="pendiente">Pendiente</option>
          <option value="en atención">En atención</option>
          <option value="finalizada">Finalizada</option>
        </select>
      )}
    </div>
  )
}