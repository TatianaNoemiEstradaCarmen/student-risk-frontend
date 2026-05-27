const students = [
  {
    id: 1,
    codigo: "2023001",
    dni: "74859621",
    name: "Juan Pérez",
    correo: "juan@universidad.edu",
    telefono: "987654321",
    ciclo: "5to ciclo",
    carrera: "Ingeniería de Sistemas",
    sede: "Lima",
    modalidad: "Presencial",
    estadoMatricula: "Activo",
    fechaRegistro: "2026-05-25",
    gpa: 10,
    attendance: 45,
    creditosAprobados: 72,
    risk: "HIGH",
    role: "student"
  },
  {
    id: 2,
    codigo: "2023002",
    dni: "70124589",
    name: "María López",
    correo: "maria@universidad.edu",
    telefono: "912345678",
    ciclo: "7mo ciclo",
    carrera: "Administración",
    sede: "Lima",
    modalidad: "Virtual",
    estadoMatricula: "Activo",
    fechaRegistro: "2026-05-25",
    gpa: 17,
    attendance: 92,
    creditosAprobados: 128,
    risk: "LOW",
    role: "student"
  },
  {
    id: 3,
    codigo: "2023003",
    dni: "73214568",
    name: "Carlos Ramírez",
    correo: "carlos@universidad.edu",
    telefono: "956789123",
    ciclo: "3er ciclo",
    carrera: "Contabilidad",
    sede: "Lima",
    modalidad: "Presencial",
    estadoMatricula: "Activo",
    fechaRegistro: "2026-05-25",
    gpa: 13,
    attendance: 70,
    creditosAprobados: 42,
    risk: "MEDIUM",
    role: "student"
  }
]

export const fetchStudents = () => {
  return students
}

export const fetchStudentById = (id) => {
  return students.find((student) => student.id === id)
}

export const fetchStudentByCode = (codigo) => {
  return students.find((student) => student.codigo === codigo)
}
