const supportProcedures = [
  {
    id: 1,
    codigoTramite: "TRM-2026-001",
    estudianteId: 1,
    codigoEstudiante: "2023001",
    estudiante: "Juan Pérez",
    tipoTramite: "Apoyo psicológico",
    descripcion: "Solicitud de orientación por estrés académico y carga de cursos.",
    areaResponsable: "Bienestar Universitario",
    canalAtencion: "Presencial",
    fechaSolicitud: "2026-06-01",
    fechaActualizacion: "2026-06-02",
    prioridad: "Alta",
    estado: "Pendiente",
    documentosRequeridos: ["Ficha de solicitud", "Reporte académico"],
    observacion: "El estudiante requiere seguimiento semanal."
  },
  {
    id: 2,
    codigoTramite: "TRM-2026-002",
    estudianteId: 3,
    codigoEstudiante: "2023003",
    estudiante: "Carlos Ramírez",
    tipoTramite: "Apoyo académico",
    descripcion: "Solicitud de acompañamiento por bajo rendimiento en cursos base.",
    areaResponsable: "Tutoría Académica",
    canalAtencion: "Virtual",
    fechaSolicitud: "2026-06-02",
    fechaActualizacion: "2026-06-02",
    prioridad: "Media",
    estado: "En revisión",
    documentosRequeridos: ["Historial de notas"],
    observacion: "Se recomienda asignar tutor académico."
  },
  {
    id: 3,
    codigoTramite: "TRM-2026-003",
    estudianteId: 2,
    codigoEstudiante: "2023002",
    estudiante: "María López",
    tipoTramite: "Apoyo económico",
    descripcion: "Consulta sobre orientación para acceder a programas de apoyo estudiantil.",
    areaResponsable: "Área de Becas",
    canalAtencion: "Presencial",
    fechaSolicitud: "2026-06-03",
    fechaActualizacion: "2026-06-03",
    prioridad: "Baja",
    estado: "Atendido",
    documentosRequeridos: ["Solicitud simple", "Declaración socioeconómica"],
    observacion: "La estudiante fue orientada sobre becas disponibles."
  }
]

export const fetchSupportProcedures = () => {
  return supportProcedures
}

export const fetchSupportProcedureById = (id) => {
  return supportProcedures.find((procedure) => procedure.id === id)
}

export const fetchSupportProceduresByStudentCode = (codigoEstudiante) => {
  return supportProcedures.filter((procedure) => procedure.codigoEstudiante === codigoEstudiante)
}

export const fetchSupportProceduresByStatus = (estado) => {
  return supportProcedures.filter((procedure) => procedure.estado === estado)
}
