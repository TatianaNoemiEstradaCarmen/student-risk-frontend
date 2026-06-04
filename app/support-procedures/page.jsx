"use client"

import { useMemo, useState } from "react"
import { getSupportProcedures } from "../../src/services/supportProcedureService"

export default function SupportProceduresPage() {
  const initialProcedures = useMemo(() => getSupportProcedures(), [])

  const [procedures, setProcedures] = useState(initialProcedures)
  const [error, setError] = useState("")
  const [form, setForm] = useState({
    nombreTramite: "",
    descripcion: "",
    requisitos: "",
    areaResponsable: "Bienestar Universitario",
    canalAtencion: "Presencial",
    prioridad: "Media"
  })

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((prev) => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = (event) => {
    event.preventDefault()

    if (
      !form.nombreTramite.trim() ||
      !form.descripcion.trim() ||
      !form.requisitos.trim()
    ) {
      setError("El trámite debe tener nombre, descripción y requisitos.")
      return
    }

    const newProcedure = {
      id: procedures.length + 1,
      codigoTramite: `TRM-2026-${String(procedures.length + 1).padStart(3, "0")}`,
      nombreTramite: form.nombreTramite,
      descripcion: form.descripcion,
      requisitos: form.requisitos,
      areaResponsable: form.areaResponsable,
      canalAtencion: form.canalAtencion,
      fechaSolicitud: new Date().toISOString().split("T")[0],
      prioridad: form.prioridad,
      estado: "Pendiente"
    }

    setProcedures((prev) => [newProcedure, ...prev])
    setForm({
      nombreTramite: "",
      descripcion: "",
      requisitos: "",
      areaResponsable: "Bienestar Universitario",
      canalAtencion: "Presencial",
      prioridad: "Media"
    })
    setError("")
  }

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-8 text-white">
      <section className="mx-auto max-w-7xl">
        <div className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-widest text-cyan-400">
            HU-18
          </p>
          <h1 className="mt-2 text-3xl font-bold">
            Registro de trámites de apoyo estudiantil
          </h1>
          <p className="mt-3 max-w-3xl text-slate-300">
            Como administrador académico, esta interfaz permite registrar trámites
            de apoyo estudiantil para orientar al alumno sobre los procesos disponibles.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[420px_1fr]">
          <form
            onSubmit={handleSubmit}
            className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 shadow-xl"
          >
            <h2 className="mb-4 text-xl font-semibold">
              Registrar nuevo trámite
            </h2>

            {error && (
              <div className="mb-4 rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                {error}
              </div>
            )}

            <label className="mb-2 block text-sm text-slate-300">
              Nombre del trámite
            </label>
            <input
              name="nombreTramite"
              value={form.nombreTramite}
              onChange={handleChange}
              className="mb-4 w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-2 text-white outline-none focus:border-cyan-400"
              placeholder="Ejemplo: Apoyo psicológico"
            />

            <label className="mb-2 block text-sm text-slate-300">
              Descripción
            </label>
            <textarea
              name="descripcion"
              value={form.descripcion}
              onChange={handleChange}
              className="mb-4 h-24 w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-2 text-white outline-none focus:border-cyan-400"
              placeholder="Describe el trámite disponible para el estudiante"
            />

            <label className="mb-2 block text-sm text-slate-300">
              Requisitos
            </label>
            <textarea
              name="requisitos"
              value={form.requisitos}
              onChange={handleChange}
              className="mb-4 h-20 w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-2 text-white outline-none focus:border-cyan-400"
              placeholder="Indica los requisitos del trámite"
            />

            <label className="mb-2 block text-sm text-slate-300">
              Área responsable
            </label>
            <select
              name="areaResponsable"
              value={form.areaResponsable}
              onChange={handleChange}
              className="mb-4 w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-2 text-white outline-none focus:border-cyan-400"
            >
              <option>Bienestar Universitario</option>
              <option>Tutoría Académica</option>
              <option>Área de Becas</option>
              <option>Servicios Estudiantiles</option>
            </select>

            <label className="mb-2 block text-sm text-slate-300">
              Canal de atención
            </label>
            <select
              name="canalAtencion"
              value={form.canalAtencion}
              onChange={handleChange}
              className="mb-4 w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-2 text-white outline-none focus:border-cyan-400"
            >
              <option>Presencial</option>
              <option>Virtual</option>
              <option>Mixto</option>
            </select>

            <label className="mb-2 block text-sm text-slate-300">
              Prioridad
            </label>
            <select
              name="prioridad"
              value={form.prioridad}
              onChange={handleChange}
              className="mb-6 w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-2 text-white outline-none focus:border-cyan-400"
            >
              <option>Alta</option>
              <option>Media</option>
              <option>Baja</option>
            </select>

            <button
              type="submit"
              className="w-full rounded-lg bg-cyan-500 px-4 py-3 font-semibold text-slate-950 transition hover:bg-cyan-400"
            >
              Registrar trámite
            </button>
          </form>

          <section className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 shadow-xl">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold">
                  Trámites disponibles
                </h2>
                <p className="text-sm text-slate-400">
                  Visualización de trámites registrados para el portal del estudiante.
                </p>
              </div>
              <span className="rounded-full bg-cyan-500/10 px-4 py-2 text-sm font-semibold text-cyan-300">
                {procedures.length} trámites
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-300">
                    <th className="px-4 py-3">Código</th>
                    <th className="px-4 py-3">Trámite</th>
                    <th className="px-4 py-3">Área</th>
                    <th className="px-4 py-3">Canal</th>
                    <th className="px-4 py-3">Prioridad</th>
                    <th className="px-4 py-3">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {procedures.map((procedure) => (
                    <tr
                      key={procedure.id}
                      className="border-b border-slate-800 text-slate-200"
                    >
                      <td className="px-4 py-4 font-medium">
                        {procedure.codigoTramite}
                      </td>
                      <td className="px-4 py-4">
                        <p className="font-semibold">
                          {procedure.nombreTramite}
                        </p>
                        <p className="mt-1 text-xs text-slate-400">
                          {procedure.descripcion}
                        </p>
                        <p className="mt-1 text-xs text-cyan-300">
                          Requisitos: {procedure.requisitos}
                        </p>
                      </td>
                      <td className="px-4 py-4">
                        {procedure.areaResponsable}
                      </td>
                      <td className="px-4 py-4">
                        {procedure.canalAtencion}
                      </td>
                      <td className="px-4 py-4">
                        {procedure.prioridad}
                      </td>
                      <td className="px-4 py-4">
                        <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-300">
                          {procedure.estado}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </section>
    </main>
  )
}
