'use client'

import { Suspense } from 'react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Eye, EyeOff, Lock, Mail, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

// ✅ FIX 1: Desactiva el prerender estático — necesario porque usa sessionStorage
export const dynamic = 'force-dynamic'

const FIXED_USERS: Record<string, { email: string; password: string }> = {
  administrador: { email: 'admin@usil.com.pe', password: '123456' },
  tutor:         { email: 'tutor@usil.com.pe', password: '123456' },
}

function LoginForm() {
  const [showPassword, setShowPassword] = useState(false)
  const [role, setRole]                 = useState('')
  const [isLoading, setIsLoading]       = useState(false)
  const [email, setEmail]               = useState('')
  const [password, setPassword]         = useState('')
  const [error, setError]               = useState('')

  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!email || !password || !role) {
      setError('Todos los campos son obligatorios')
      return
    }

    setIsLoading(true)

    try {
      if (role === 'administrador' || role === 'tutor') {
        const fixed = FIXED_USERS[role]
        if (email !== fixed.email || password !== fixed.password) {
          setError('Credenciales incorrectas')
          setIsLoading(false)
          return
        }
        sessionStorage.setItem('userRole',   role)
        sessionStorage.setItem('auth_email', email)
        router.push(role === 'administrador' ? '/dashboard/administrador' : '/dashboard/tutor?tab=alertas')
        return
      }

      if (role === 'estudiante') {
        // ✅ FIX 2: Import dinámico — nunca se ejecuta en el servidor durante el build
        const { supabase } = await import('@/src/lib/supabase')

        const correoNorm = email.trim().toLowerCase()

        const { data: estudiante, error: dbError } = await supabase
          .from('estudiantes')
          .select('id, nombre, codigo, correo')
          .ilike('correo', correoNorm)
          .maybeSingle()

        if (dbError) {
          setError('Error al verificar credenciales. Inténtalo de nuevo.')
          setIsLoading(false)
          return
        }

        if (!estudiante) {
          setError('No se encontró ningún estudiante con ese correo.')
          setIsLoading(false)
          return
        }

        if (password !== '123456') {
          setError('Contraseña incorrecta.')
          setIsLoading(false)
          return
        }

        sessionStorage.setItem('userRole',           'estudiante')
        sessionStorage.setItem('auth_email',         correoNorm)
        sessionStorage.setItem('estudiante_id',      String(estudiante.id))
        sessionStorage.setItem('estudiante_nombre',  estudiante.nombre || '')

        router.push('/dashboard/estudiante')
        return
      }

      setError('Rol no reconocido.')
      setIsLoading(false)
    } catch (err) {
      console.error(err)
      setError('Error inesperado. Inténtalo de nuevo.')
      setIsLoading(false)
    }
  }

  return (
    <main className="flex min-h-screen bg-background">
      {/* Left Side */}
      <div className="hidden w-1/2 flex-col justify-between bg-gradient-to-br from-primary/20 via-background to-background p-12 lg:flex">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-secondary">
            <span className="text-sm font-bold text-white">E</span>
          </div>
          <span className="text-xl font-bold text-foreground">EduSupport AI</span>
        </div>

        <div className="flex flex-col items-start gap-12">
          <div className="flex h-64 w-full items-center justify-center rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/10 to-secondary/10 backdrop-blur-md">
            <div className="space-y-4 text-center">
              <div className="flex justify-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-primary/40"></div>
                <div className="h-8 w-8 rounded-lg bg-primary/60"></div>
                <div className="h-8 w-8 rounded-lg bg-primary/80"></div>
              </div>
              <p className="text-sm text-foreground/60">Analytics Inteligente</p>
            </div>
          </div>

          <div className="max-w-md space-y-4">
            <h2 className="text-3xl font-bold text-foreground">
              Detectando riesgos, impulsando futuros
            </h2>
            <p className="text-foreground/70">
              Sistema integral de IA para el acompañamiento académico y prevención de deserción estudiantil.
            </p>
          </div>

          <div className="grid w-full max-w-sm grid-cols-2 gap-3">
            <div className="rounded-lg border border-primary/20 bg-primary/5 p-4 backdrop-blur-sm">
              <div className="text-2xl font-bold text-primary">98%</div>
              <p className="text-xs text-foreground/60">Precisión de Detección</p>
            </div>
            <div className="rounded-lg border border-secondary/20 bg-secondary/5 p-4 backdrop-blur-sm">
              <div className="text-2xl font-bold text-secondary">2.5K+</div>
              <p className="text-xs text-foreground/60">Estudiantes Monitoreados</p>
            </div>
            <div className="rounded-lg border border-primary/20 bg-primary/5 p-4 backdrop-blur-sm">
              <div className="text-2xl font-bold text-primary">24/7</div>
              <p className="text-xs text-foreground/60">Monitoreo en Vivo</p>
            </div>
            <div className="rounded-lg border border-secondary/20 bg-secondary/5 p-4 backdrop-blur-sm">
              <div className="text-2xl font-bold text-secondary">150+</div>
              <p className="text-xs text-foreground/60">Universidades</p>
            </div>
          </div>
        </div>

        <div className="text-xs text-foreground/50">
          © 2024 EduSupport AI. Todos los derechos reservados.
        </div>
      </div>

      {/* Right Side */}
      <div className="flex w-full flex-col items-center justify-center px-6 lg:w-1/2 lg:px-12">
        <div className="w-full max-w-sm space-y-8">
          <div className="flex items-center gap-3 lg:hidden">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-secondary">
              <span className="text-sm font-bold text-white">E</span>
            </div>
            <span className="text-xl font-bold text-foreground">EduSupport AI</span>
          </div>

          <div className="space-y-6 rounded-3xl border border-primary/20 bg-card/40 p-8 backdrop-blur-xl">
            <div className="space-y-2 text-center">
              <h1 className="text-2xl font-bold text-foreground">Acceso al Sistema</h1>
              <p className="text-sm text-foreground/70">
                Sistema Inteligente de Acompañamiento Académico
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="role" className="text-foreground">Tipo de Usuario</Label>
                <div className="relative">
                  <Users className="absolute left-3 top-1/2 z-10 h-5 w-5 -translate-y-1/2 text-foreground/50 pointer-events-none" />
                  <Select value={role} onValueChange={setRole}>
                    <SelectTrigger className="border-primary/20 bg-background/50 pl-10 text-foreground">
                      <SelectValue placeholder="Selecciona tu rol" />
                    </SelectTrigger>
                    <SelectContent className="border-primary/20 bg-background">
                      <SelectItem value="administrador">Administrador</SelectItem>
                      <SelectItem value="tutor">Tutor Académico</SelectItem>
                      <SelectItem value="estudiante">Estudiante</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-foreground">Correo Institucional</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-foreground/50" />
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={
                      role === 'administrador' ? 'admin@usil.com.pe' :
                      role === 'tutor'         ? 'tutor@usil.com.pe' :
                      'tu.correo@universidad.edu'
                    }
                    className="border-primary/20 bg-background/50 pl-10 text-foreground placeholder:text-foreground/40"
                    required
                  />
                </div>
                {role === 'estudiante' && (
                  <p className="text-xs text-foreground/50">
                    Usa el correo con el que fuiste registrado.
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-foreground">Contraseña</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-foreground/50" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="**********"
                    className="border-primary/20 bg-background/50 pl-10 pr-10 text-foreground placeholder:text-foreground/40"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground/50 hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-primary to-secondary py-6 text-base font-semibold text-white shadow-lg hover:shadow-xl hover:opacity-90 transition-all"
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></span>
                    Iniciando sesión...
                  </span>
                ) : (
                  'Acceder al Sistema'
                )}
              </Button>

              {error && (
                <p className="text-sm text-red-500 text-center">{error}</p>
              )}
            </form>
          </div>

          <p className="text-center text-xs text-foreground/50">
            Plataforma segura de acompañamiento académico <br />
            Detectando riesgos, impulsando futuros
          </p>
        </div>
      </div>

      <div className="pointer-events-none fixed inset-0">
        <div className="absolute -right-1/4 -top-1/4 h-96 w-96 rounded-full bg-primary/10 blur-3xl"></div>
        <div className="absolute -left-1/4 -bottom-1/4 h-96 w-96 rounded-full bg-secondary/10 blur-3xl"></div>
      </div>
    </main>
  )
}

// ✅ FIX 3: useSearchParams necesita estar dentro de Suspense
export default function LoginPage() {
  return (
    <Suspense fallback={<div className="flex h-screen items-center justify-center bg-background" />}>
      <LoginForm />
    </Suspense>
  )
}