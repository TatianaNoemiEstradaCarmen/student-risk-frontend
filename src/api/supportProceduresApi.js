const supportProcedures = [
  {
    id: 1,
    codigoTramite: "TRM-2026-001",
    nombreTramite: "Apoyo psicológico",
    descripcion: "Solicitud de orientación por estrés académico y carga de cursos.",
    requisitos: "Ficha de solicitud y reporte académico",
    areaResponsable: "Bienestar Universitario",
    canalAtencion: "Presencial",
    fechaSolicitud: "2026-06-01",
    prioridad: "Alta",
    estado: "Pendiente"
  },
  {
    id: 2,
    codigoTramite: "TRM-2026-002",
    nombreTramite: "Apoyo académico",
    descripcion: "Solicitud de acompañamiento por bajo rendimiento en cursos base.",
    requisitos: "Historial de notas actualizado",
    areaResponsable: "Tutoría Académica",
    canalAtencion: "Virtual",
    fechaSolicitud: "2026-06-02",
    prioridad: "Media",
    estado: "En revisión"
  },
  {
    id: 3,
    codigoTramite: "TRM-2026-003",
    nombreTramite: "Apoyo económico",
    descripcion: "Orientación para acceder a programas de apoyo estudiantil.",
    requisitos: "Solicitud simple y declaración socioeconómica",
    areaResponsable: "Área de Becas",
    canalAtencion: "Presencial",
    fechaSolicitud: "2026-06-03",
    prioridad: "Baja",
    estado: "Atendido"
  }
]

export const fetchSupportProcedures = () => {
  return supportProcedures
}

export const fetchSupportProcedureById = (id) => {
  return supportProcedures.find((procedure) => procedure.id === id)
}

export const fetchSupportProceduresByStatus = (estado) => {
  return supportProcedures.filter((procedure) => procedure.estado === estado)
}
