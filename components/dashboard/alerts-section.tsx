import { AlertTriangle, AlertCircle, CheckCircle } from 'lucide-react';

interface Alert {
  id: string;
  type: 'crítico' | 'advertencia' | 'información';
  estudiante: string;
  mensaje: string;
  tiempo: string;
}

const alerts: Alert[] = [
  {
    id: '1',
    type: 'crítico',
    estudiante: 'Juan Martinez García',
    mensaje: '4 inasistencias consecutivas detectadas',
    tiempo: 'Hace 2 horas',
  },
  {
    id: '2',
    type: 'advertencia',
    estudiante: 'María López Rodríguez',
    mensaje: 'Calificaciones por debajo del 60% en últimas evaluaciones',
    tiempo: 'Hace 4 horas',
  },
  {
    id: '3',
    type: 'crítico',
    estudiante: 'Carlos Díaz Martínez',
    mensaje: 'Riesgo de deserción - Patrón de comportamiento anómalo',
    tiempo: 'Hace 6 horas',
  },
  {
    id: '4',
    type: 'información',
    estudiante: 'Ana Fernández López',
    mensaje: 'Mejora detectada en participación en clase',
    tiempo: 'Hace 8 horas',
  },
];

export function AlertsSection() {
  const getAlertStyle = (type: Alert['type']) => {
    switch (type) {
      case 'crítico':
        return 'bg-destructive/10 border-destructive/30 text-destructive';
      case 'advertencia':
        return 'bg-accent/10 border-accent/30 text-accent';
      case 'información':
        return 'bg-primary/10 border-primary/30 text-primary';
    }
  };

  const getAlertIcon = (type: Alert['type']) => {
    switch (type) {
      case 'crítico':
        return <AlertTriangle className="w-5 h-5" />;
      case 'advertencia':
        return <AlertCircle className="w-5 h-5" />;
      case 'información':
        return <CheckCircle className="w-5 h-5" />;
    }
  };

  return (
    <div className="bg-card border border-border rounded-xl p-6 backdrop-blur-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-foreground">Alertas Activas</h3>
        <span className="bg-destructive/20 text-destructive text-xs font-semibold px-3 py-1 rounded-full">
          {alerts.length} alertas
        </span>
      </div>

      <div className="space-y-3">
        {alerts.map((alert) => (
          <div
            key={alert.id}
            className={`flex items-start gap-4 p-4 rounded-lg border ${getAlertStyle(
              alert.type
            )}`}
          >
            <div className="mt-1">{getAlertIcon(alert.type)}</div>
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-foreground text-sm">{alert.estudiante}</div>
              <p className="text-muted-foreground text-sm mt-1">{alert.mensaje}</p>
              <div className="text-xs text-muted-foreground mt-2">{alert.tiempo}</div>
            </div>
            <button className="text-muted-foreground hover:text-foreground text-2xl leading-none">
              ×
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
