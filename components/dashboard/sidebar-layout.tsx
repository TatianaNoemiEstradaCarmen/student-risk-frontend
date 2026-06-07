'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { LogOut, Menu, X } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface SidebarLayoutProps {
  role: 'administrador' | 'tutor' | 'coordinador' | 'estudiante'
  children: React.ReactNode
  menuItems: Array<{
    label: string
    href: string
    icon: React.ReactNode
  }>
}

export function SidebarLayout({ role, children, menuItems }: SidebarLayoutProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const [userRole, setUserRole] = useState<string | null>(null)

  useEffect(() => {
    const storedRole = sessionStorage.getItem('userRole')
    if (!storedRole) {
      router.push('/')
    } else {
      setUserRole(storedRole)
    }
  }, [router])

  const handleLogout = () => {
    sessionStorage.removeItem('userRole')
    router.push('/')
  }

  if (!userRole) return null

  const roleLabels = {
    administrador: 'Administrador',
    tutor: 'Tutor Académico',
    coordinador: 'Coordinador Académico',
    estudiante: 'Estudiante',
  }

  return (
    <div className="flex min-h-screen bg-background">
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="fixed left-4 top-4 z-40 p-2 rounded-lg hover:bg-primary/20 lg:hidden"
      >
        {isMobileOpen ? (
          <X className="h-6 w-6 text-foreground" />
        ) : (
          <Menu className="h-6 w-6 text-foreground" />
        )}
      </button>

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 z-30 h-screen w-64 transform border-r border-primary/20 bg-card/40 backdrop-blur-xl transition-transform duration-300 lg:relative lg:translate-x-0 ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-full flex-col p-6">
          {/* Logo */}
          <div className="mb-8 mt-4 flex items-center gap-3 lg:mt-0">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-secondary">
              <span className="text-sm font-bold text-white">E</span>
            </div>
            <span className="text-xl font-bold text-foreground">EduSupport</span>
          </div>

          {/* Role Badge */}
          <div className="mb-8 rounded-lg border border-secondary/20 bg-secondary/10 px-3 py-2">
            <p className="text-xs text-foreground/60">ROL ACTUAL</p>
            <p className="text-sm font-semibold text-secondary">
            {roleLabels[userRole as keyof typeof roleLabels]}
            </p>
          </div>

          {/* Navigation Menu */}
          <nav className="flex-1 space-y-2">
            {menuItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={(e) => {
                  e.preventDefault()
                  router.push(item.href)
                  setIsMobileOpen(false)
                }}
                className={`flex items-center gap-3 rounded-lg px-4 py-3 transition-colors ${
                  pathname === item.href
                    ? 'bg-primary/20 text-primary'
                    : 'text-foreground/70 hover:bg-primary/10 hover:text-foreground'
                }`}
              >
                <span className="h-5 w-5">{item.icon}</span>
                <span className="text-sm font-medium">{item.label}</span>
              </a>
            ))}
          </nav>

          {/* Logout Button */}
          <Button
            onClick={handleLogout}
            variant="outline"
            className="w-full border-destructive/20 text-destructive hover:bg-destructive/10"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Cerrar Sesión
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="p-6 pt-16 lg:pt-6">
          {children}
        </div>
      </main>
    </div>
  )
}
