// 1. Datos crudos (Simulando la ingesta desde una base de datos)
const rawStudents = [
    { id: 1, name: "Juan Pérez", gpa: 10, attendance: 45 },
    { id: 2, name: "María López", gpa: 17, attendance: 92 },
    { id: 3, name: "Carlos Mendoza", gpa: 11, attendance: 85 },
    { id: 4, name: "Ana Silva", gpa: 14, attendance: 65 },
    { id: 5, name: "Luis Vargas", gpa: 13, attendance: 55 }
  ];
  
  // 2. Lógica Fake IA (Tus reglas de clasificación de riesgo)
  const calculateRisk = (gpa, attendance) => {
    // Regla crítica: Asistencia menor a 60% o promedio menor a 12
    if (attendance < 60 || gpa < 12) {
      return "HIGH";
    }
    // Regla media (opcional para dar más realismo al dashboard)
    if ((attendance >= 60 && attendance <= 75) || (gpa >= 12 && gpa <= 13)) {
      return "MEDIUM";
    }
    // Si no cumple las anteriores, el alumno está bien
    return "LOW";
  };
  
  // 3. Procesamiento y exportación de datos para el Frontend
  export const students = rawStudents.map(student => ({
    ...student,
    risk: calculateRisk(student.gpa, student.attendance)
  }));