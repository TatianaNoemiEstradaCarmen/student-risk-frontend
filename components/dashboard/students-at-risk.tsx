import { TrendingDown } from 'lucide-react';

interface Student {
  id: string;
  nombre: string;
  carrera: string;
  riesgo: number;
  estado: 'crítico' | 'alto' | 'medio';
  razonPrincipal: string;
}

const students: Student[] = [
  {
    id: '1',
    nombre: 'Juan Martinez García',
    carrera: 'Ingeniería Informática',
    riesgo: 95,
    estado: 'crítico',
    razonPrincipal: 'Inasistencia',
  },
  {
    id: '2',
    nombre: 'Carlos Díaz Martínez',
    carrera: 'Administración',
    riesgo: 87,
    estado: 'crítico',
    razonPrincipal: 'Bajo desempeño académico',
  },
  {
    id: '3',
    nombre: 'María López Rodríguez',
    carrera: 'Psicología',
    riesgo: 72,
    estado: 'alto',
    razonPrincipal: 'Desempeño fluctuante',
  },
  {
    id: '4',
    nombre: 'Luis Fernández Gómez',
    carrera: 'Contabilidad',
    riesgo: 65,
    estado: 'alto',
    razonPrincipal: 'Falta de participación',
  },
  {
    id: '5',
    nombre: 'Sofia Rodríguez Peña',
    carrera: 'Educación',
    riesgo: 58,
    estado: 'medio',
    razonPrincipal: 'Cambios de comportamiento',
  },
];

const getRiskColor = (estado: Student['estado']) => {
  switch (estado) {
    case 'crítico':
      return 'bg-destructive/10 text-destructive';
    case 'alto':
      return 'bg-accent/10 text-accent';
    case 'medio':
      return 'bg-primary/10 text-primary';
  }
};

const getRiskLabel = (estado: Student['estado']) => {
  switch (estado) {
    case 'crítico':
      return 'Crítico';
    case 'alto':
      return 'Alto';
    case 'medio':
      return 'Medio';
  }
};

export function StudentsAtRisk() {
  return (
    <div className="bg-card border border-border rounded-xl p-6 backdrop-blur-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-foreground">Estudiantes en Riesgo</h3>
        <button className="text-accent hover:text-accent/80 text-sm font-medium transition-colors">
          Ver más →
        </button>
      </div>

      <div className="space-y-3">
        {students.map((student) => (
          <div
            key={student.id}
            className="flex items-center justify-between p-4 rounded-lg bg-primary/5 border border-border/50 hover:border-primary/30 transition-all cursor-pointer hover:bg-primary/10"
          >
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h4 className="font-medium text-foreground text-sm">{student.nombre}</h4>
                <span className={`text-xs font-semibold px-2 py-1 rounded-full ${getRiskColor(student.estado)}`}>
                  {getRiskLabel(student.estado)}
                </span>
              </div>
              <div className="flex items-center gap-4 mt-2">
                <p className="text-xs text-muted-foreground">{student.carrera}</p>
                <p className="text-xs text-muted-foreground">Causa: {student.razonPrincipal}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-right">
                <div className="text-lg font-bold text-destructive">{student.riesgo}%</div>
                <div className="flex items-center gap-1 text-xs text-destructive">
                  <TrendingDown className="w-3 h-3" />
                  <span>Riesgo</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
