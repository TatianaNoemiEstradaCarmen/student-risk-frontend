import { fetchStudents, fetchStudentById } from "../api/studentsApi";

export const getStudents = () => {
  return fetchStudents();
};

export const getStudentById = (id) => {
  return fetchStudentById(id);
};
