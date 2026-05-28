'use client';

import { Users, AlertTriangle, TrendingDown, Award } from 'lucide-react';
import { KPICard } from '@/components/dashboard/kpi-card';
import { RiskTrendChart, AttendanceChart } from '@/components/dashboard/analytics-chart';
import { AlertsSection } from '@/components/dashboard/alerts-section';
import { StudentsAtRisk } from '@/components/dashboard/students-at-risk';

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Sistema de Acompañamiento Académico IA</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Total de Estudiantes"
          value="342"
          change={12}
          icon={<Users className="w-6 h-6" />}
        />
        <KPICard
          title="En Riesgo de Deserción"
          value="78"
          change={-8}
          icon={<AlertTriangle className="w-6 h-6" />}
        />
        <KPICard
          title="Casos Críticos"
          value="24"
          change={15}
          icon={<TrendingDown className="w-6 h-6" />}
        />
        <KPICard
          title="Estudiantes Mejorados"
          value="156"
          change={23}
          icon={<Award className="w-6 h-6" />}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RiskTrendChart />
        </div>
        <AlertsSection />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AttendanceChart />
        <StudentsAtRisk />
      </div>
    </div>
  );
}
