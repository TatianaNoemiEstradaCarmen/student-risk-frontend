import { fetchTutoringRequests, fetchTutoringRequestById } from "../api/tutoringApi"

export const getTutoringRequests = () => {
  return fetchTutoringRequests()
}

export const getTutoringRequestById = (id) => {
  return fetchTutoringRequestById(id)
}
