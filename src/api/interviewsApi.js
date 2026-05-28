const interviewFindings = [
  {
    id: 1,
    estudianteId: 1,
    codigoEstudiante: "2023001",
    estudiante: "Juan Pérez",
    fechaEntrevista: "2026-05-26",
    entrevistador: "Coordinador Académico",
    problema: "Falta de tiempo",
    necesidad: "Mayor acompañamiento académico",
    motivacion: "Terminar la carrera",
    categoriaHallazgo: "Académico",
    nivelRiesgoObservado: "Alto",
    accionesRecomendadas: "Asignar tutor académico y seguimiento semanal",
    estadoSeguimiento: "Pendiente"
  },
  {
    id: 2,
    estudianteId: 3,
    codigoEstudiante: "2023003",
    estudiante: "Carlos Ramírez",
    fechaEntrevista: "2026-05-26",
    entrevistador: "Área de Tutoría",
    problema: "Inasistencia recurrente",
    necesidad: "Orientación para planificación de horarios",
    motivacion: "Mejorar su rendimiento académico",
    categoriaHallazgo: "Asistencia",
    nivelRiesgoObservado: "Medio",
    accionesRecomendadas: "Programar sesión de orientación y evaluar becas disponibles",
    estadoSeguimiento: "En revisión"
  }
]

export const fetchInterviewFindings = () => {
  return interviewFindings
}

export const fetchInterviewFindingById = (id) => {
  return interviewFindings.find((finding) => finding.id === id)
}
