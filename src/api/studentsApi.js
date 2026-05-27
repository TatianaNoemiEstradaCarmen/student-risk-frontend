const students = [
  {
    id: 1,
    name: "Juan Pérez",
    gpa: 10,
    attendance: 45,
    risk: "HIGH",
  },
  {
    id: 2,
    name: "María López",
    gpa: 17,
    attendance: 92,
    risk: "LOW",
  },
  {
    id: 3,
    name: "Carlos Ramírez",
    gpa: 13,
    attendance: 70,
    risk: "MEDIUM",
  },
];

export const fetchStudents = () => {
  return students;
};

export const fetchStudentById = (id) => {
  return students.find((student) => student.id === id);
};
