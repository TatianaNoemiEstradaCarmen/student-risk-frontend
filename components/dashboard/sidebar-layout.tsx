'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { ReactNode, useEffect, useState } from 'react'
import { LogOut } from 'lucide-react'

interface MenuItem {
  label: string
  href: string
  icon?: ReactNode
}

interface SidebarLayoutProps {
  role: string
  menuItems: MenuItem[]
  children: ReactNode
}

export function SidebarLayout({ role, menuItems, children }: SidebarLayoutProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [currentUrl, setCurrentUrl] = useState('')

  const updateCurrentUrl = () => {
    if (typeof window !== 'undefined') {
      setCurrentUrl(`${window.location.pathname}${window.location.search}`)
    }
  }

  useEffect(() => {
    updateCurrentUrl()

    window.addEventListener('popstate', updateCurrentUrl)
    window.addEventListener('student-tab-change', updateCurrentUrl)
    window.addEventListener('admin-tab-change', updateCurrentUrl)

    return () => {
      window.removeEventListener('popstate', updateCurrentUrl)
      window.removeEventListener('student-tab-change', updateCurrentUrl)
      window.removeEventListener('admin-tab-change', updateCurrentUrl)
    }
  }, [pathname])

  const isItemActive = (href: string) => {
    const activeUrl = currentUrl || pathname

    const [currentPath, currentQuery = ''] = activeUrl.split('?')
    const [hrefPath, hrefQuery = ''] = href.split('?')

    if (hrefQuery) {
      if (activeUrl === href) return true

      if (
        !currentQuery &&
        currentPath === hrefPath &&
        hrefQuery === 'tab=solicitudes'
      ) {
        return true
      }

      return false
    }

    return currentPath === hrefPath && !currentQuery
  }

  const handleMenuClick = () => {
    setTimeout(() => {
      updateCurrentUrl()
      window.dispatchEvent(new Event('student-tab-change'))
      window.dispatchEvent(new Event('admin-tab-change'))
    }, 50)
  }

  const handleLogout = () => {
    localStorage.removeItem('userRole')
    localStorage.removeItem('role')
    localStorage.removeItem('currentRole')
    router.push('/')
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="flex min-h-screen">
        <aside className="flex w-72 shrink-0 flex-col border-r border-primary/10 bg-background/95 p-6">
          <div className="mb-8 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-secondary font-bold text-primary-foreground">
              E
            </div>
            <h1 className="text-2xl font-bold text-foreground">EduSupport</h1>
          </div>

          <div className="mb-8 rounded-xl border border-primary/20 bg-primary/5 p-4">
            <p className="text-xs font-semibold uppercase text-foreground/60">
              Rol actual
            </p>
            <p className="mt-1 font-bold capitalize text-primary">
              {role}
            </p>
          </div>

          <nav className="flex flex-1 flex-col gap-3">
            {menuItems.map((item) => {
              const active = isItemActive(item.href)

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={handleMenuClick}
                  className={`flex items-center gap-4 rounded-xl px-4 py-4 text-sm font-semibold transition-colors ${
                    active
                      ? 'bg-primary/10 text-primary'
                      : 'text-foreground/70 hover:bg-primary/5 hover:text-foreground'
                  }`}
                >
                  <span className="shrink-0">
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </Link>
              )
            })}
          </nav>

          <button
            onClick={handleLogout}
            className="mt-8 flex items-center justify-center gap-3 rounded-xl border border-red-500/30 px-4 py-3 font-semibold text-red-500 transition-colors hover:bg-red-500/10"
          >
            <LogOut className="h-5 w-5" />
            Cerrar Sesión
          </button>
        </aside>

        <main className="flex-1 p-8">
          {children}
        </main>
      </div>
    </div>
  )
}

export default SidebarLayout
