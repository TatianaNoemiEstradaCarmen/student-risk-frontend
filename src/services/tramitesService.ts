import { supabase } from '@/src/lib/supabase'

export async function getTramites() {
  const { data, error } = await supabase
    .from('tramites_apoyo')
    .select('*')

  if (error) {
    console.error(error)
    return []
  }

  return data
}