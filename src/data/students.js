// 1. Datos simulados con Historial de Seguimiento (Para Criterio 3 de HU-03)
const rawStudents = [
  {
    id: 1,
    codigo: "2023001",
    name: "Juan Pérez",
    correo: "juan@universidad.edu",
    ciclo: "5to ciclo",
    carrera: "Ingeniería de Sistemas",
    gpa: 10,
    attendance: 45,
    role: "student",
    historialSeguimiento: [
      { fecha: "2026-05-20", nota: "Derivación a tutoría académica por bajas notas." },
      { fecha: "2026-05-28", nota: "No se presentó a la sesión programada." }
    ]
  },
  {
    id: 2,
    codigo: "2023002",
    name: "María López",
    correo: "maria@universidad.edu",
    ciclo: "7mo ciclo",
    carrera: "Administración",
    gpa: 17,
    attendance: 92,
    role: "student",
    historialSeguimiento: [] // Sin problemas previos
  },
  {
    id: 3,
    codigo: "2023003",
    name: "Carlos Mendoza",
    correo: "carlos@universidad.edu",
    ciclo: "3er ciclo",
    carrera: "Contabilidad",
    gpa: 11,
    attendance: 85,
    role: "student",
    historialSeguimiento: [
      { fecha: "2026-05-15", nota: "Se le asignó un plan de nivelación en matemáticas." }
    ]
  },
  {
    id: 4,
    codigo: "2023004",
    name: "Ana Silva",
    correo: "ana@universidad.edu",
    ciclo: "6to ciclo",
    carrera: "Psicología",
    gpa: 14,
    attendance: 65,
    role: "student",
    historialSeguimiento: []
  }
];

// 2. Lógica de clasificación del nivel de riesgo
const calculateRisk = (gpa, attendance) => {
  if (attendance < 60 || gpa < 12) return "HIGH";
  if ((attendance >= 60 && attendance <= 75) || (gpa >= 12 && gpa <= 13)) return "MEDIUM";
  return "LOW";
};

// 3. Recomendaciones automáticas
const generateRecommendation = (risk) => {
  switch (risk) {
    case "HIGH": return "Requiere intervención inmediata";
    case "MEDIUM": return "Necesita seguimiento académico";
    default: return "Rendimiento estable";
  }
};

// 4. Exportación de la data procesada (Criterio 2 y 3 de HU-03)
export const students = rawStudents.map((student) => {
  const risk = calculateRisk(student.gpa, student.attendance);
  return {
    ...student,
    risk,
    recommendation: generateRecommendation(risk)
  };
});

// 5. Estadísticas y Alertas para el Dashboard
export const riskStats = {
  high: students.filter((s) => s.risk === "HIGH").length,
  medium: students.filter((s) => s.risk === "MEDIUM").length,
  low: students.filter((s) => s.risk === "LOW").length,
};

export const alerts = students
  .filter((student) => student.risk === "HIGH")
  .map((student) => ({
    student: student.name,
    message: "Riesgo alto de deserción",
    recommendation: student.recommendation,
  }));

// 6. Motor de Búsqueda para el Tutor (Cumple Criterio 1 de HU-03)
export const findStudentProfile = (searchTerm) => {
  if (!searchTerm) return null;
  const term = searchTerm.toString().toLowerCase();
  
  return students.find(student => 
    student.codigo.toLowerCase().includes(term) || 
    student.name.toLowerCase().includes(term)
  );
};