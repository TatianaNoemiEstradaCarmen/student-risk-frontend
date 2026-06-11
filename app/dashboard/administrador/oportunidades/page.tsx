'use client'

import {
  BookOpen,
  Briefcase,
  Settings,
  UserCheck,
  Users,
} from 'lucide-react'
import { SidebarLayout } from '@/components/dashboard/sidebar-layout'
import JobOpportunitiesPanel from '@/components/admin/JobOpportunitiesPanel'

export default function AdminJobOpportunitiesPage() {
  const menuItems = [
    {
      label: 'Gestión de Estudiantes',
      href: '/dashboard/administrador',
      icon: <Users className="h-5 w-5" />,
    },
    {
      label: 'Registro de Becas',
      href: '/dashboard/administrador?tab=becas',
      icon: <BookOpen className="h-5 w-5" />,
    },
    {
      label: 'Asignación de Roles',
      href: '/dashboard/administrador?tab=roles',
      icon: <UserCheck className="h-5 w-5" />,
    },
    {
      label: 'Oportunidades Laborales',
      href: '/dashboard/administrador/oportunidades',
      icon: <Briefcase className="h-5 w-5" />,
    },
    {
      label: 'Configuración',
      href: '/dashboard/administrador?tab=config',
      icon: <Settings className="h-5 w-5" />,
    },
  ]

  return (
    <SidebarLayout role="administrador" menuItems={menuItems}>
      <div className="max-w-6xl">
        <JobOpportunitiesPanel />
      </div>
    </SidebarLayout>
  )
}
