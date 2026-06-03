const tutoringRequests = [
  {
    id: 1,
    estudianteId: 1,
    codigoEstudiante: "2023001",
    estudiante: "Juan Pérez",
    motivo: "Bajo rendimiento académico",
    descripcion: "Necesito apoyo en matemáticas y organización de tiempos de estudio.",
    cursoRelacionado: "Matemática I",
    tipoOrientacion: "Académica",
    prioridad: "Alta",
    canal: "Presencial",
    fechaSolicitud: "2026-05-25",
    estado: "Pendiente",
    tutorAsignado: "Por asignar"
  },
  {
    id: 2,
    estudianteId: 3,
    codigoEstudiante: "2023003",
    estudiante: "Carlos Ramírez",
    motivo: "Dificultad para mantener asistencia regular",
    descripcion: "El estudiante solicita orientación para mejorar su asistencia y planificación semanal.",
    cursoRelacionado: "Contabilidad General",
    tipoOrientacion: "Tutoría académica",
    prioridad: "Media",
    canal: "Virtual",
    fechaSolicitud: "2026-05-26",
    estado: "En revisión",
    tutorAsignado: "Por asignar"
  }
]

export const fetchTutoringRequests = () => {
  return tutoringRequests
}

export const fetchTutoringRequestById = (id) => {
  return tutoringRequests.find((request) => request.id === id)
}
