import { fetchInterviewFindings, fetchInterviewFindingById } from "../api/interviewsApi"

export const getInterviewFindings = () => {
  return fetchInterviewFindings()
}

export const getInterviewFindingById = (id) => {
  return fetchInterviewFindingById(id)
}
