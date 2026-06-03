'use client';

import { AlertTriangle, AlertCircle, CheckCircle, Filter } from 'lucide-react';
import { useState } from 'react';

interface AlertItem {
  id: string;
  estudiante: string;
  matricula: string;
  tipo: 'crítico' | 'advertencia' | 'información';
  mensaje: string;
  fecha: string;
  accion: string;
}

const alerts: AlertItem[] = [
  {
    id: '1',
    estudiante: 'Juan Martinez García',
    matricula: 'MAT-2021-001',
    tipo: 'crítico',
    mensaje: '4 inasistencias consecutivas detectadas en las últimas 2 semanas',
    fecha: '2024-05-25',
    accion: 'Contacto inmediato requerido',
  },
  {
    id: '2',
    estudiante: 'Carlos Díaz Martínez',
    matricula: 'MAT-2021-003',
    tipo: 'crítico',
    mensaje: 'Riesgo de deserción - Patrón de comportamiento anómalo detectado por IA',
    fecha: '2024-05-24',
    accion: 'Reunión académica programada',
  },
  {
    id: '3',
    estudiante: 'María López Rodríguez',
    matricula: 'MAT-2021-002',
    tipo: 'advertencia',
    mensaje: 'Calificaciones por debajo del 60% en las últimas 2 evaluaciones',
    fecha: '2024-05-23',
    accion: 'Tutoría recomendada',
  },
  {
    id: '4',
    estudiante: 'Luis Gómez Ruiz',
    matricula: 'MAT-2021-005',
    tipo: 'advertencia',
    mensaje: 'Disminución en la participación en clase - 3 sesiones sin intervenciones',
    fecha: '2024-05-22',
    accion: 'Seguimiento recomendado',
  },
  {
    id: '5',
    estudiante: 'Ana Fernández López',
    matricula: 'MAT-2021-004',
    tipo: 'información',
    mensaje: 'Mejora significativa en desempeño académico - +15 puntos en calificación',
    fecha: '2024-05-21',
    accion: 'Felicitación registrada',
  },
];

const getAlertIcon = (tipo: AlertItem['tipo']) => {
  switch (tipo) {
    case 'crítico':
      return <AlertTriangle className="w-5 h-5" />;
    case 'advertencia':
      return <AlertCircle className="w-5 h-5" />;
    case 'información':
      return <CheckCircle className="w-5 h-5" />;
  }
};

const getAlertColor = (tipo: AlertItem['tipo']) => {
  switch (tipo) {
    case 'crítico':
      return 'bg-destructive/10 border-destructive/30 text-destructive';
    case 'advertencia':
      return 'bg-accent/10 border-accent/30 text-accent';
    case 'información':
      return 'bg-primary/10 border-primary/30 text-primary';
  }
};

export default function AlertasPage() {
  const [selectedType, setSelectedType] = useState<'todos' | 'crítico' | 'advertencia' | 'información'>(
    'todos'
  );

  const filteredAlerts =
    selectedType === 'todos' ? alerts : alerts.filter((alert) => alert.tipo === selectedType);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Alertas</h1>
        <p className="text-muted-foreground mt-1">
          Gestiona todas las alertas y notificaciones del sistema
        </p>
      </div>

      <div className="bg-card border border-border rounded-xl p-6 backdrop-blur-sm">
        <div className="flex flex-col sm:flex-row items-center gap-4 mb-6">
          <div className="flex gap-2 flex-wrap">
            {(['todos', 'crítico', 'advertencia', 'información'] as const).map((type) => (
              <button
                key={type}
                onClick={() => setSelectedType(type)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  selectedType === type
                    ? type === 'todos'
                      ? 'bg-primary text-primary-foreground'
                      : type === 'crítico'
                        ? 'bg-destructive text-destructive-foreground'
                        : type === 'advertencia'
                          ? 'bg-accent text-accent-foreground'
                          : 'bg-primary text-primary-foreground'
                    : 'bg-primary/10 text-foreground hover:bg-primary/20'
                }`}
              >
                {type === 'todos'
                  ? 'Todas'
                  : type === 'crítico'
                    ? 'Críticas'
                    : type === 'advertencia'
                      ? 'Advertencias'
                      : 'Información'}
              </button>
            ))}
          </div>
          <button className="ml-auto flex items-center gap-2 px-4 py-2 bg-input border border-border rounded-lg text-foreground hover:bg-primary/10 transition-colors">
            <Filter className="w-5 h-5" />
            <span>Filtros</span>
          </button>
        </div>

        <div className="space-y-4">
          {filteredAlerts.map((alert) => (
            <div
              key={alert.id}
              className={`flex items-start gap-4 p-4 rounded-lg border ${getAlertColor(alert.tipo)}`}
            >
              <div className="mt-1 flex-shrink-0">{getAlertIcon(alert.tipo)}</div>

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-semibold text-foreground">{alert.estudiante}</h4>
                    <p className="text-sm text-muted-foreground mt-1">{alert.matricula}</p>
                  </div>
                  <span className="text-xs text-muted-foreground whitespace-nowrap ml-4">
                    {alert.fecha}
                  </span>
                </div>

                <p className="text-sm mt-3 text-foreground">{alert.mensaje}</p>

                <div className="flex items-center justify-between mt-4">
                  <span className="text-xs bg-black/20 px-3 py-1 rounded-full text-foreground">
                    {alert.accion}
                  </span>
                  <button className="text-xs font-semibold text-foreground hover:underline">
                    Tomar Acción →
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
