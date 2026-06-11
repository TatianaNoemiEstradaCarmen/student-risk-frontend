import { fetchScholarships, fetchScholarshipById } from "../api/scholarshipsApi"

export const getScholarships = async () => {
  return await fetchScholarships()
}

export const getScholarshipById = async (id) => {
  return await fetchScholarshipById(id)
}