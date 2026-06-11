import { supabase } from '@/src/lib/supabase'

export const fetchScholarships = async () => {
  const { data, error } = await supabase
    .from('becas')
    .select('*')
    .eq('estado', 'Activa')

  if (error) {
    console.error(error)
    return []
  }

  return data
}

export const fetchScholarshipById = async (id) => {
  const { data, error } = await supabase
    .from('becas')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    console.error(error)
    return null
  }

  return data
}