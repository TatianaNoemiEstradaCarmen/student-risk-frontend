import { fetchScholarships, fetchScholarshipById } from "../api/scholarshipsApi"

export const getScholarships = () => {
  return fetchScholarships()
}

export const getScholarshipById = (id) => {
  return fetchScholarshipById(id)
}
