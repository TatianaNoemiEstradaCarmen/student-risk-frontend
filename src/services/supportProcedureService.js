import {
  fetchSupportProcedures,
  fetchSupportProcedureById,
  fetchSupportProceduresByStatus
} from "../api/supportProceduresApi"

export const getSupportProcedures = () => {
  return fetchSupportProcedures()
}

export const getSupportProcedureById = (id) => {
  return fetchSupportProcedureById(id)
}

export const getSupportProceduresByStatus = (estado) => {
  return fetchSupportProceduresByStatus(estado)
}
