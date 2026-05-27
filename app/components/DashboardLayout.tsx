'use client'

import { SidebarLayout } from '@/components/dashboard/sidebar-layout'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Users,
  AlertTriangle,
  BarChart2,
  Settings,
} from 'lucide-react'

const menusByRole = {
  administrador: [
    { label: 'Dashboard', href: '/dashboard/administrador', icon: <LayoutDashboard className="w-5 h-5" /> },
    { label: 'Estudiantes', href: '/dashboard/estudiantes', icon: <Users className="w-5 h-5" /> },
    { label: 'Alertas', href: '/dashboard/alertas', icon: <AlertTriangle className="w-5 h-5" /> },
    { label: 'Analítica', href: '/dashboard/analitica', icon: <BarChart2 className="w-5 h-5" /> },
    { label: 'Configuración', href: '/dashboard/configuracion', icon: <Settings className="w-5 h-5" /> },
  ],
  tutor: [
    { label: 'Dashboard', href: '/dashboard/tutor', icon: <LayoutDashboard className="w-5 h-5" /> },
    { label: 'Mis Estudiantes', href: '/dashboard/estudiantes', icon: <Users className="w-5 h-5" /> },
    { label: 'Alertas', href: '/dashboard/alertas', icon: <AlertTriangle className="w-5 h-5" /> },
  ],
  coordinador: [
    { label: 'Dashboard', href: '/dashboard/coordinador', icon: <LayoutDashboard className="w-5 h-5" /> },
    { label: 'Estudiantes', href: '/dashboard/estudiantes', icon: <Users className="w-5 h-5" /> },
    { label: 'Alertas', href: '/dashboard/alertas', icon: <AlertTriangle className="w-5 h-5" /> },
    { label: 'Analítica', href: '/dashboard/analitica', icon: <BarChart2 className="w-5 h-5" /> },
  ],
  estudiante: [
    { label: 'Mi Dashboard', href: '/dashboard/estudiante', icon: <LayoutDashboard className="w-5 h-5" /> },
  ],
}

type Role = keyof typeof menusByRole

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()

  // Detectar rol desde la URL como fallback visual
  const roleFromPath = (Object.keys(menusByRole) as Role[]).find((r) =>
    pathname.includes(r)
  ) ?? 'administrador'

  const menuItems = menusByRole[roleFromPath]

  return (
    <SidebarLayout role={roleFromPath} menuItems={menuItems}>
      {children}
    </SidebarLayout>
  )
}