import {
  fetchSupportProcedures,
  fetchSupportProcedureById,
  fetchSupportProceduresByStudentCode,
  fetchSupportProceduresByStatus
} from "../api/supportProceduresApi"

export const getSupportProcedures = () => {
  return fetchSupportProcedures()
}

export const getSupportProcedureById = (id) => {
  return fetchSupportProcedureById(id)
}

export const getSupportProceduresByStudentCode = (codigoEstudiante) => {
  return fetchSupportProceduresByStudentCode(codigoEstudiante)
}

export const getSupportProceduresByStatus = (estado) => {
  return fetchSupportProceduresByStatus(estado)
}
