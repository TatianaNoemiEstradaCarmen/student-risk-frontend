import { supabase } from '@/src/lib/supabase'

export const importStudents = async (students:any[]) => {
  const { data, error } = await supabase
    .from('estudiantes')
    .insert(students)

  if(error){
    throw error
  }

  return data
}