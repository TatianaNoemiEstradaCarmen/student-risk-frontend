'use client'

import { useEffect } from "react"
import { supabase } from "@/src/lib/supabase"
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

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [role, setRole] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const router = useRouter()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')


  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
  
    if (!email || !password || !role) {
      setError('Todos los campos son obligatorios')
      return
    }
  
    const users: Record<string, string> = {
      administrador: 'admin@edu.com',
      tutor: 'tutor@edu.com',
      //coordinador: 'coord@edu.com',
      estudiante: 'student@edu.com',
    }
  
    if (email !== users[role] || password !== '123456') {
      setError('Credenciales incorrectas')
      return
    }
  
    setIsLoading(true)
  
    sessionStorage.setItem('userRole', role)
    sessionStorage.setItem('auth_email', email)
  
    setTimeout(() => {
      const routes: Record<string, string> = {
        administrador: '/dashboard/administrador',
        tutor: '/dashboard/tutor',
        //coordinador: '/dashboard/coordinador',
        estudiante: '/dashboard/estudiante',
      }
      router.push(routes[role])
      // No llamar setIsLoading(false) acá — ya estás navegando fuera
    }, 1500)
  }
  
  return (
    <main className="flex min-h-screen bg-background">
      {/* Left Side - Illustration & Statistics */}
      <div className="hidden w-1/2 flex-col justify-between bg-gradient-to-br from-primary/20 via-background to-background p-12 lg:flex">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-secondary">
            <span className="text-sm font-bold text-white">E</span>
          </div>
          <span className="text-xl font-bold text-foreground">EduSupport AI</span>
        </div>

        {/* Center Content */}
        <div className="flex flex-col items-start gap-12">
          {/* Illustration Placeholder - Modern Academic Visualization */}
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

          {/* Motivational Text */}
          <div className="max-w-md space-y-4">
            <h2 className="text-3xl font-bold text-foreground">
              Detectando riesgos, impulsando futuros
            </h2>
            <p className="text-foreground/70">
              Sistema integral de IA para el acompañamiento académico y prevención de deserción estudiantil.
            </p>
          </div>

          {/* Statistics Cards */}
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

        {/* Footer */}
        <div className="text-xs text-foreground/50">
          © 2024 EduSupport AI. Todos los derechos reservados.
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="flex w-full flex-col items-center justify-center px-6 lg:w-1/2 lg:px-12">
        <div className="w-full max-w-sm space-y-8">
          {/* Logo Mobile */}
          <div className="flex items-center gap-3 lg:hidden">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-secondary">
              <span className="text-sm font-bold text-white">E</span>
            </div>
            <span className="text-xl font-bold text-foreground">EduSupport AI</span>
          </div>

          {/* Form Container with Glassmorphism */}
          <div className="space-y-6 rounded-3xl border border-primary/20 bg-card/40 p-8 backdrop-blur-xl">
            {/* Header */}
            <div className="space-y-2 text-center">
              <h1 className="text-2xl font-bold text-foreground">
                Acceso al Sistema
              </h1>
              <p className="text-sm text-foreground/70">
                Sistema Inteligente de Acompañamiento Académico
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleLogin} className="space-y-5">
              {/* Email Field */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-foreground">
                  Correo Institucional
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-foreground/50" />
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="tu.correo@universidad.edu"
                    className="border-primary/20 bg-background/50 pl-10 text-foreground placeholder:text-foreground/40"
                    required
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-foreground">
                  Contraseña
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-foreground/50" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="border-primary/20 bg-background/50 pl-10 pr-10 text-foreground placeholder:text-foreground/40"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground/50 hover:text-foreground"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Role Selector */}
              <div className="space-y-2">
                <Label htmlFor="role" className="text-foreground">
                  Tipo de Usuario
                </Label>
                <div className="relative">
                  <Users className="absolute left-3 top-1/2 z-10 h-5 w-5 -translate-y-1/2 text-foreground/50 pointer-events-none" />
                  <Select value={role} onValueChange={setRole}>
                    <SelectTrigger className="border-primary/20 bg-background/50 pl-10 text-foreground">
                      <SelectValue placeholder="Selecciona tu rol" />
                    </SelectTrigger>
                    <SelectContent className="border-primary/20 bg-background">
                      <SelectItem value="administrador">
                        Administrador
                      </SelectItem>
                      <SelectItem value="tutor">
                        Tutor Académico
                      </SelectItem>
                      <SelectItem value="estudiante">
                        Estudiante
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Login Button */}
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
              {
                error && (
                  <p className="text-sm text-red-500 text-center">
                    {error}
                  </p>
                )
              }
            </form>

            {/* Forgot Password Link */}
            {/*<div className="text-center">
              <a
                href="#"
                className="text-sm text-secondary hover:text-secondary/80 transition-colors underline-offset-4 hover:underline"
              >
                ¿Olvidaste tu contraseña?
              </a>
            </div>*/}
          </div>

          {/* Footer Text */}
          <p className="text-center text-xs text-foreground/50">
            Plataforma segura de acompañamiento académico <br />
            Detectando riesgos, impulsando futuros
          </p>
        </div>
      </div>

      {/* Background Gradient Effects */}
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute -right-1/4 -top-1/4 h-96 w-96 rounded-full bg-primary/10 blur-3xl"></div>
        <div className="absolute -left-1/4 -bottom-1/4 h-96 w-96 rounded-full bg-secondary/10 blur-3xl"></div>
      </div>
    </main>
  )
}
