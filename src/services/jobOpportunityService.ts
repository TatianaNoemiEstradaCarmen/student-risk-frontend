import { getSupabaseClient } from '@/lib/supabase/client'

const TABLE_NAME = 'oportunidades_laborales'

export type JobModality = 'PRESENCIAL' | 'REMOTO' | 'HIBRIDO'
export type JobStatus = 'ACTIVA' | 'INACTIVA'

export interface JobOpportunity {
  id: number
  empresa: string
  cargo: string
  modalidad: JobModality
  descripcion: string
  estado: JobStatus
  created_at: string
}

export interface NewJobOpportunity {
  empresa: string
  cargo: string
  modalidad: JobModality
  descripcion: string
}

export async function getJobOpportunities(): Promise<JobOpportunity[]> {
  const supabase = getSupabaseClient()

  const { data, error } = await supabase
    .from(TABLE_NAME)
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    throw new Error(`Error consultando oportunidades: ${error.message}`)
  }

  return (data ?? []) as JobOpportunity[]
}

export async function createJobOpportunity(
  opportunity: NewJobOpportunity
): Promise<JobOpportunity> {
  const supabase = getSupabaseClient()

  const { data, error } = await supabase
    .from(TABLE_NAME)
    .insert([
      {
        empresa: opportunity.empresa.trim(),
        cargo: opportunity.cargo.trim(),
        modalidad: opportunity.modalidad,
        descripcion: opportunity.descripcion.trim(),
        estado: 'ACTIVA',
      },
    ])
    .select()
    .single()

  if (error) {
    throw new Error(`Error publicando oportunidad: ${error.message}`)
  }

  return data as JobOpportunity
}
