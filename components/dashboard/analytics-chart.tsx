'use client';

import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const riskTrendData = [
  { mes: 'Ene', estudiantes: 45, enRiesgo: 12, crítico: 3 },
  { mes: 'Feb', estudiantes: 52, enRiesgo: 14, crítico: 4 },
  { mes: 'Mar', estudiantes: 58, enRiesgo: 15, crítico: 3 },
  { mes: 'Abr', estudiantes: 63, enRiesgo: 18, crítico: 5 },
  { mes: 'May', estudiantes: 71, enRiesgo: 20, crítico: 6 },
  { mes: 'Jun', estudiantes: 78, enRiesgo: 19, crítico: 4 },
];

const attendanceData = [
  { semana: 'S1', asistencia: 92, objetivo: 95 },
  { semana: 'S2', asistencia: 88, objetivo: 95 },
  { semana: 'S3', asistencia: 85, objetivo: 95 },
  { semana: 'S4', asistencia: 90, objetivo: 95 },
  { semana: 'S5', asistencia: 87, objetivo: 95 },
  { semana: 'S6', asistencia: 89, objetivo: 95 },
];

export function RiskTrendChart() {
  return (
    <div className="bg-card border border-border rounded-xl p-6 backdrop-blur-sm">
      <h3 className="text-lg font-semibold text-foreground mb-4">Tendencia de Riesgos</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={riskTrendData}>
          <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.2 0.01 260)" />
          <XAxis dataKey="mes" stroke="oklch(0.65 0 0)" />
          <YAxis stroke="oklch(0.65 0 0)" />
          <Tooltip
            contentStyle={{
              backgroundColor: 'oklch(0.12 0.015 300)',
              border: '1px solid oklch(0.2 0.01 260)',
              borderRadius: '8px',
              color: 'oklch(0.98 0 0)',
            }}
          />
          <Legend />
          <Line
            type="monotone"
            dataKey="estudiantes"
            stroke="oklch(0.45 0.15 260)"
            strokeWidth={2}
            dot={{ fill: 'oklch(0.45 0.15 260)', r: 4 }}
          />
          <Line
            type="monotone"
            dataKey="enRiesgo"
            stroke="oklch(0.65 0.12 185)"
            strokeWidth={2}
            dot={{ fill: 'oklch(0.65 0.12 185)', r: 4 }}
          />
          <Line
            type="monotone"
            dataKey="crítico"
            stroke="oklch(0.577 0.245 27.325)"
            strokeWidth={2}
            dot={{ fill: 'oklch(0.577 0.245 27.325)', r: 4 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export function AttendanceChart() {
  return (
    <div className="bg-card border border-border rounded-xl p-6 backdrop-blur-sm">
      <h3 className="text-lg font-semibold text-foreground mb-4">Tasa de Asistencia</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={attendanceData}>
          <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.2 0.01 260)" />
          <XAxis dataKey="semana" stroke="oklch(0.65 0 0)" />
          <YAxis stroke="oklch(0.65 0 0)" />
          <Tooltip
            contentStyle={{
              backgroundColor: 'oklch(0.12 0.015 300)',
              border: '1px solid oklch(0.2 0.01 260)',
              borderRadius: '8px',
              color: 'oklch(0.98 0 0)',
            }}
          />
          <Legend />
          <Bar dataKey="asistencia" fill="oklch(0.65 0.12 185)" radius={[8, 8, 0, 0]} />
          <Bar dataKey="objetivo" fill="oklch(0.45 0.15 260)" radius={[8, 8, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
