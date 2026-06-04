'use client';

import { PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const performanceData = [
  { rango: 'Excelente (90-100)', estudiantes: 45, porcentaje: 13 },
  { rango: 'Bueno (80-89)', estudiantes: 98, porcentaje: 29 },
  { rango: 'Regular (70-79)', estudiantes: 112, porcentaje: 33 },
  { rango: 'Bajo (60-69)', estudiantes: 65, porcentaje: 19 },
  { rango: 'Crítico (<60)', estudiantes: 22, porcentaje: 6 },
];

const riskDistribution = [
  { name: 'Bajo Riesgo', value: 245, color: 'oklch(0.45 0.15 260)' },
  { name: 'Riesgo Medio', value: 67, color: 'oklch(0.65 0.12 185)' },
  { name: 'Alto Riesgo', value: 30, color: 'oklch(0.577 0.245 27.325)' },
];

const performanceByCareer = [
  { carrera: 'Ing. Informática', promedio: 3.6 },
  { carrera: 'Psicología', promedio: 3.8 },
  { carrera: 'Administración', promedio: 3.4 },
  { carrera: 'Educación', promedio: 3.9 },
  { carrera: 'Contabilidad', promedio: 3.5 },
  { carrera: 'Derecho', promedio: 3.7 },
];

export default function AnaliticaPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Analítica</h1>
        <p className="text-muted-foreground mt-1">
          Estadísticas y análisis detallados del desempeño académico
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card border border-border rounded-xl p-6 backdrop-blur-sm">
          <h3 className="text-lg font-semibold text-foreground mb-4">
            Distribución de Desempeño
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={performanceData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ percent }) =>
                  `${Math.round((percent ?? 0) * 100)}%`
                }
                outerRadius={80}
                fill="#8884d8"
                dataKey="estudiantes"
              >
                <Cell fill="oklch(0.45 0.15 260)" />
                <Cell fill="oklch(0.65 0.12 185)" />
                <Cell fill="oklch(0.55 0.12 210)" />
                <Cell fill="oklch(0.7 0.12 180)" />
                <Cell fill="oklch(0.577 0.245 27.325)" />
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: 'oklch(0.12 0.015 300)',
                  border: '1px solid oklch(0.2 0.01 260)',
                  borderRadius: '8px',
                  color: 'oklch(0.98 0 0)',
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-card border border-border rounded-xl p-6 backdrop-blur-sm">
          <h3 className="text-lg font-semibold text-foreground mb-4">
            Distribución de Riesgo
          </h3>
          <div className="space-y-4">
            {riskDistribution.map((item) => (
              <div key={item.name}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-foreground">{item.name}</span>
                  <span className="text-sm font-semibold text-muted-foreground">
                    {item.value} estudiantes
                  </span>
                </div>
                <div className="w-full bg-primary/10 rounded-full h-2 overflow-hidden">
                  <div
                    className="h-full transition-all"
                    style={{
                      width: `${(item.value / 342) * 100}%`,
                      backgroundColor: item.color,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl p-6 backdrop-blur-sm">
        <h3 className="text-lg font-semibold text-foreground mb-4">
          Promedio por Carrera
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={performanceByCareer}>
            <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.2 0.01 260)" />
            <XAxis dataKey="carrera" stroke="oklch(0.65 0 0)" angle={-45} textAnchor="end" height={80} />
            <YAxis stroke="oklch(0.65 0 0)" domain={[0, 4.5]} />
            <Tooltip
              contentStyle={{
                backgroundColor: 'oklch(0.12 0.015 300)',
                border: '1px solid oklch(0.2 0.01 260)',
                borderRadius: '8px',
                color: 'oklch(0.98 0 0)',
              }}
            />
            <Line
              type="monotone"
              dataKey="promedio"
              stroke="oklch(0.65 0.12 185)"
              strokeWidth={2}
              dot={{ fill: 'oklch(0.65 0.12 185)', r: 5 }}
              activeDot={{ r: 7 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-card border border-border rounded-xl p-6 backdrop-blur-sm text-center">
          <p className="text-muted-foreground text-sm mb-2">Tasa de Finalización</p>
          <h3 className="text-4xl font-bold text-primary">87.3%</h3>
          <p className="text-xs text-muted-foreground mt-2">+5.2% respecto al año anterior</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-6 backdrop-blur-sm text-center">
          <p className="text-muted-foreground text-sm mb-2">Tasa de Deserción</p>
          <h3 className="text-4xl font-bold text-destructive">6.8%</h3>
          <p className="text-xs text-muted-foreground mt-2">-2.1% con intervenciones IA</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-6 backdrop-blur-sm text-center">
          <p className="text-muted-foreground text-sm mb-2">Promedio General</p>
          <h3 className="text-4xl font-bold text-accent">3.68</h3>
          <p className="text-xs text-muted-foreground mt-2">Sobre 4.0</p>
        </div>
      </div>
    </div>
  );
}
