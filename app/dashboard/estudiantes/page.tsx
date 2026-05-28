'use client';

import { Search, Filter } from 'lucide-react';
import { useState } from 'react';

interface StudentRecord {
  id: string;
  nombre: string;
  matricula: string;
  carrera: string;
  promedio: number;
  asistencia: number;
  estado: 'seguro' | 'riesgo' | 'crítico';
}

const students: StudentRecord[] = [
  {
    id: '1',
    nombre: 'Juan Martinez García',
    matricula: 'MAT-2021-001',
    carrera: 'Ingeniería Informática',
    promedio: 3.2,
    asistencia: 65,
    estado: 'crítico',
  },
  {
    id: '2',
    nombre: 'María López Rodríguez',
    matricula: 'MAT-2021-002',
    carrera: 'Psicología',
    promedio: 3.8,
    asistencia: 92,
    estado: 'seguro',
  },
  {
    id: '3',
    nombre: 'Carlos Díaz Martínez',
    matricula: 'MAT-2021-003',
    carrera: 'Administración',
    promedio: 2.9,
    asistencia: 72,
    estado: 'crítico',
  },
  {
    id: '4',
    nombre: 'Ana Fernández López',
    matricula: 'MAT-2021-004',
    carrera: 'Educación',
    promedio: 4.0,
    asistencia: 98,
    estado: 'seguro',
  },
  {
    id: '5',
    nombre: 'Luis Gómez Ruiz',
    matricula: 'MAT-2021-005',
    carrera: 'Contabilidad',
    promedio: 3.5,
    asistencia: 78,
    estado: 'riesgo',
  },
];

export default function EstudiantesPage() {
  const [searchTerm, setSearchTerm] = useState('');

  const getEstadoColor = (estado: StudentRecord['estado']) => {
    switch (estado) {
      case 'crítico':
        return 'bg-destructive/10 text-destructive';
      case 'riesgo':
        return 'bg-accent/10 text-accent';
      case 'seguro':
        return 'bg-primary/10 text-primary';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Estudiantes</h1>
        <p className="text-muted-foreground mt-1">Gestiona y monitorea a todos tus estudiantes</p>
      </div>

      <div className="bg-card border border-border rounded-xl p-6 backdrop-blur-sm">
        <div className="flex flex-col gap-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Buscar por nombre o matrícula..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-input border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/50"
              />
            </div>
            <button className="flex items-center gap-2 px-4 py-2 bg-input border border-border rounded-lg text-foreground hover:bg-primary/10 transition-colors">
              <Filter className="w-5 h-5" />
              <span>Filtros</span>
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-4 font-semibold text-muted-foreground">
                  Nombre
                </th>
                <th className="text-left py-3 px-4 font-semibold text-muted-foreground">
                  Matrícula
                </th>
                <th className="text-left py-3 px-4 font-semibold text-muted-foreground">
                  Carrera
                </th>
                <th className="text-center py-3 px-4 font-semibold text-muted-foreground">
                  Promedio
                </th>
                <th className="text-center py-3 px-4 font-semibold text-muted-foreground">
                  Asistencia
                </th>
                <th className="text-left py-3 px-4 font-semibold text-muted-foreground">
                  Estado
                </th>
              </tr>
            </thead>
            <tbody>
              {students.map((student) => (
                <tr
                  key={student.id}
                  className="border-b border-border/50 hover:bg-primary/5 transition-colors cursor-pointer"
                >
                  <td className="py-4 px-4 text-foreground font-medium">{student.nombre}</td>
                  <td className="py-4 px-4 text-muted-foreground text-sm">{student.matricula}</td>
                  <td className="py-4 px-4 text-muted-foreground text-sm">{student.carrera}</td>
                  <td className="py-4 px-4 text-center">
                    <span className="font-semibold text-foreground">{student.promedio.toFixed(1)}</span>
                  </td>
                  <td className="py-4 px-4 text-center">
                    <span className="font-semibold text-foreground">{student.asistencia}%</span>
                  </td>
                  <td className="py-4 px-4">
                    <span
                      className={`text-xs font-bold px-3 py-1 rounded-full ${getEstadoColor(
                        student.estado
                      )}`}
                    >
                      {student.estado === 'crítico'
                        ? 'Crítico'
                        : student.estado === 'riesgo'
                          ? 'Riesgo'
                          : 'Seguro'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
