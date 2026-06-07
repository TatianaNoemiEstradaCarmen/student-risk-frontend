const academicRecommendations = [
  {
    id: 1,
    situacion: "acompanamiento",
    titulo: "Organiza un plan semanal de estudio",
    descripcion: "Te recomendamos separar espacios cortos de estudio durante la semana para reforzar los cursos que requieren mayor práctica.",
    accion: "Crear un horario de repaso de 30 a 45 minutos por curso.",
    tipo: "Organización académica"
  },
  {
    id: 2,
    situacion: "acompanamiento",
    titulo: "Solicita una sesión de tutoría académica",
    descripcion: "Puedes recibir orientación personalizada para resolver dudas y mejorar tu avance en los cursos.",
    accion: "Registrar una solicitud de tutoría desde el módulo correspondiente.",
    tipo: "Tutoría académica"
  },
  {
    id: 3,
    situacion: "acompanamiento",
    titulo: "Revisa tus avances por curso",
    descripcion: "Identificar tus cursos con mayor carga te ayudará a priorizar mejor tus actividades académicas.",
    accion: "Revisar notas, asistencia y tareas pendientes cada semana.",
    tipo: "Seguimiento académico"
  },
  {
    id: 4,
    situacion: "acompanamiento",
    titulo: "Utiliza recursos de apoyo institucional",
    descripcion: "La universidad cuenta con espacios de apoyo que pueden ayudarte a fortalecer tu desempeño académico.",
    accion: "Consultar becas, tutorías, asesorías y servicios de acompañamiento.",
    tipo: "Apoyo estudiantil"
  }
]

export const fetchAcademicRecommendations = () => {
  return academicRecommendations
}

export const fetchAcademicRecommendationsBySituation = (situacion) => {
  return academicRecommendations.filter(
    (recommendation) => recommendation.situacion === situacion
  )
}
