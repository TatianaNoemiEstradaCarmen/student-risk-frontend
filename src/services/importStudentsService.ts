import { importStudents } from '@/src/api/importStudentsApi'

export const uploadStudents = async (students:any[]) => {
  return await importStudents(students)
}