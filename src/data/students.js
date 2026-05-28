// 1. Datos simulados de estudiantes con campos extendidos para las tablas
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
    role: "student"
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
    role: "student"
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
    role: "student"
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
    role: "student"
  }
];

// 2. Lógica de clasificación del nivel de riesgo (Árbol de decisión)
const calculateRisk = (gpa, attendance) => {
  if (attendance < 60 || gpa < 12) {
    return "HIGH";
  }

  if (
    (attendance >= 60 && attendance <= 75) ||
    (gpa >= 12 && gpa <= 13)
  ) {
    return "MEDIUM";
  }

  return "LOW";
};

// 3. Motor de recomendaciones automáticas según el nivel de riesgo
const generateRecommendation = (risk) => {
  switch (risk) {
    case "HIGH":
      return "Requiere intervención inmediata";
    case "MEDIUM":
      return "Necesita seguimiento académico";
    default:
      return "Rendimiento estable";
  }
};

// 4. Exportación de la data procesada con riesgo e intervención inyectada
export const students = rawStudents.map((student) => {
  const risk = calculateRisk(student.gpa, student.attendance);

  return {
    ...student,
    risk,
    recommendation: generateRecommendation(risk)
  };
});

// 5. Estadísticas consolidadas para alimentar los gráficos del Dashboard (HU-25)
export const riskStats = {
  high: students.filter((s) => s.risk === "HIGH").length,
  medium: students.filter((s) => s.risk === "MEDIUM").length,
  low: students.filter((s) => s.risk === "LOW").length,
};

// 6. Triggers de alertas para el panel de monitoreo preventivo (HU-26)
export const alerts = students
  .filter((student) => student.risk === "HIGH")
  .map((student) => ({
    student: student.name,
    message: "Riesgo alto de deserción",
    recommendation: student.recommendation,
  }));