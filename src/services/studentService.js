import { fetchStudents, fetchStudentById, fetchStudentByCode } from "../api/studentsApi"

export const getStudents = () => {
  return fetchStudents()
}

export const getStudentById = (id) => {
  return fetchStudentById(id)
}

export const getStudentByCode = (codigo) => {
  return fetchStudentByCode(codigo)
}
