import {
  fetchAcademicRecommendations,
  fetchAcademicRecommendationsBySituation
} from "../api/academicRecommendationsApi"

export const getAcademicRecommendations = () => {
  return fetchAcademicRecommendations()
}

export const getAcademicRecommendationsBySituation = (situacion) => {
  return fetchAcademicRecommendationsBySituation(situacion)
}
