const scholarships = [
  {
    id: 1,
    nombre: "Beca Excelencia Académica",
    tipo: "Académica",
    monto: "S/ 800",
    requisitos: "Promedio mayor a 16 y matrícula activa",
    promedioMinimo: 16,
    cupos: 10,
    fechaInicio: "2026-05-25",
    fechaFin: "2026-06-30",
    estado: "Disponible",
    responsable: "Oficina de Bienestar Universitario"
  },
  {
    id: 2,
    nombre: "Beca Apoyo Económico",
    tipo: "Socioeconómica",
    monto: "S/ 500",
    requisitos: "Situación vulnerable acreditada y asistencia mayor a 70%",
    promedioMinimo: 12,
    cupos: 15,
    fechaInicio: "2026-05-25",
    fechaFin: "2026-06-30",
    estado: "Disponible",
    responsable: "Área de Becas"
  }
]

export const fetchScholarships = () => {
  return scholarships
}

export const fetchScholarshipById = (id) => {
  return scholarships.find((scholarship) => scholarship.id === id)
}
