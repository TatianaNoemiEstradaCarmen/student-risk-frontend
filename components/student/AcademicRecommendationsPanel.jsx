"use client"

import { useMemo } from "react"
import { getAcademicRecommendationsBySituation } from "@/src/services/academicRecommendationService"

export default function AcademicRecommendationsPanel() {
  const recommendations = useMemo(
    () => getAcademicRecommendationsBySituation("acompanamiento"),
    []
  )

  return (
    <section className="rounded-2xl border border-primary/20 bg-card/40 p-8 backdrop-blur-xl">
      <div className="mb-6">
        <p className="text-sm font-semibold uppercase tracking-widest text-primary">
          HU-13
        </p>
        <h2 className="mt-2 text-2xl font-bold text-foreground">
          Recomendaciones de apoyo académico
        </h2>
        <p className="mt-2 max-w-3xl text-foreground/70">
          Estas recomendaciones están orientadas a ayudarte a organizar mejor tu avance académico,
          reforzar tus cursos y aprovechar los recursos de acompañamiento disponibles.
        </p>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        {recommendations.map((item) => (
          <article
            key={item.id}
            className="rounded-xl border border-primary/20 bg-background/40 p-5"
          >
            <div className="mb-3 inline-flex rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
              {item.tipo}
            </div>

            <h3 className="mb-2 text-lg font-bold text-foreground">
              {item.titulo}
            </h3>

            <p className="mb-4 text-sm leading-relaxed text-foreground/70">
              {item.descripcion}
            </p>

            <div className="rounded-lg border border-secondary/20 bg-secondary/10 p-3">
              <p className="text-sm font-semibold text-secondary">
                Acción sugerida:
              </p>
              <p className="mt-1 text-sm text-foreground/80">
                {item.accion}
              </p>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
