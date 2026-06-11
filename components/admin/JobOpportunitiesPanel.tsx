'use client'

import { useCallback, useEffect, useState } from 'react'
import {
  createJobOpportunity,
  getJobOpportunities,
  type JobModality,
  type JobOpportunity,
} from '@/src/services/jobOpportunityService'
import {
  AlertCircle,
  Briefcase,
  CheckCircle,
  Loader2,
  Plus,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

const initialForm = {
  empresa: '',
  cargo: '',
  modalidad: 'PRESENCIAL' as JobModality,
  descripcion: '',
}

export default function JobOpportunitiesPanel() {
  const [opportunities, setOpportunities] = useState<JobOpportunity[]>([])
  const [form, setForm] = useState(initialForm)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const loadOpportunities = useCallback(async () => {
    try {
      setLoading(true)
      setError('')

      const data = await getJobOpportunities()
      setOpportunities(data)
    } catch (currentError) {
      setError(
        currentError instanceof Error
          ? currentError.message
          : 'No fue posible consultar las oportunidades laborales.'
      )
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadOpportunities()
  }, [loadOpportunities])

  const handleChange = (
    event: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = event.target

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }))

    setError('')
    setSuccess('')
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    if (
      !form.empresa.trim() ||
      !form.cargo.trim() ||
      !form.modalidad ||
      !form.descripcion.trim()
    ) {
      setError(
        'La empresa, el cargo, la modalidad y la descripción son obligatorios.'
      )
      return
    }

    try {
      setSaving(true)
      setError('')
      setSuccess('')

      const createdOpportunity = await createJobOpportunity(form)

      setOpportunities((previous) => [
        createdOpportunity,
        ...previous,
      ])

      setForm(initialForm)
      setSuccess('Oportunidad laboral publicada correctamente.')
    } catch (currentError) {
      setError(
        currentError instanceof Error
          ? currentError.message
          : 'No fue posible publicar la oportunidad laboral.'
      )
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-primary/20 bg-card/40 p-8 backdrop-blur-xl">
        <div className="mb-6 flex items-start gap-4">
          <div className="rounded-xl bg-primary/10 p-3">
            <Briefcase className="h-6 w-6 text-primary" />
          </div>

          <div>
<h1 className="text-2xl font-bold text-foreground">
              Publicación de oportunidades laborales
            </h1>

            <p className="mt-2 text-foreground/70">
              Publica oportunidades para apoyar a estudiantes que necesitan
              trabajar sin abandonar su carrera.
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-5 flex items-center gap-3 rounded-lg border border-red-500/20 bg-red-500/10 p-4 text-red-400">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <p className="text-sm">{error}</p>
          </div>
        )}

        {success && (
          <div className="mb-5 flex items-center gap-3 rounded-lg border border-green-500/20 bg-green-500/10 p-4 text-green-400">
            <CheckCircle className="h-5 w-5 shrink-0" />
            <p className="text-sm">{success}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid gap-5 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="empresa">Empresa</Label>

              <Input
                id="empresa"
                name="empresa"
                value={form.empresa}
                onChange={handleChange}
                placeholder="Ejemplo: Italtel Perú"
                disabled={saving}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cargo">Cargo</Label>

              <Input
                id="cargo"
                name="cargo"
                value={form.cargo}
                onChange={handleChange}
                placeholder="Ejemplo: Practicante de Sistemas"
                disabled={saving}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="modalidad">Modalidad</Label>

            <select
              id="modalidad"
              name="modalidad"
              value={form.modalidad}
              onChange={handleChange}
              disabled={saving}
              className="flex h-10 w-full rounded-md border border-primary/20 bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
            >
              <option value="PRESENCIAL">Presencial</option>
              <option value="REMOTO">Remoto</option>
              <option value="HIBRIDO">Híbrido</option>
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="descripcion">Descripción</Label>

            <Textarea
              id="descripcion"
              name="descripcion"
              value={form.descripcion}
              onChange={handleChange}
              placeholder="Describe las funciones, requisitos y condiciones de la oferta."
              className="min-h-32"
              disabled={saving}
            />
          </div>

          <Button
            type="submit"
            disabled={saving}
            className="bg-gradient-to-r from-primary to-secondary"
          >
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Publicando...
              </>
            ) : (
              <>
                <Plus className="mr-2 h-4 w-4" />
                Publicar oportunidad
              </>
            )}
          </Button>
        </form>
      </section>

      <section className="rounded-2xl border border-primary/20 bg-card/40 p-8 backdrop-blur-xl">
        <div className="mb-6 flex items-center justify-between gap-4">
          <h2 className="text-xl font-bold text-foreground">
            Oportunidades publicadas
          </h2>

          <span className="rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-sm font-semibold text-primary">
            {opportunities.length} publicaciones
          </span>
        </div>

        {loading ? (
          <div className="flex items-center gap-3 text-foreground/70">
            <Loader2 className="h-5 w-5 animate-spin" />
            Consultando Supabase...
          </div>
        ) : opportunities.length === 0 ? (
          <div className="rounded-xl border border-yellow-500/20 bg-yellow-500/10 p-5">
            <p className="text-yellow-400">
              Todavía no existen oportunidades laborales registradas.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {opportunities.map((opportunity) => (
              <article
                key={opportunity.id}
                className="rounded-xl border border-primary/20 bg-background/30 p-5"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-bold text-foreground">
                      {opportunity.cargo}
                    </h3>

                    <p className="font-semibold text-primary">
                      {opportunity.empresa}
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <span className="rounded-full border border-secondary/20 bg-secondary/10 px-3 py-1 text-xs font-semibold text-secondary">
                      {opportunity.modalidad}
                    </span>

                    <span className="rounded-full border border-green-500/20 bg-green-500/10 px-3 py-1 text-xs font-semibold text-green-400">
                      {opportunity.estado}
                    </span>
                  </div>
                </div>

                <p className="mt-4 text-sm leading-relaxed text-foreground/70">
                  {opportunity.descripcion}
                </p>

                <p className="mt-3 text-xs text-foreground/50">
                  Publicada el{' '}
                  {new Date(opportunity.created_at).toLocaleDateString(
                    'es-PE'
                  )}
                </p>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
