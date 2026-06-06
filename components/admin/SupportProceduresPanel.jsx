"use client"

import { useMemo, useState } from "react"
import { getSupportProcedures } from "../../src/services/supportProcedureService"

export default function SupportProceduresPanel() {
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
    <section className="rounded-2xl border border-slate-800 bg-slate-950/60 p-6">
      <h2 className="mb-2 text-2xl font-bold text-white">
        Registro de trámites de apoyo estudiantil
      </h2>

      <p className="mb-6 text-slate-400">
        Permite registrar trámites de apoyo estudiantil para orientar al alumno sobre los procesos disponibles.
      </p>

      <form onSubmit={handleSubmit} className="mb-8 space-y-4">
        {error && (
          <div className="rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {error}
          </div>
        )}

        <input
          name="nombreTramite"
          value={form.nombreTramite}
          onChange={handleChange}
          className="w-full rounded-lg border border-slate-800 bg-black px-4 py-3 text-white outline-none focus:border-blue-500"
          placeholder="Nombre del trámite"
        />

        <textarea
          name="descripcion"
          value={form.descripcion}
          onChange={handleChange}
          className="h-24 w-full rounded-lg border border-slate-800 bg-black px-4 py-3 text-white outline-none focus:border-blue-500"
          placeholder="Descripción del trámite"
        />

        <textarea
          name="requisitos"
          value={form.requisitos}
          onChange={handleChange}
          className="h-20 w-full rounded-lg border border-slate-800 bg-black px-4 py-3 text-white outline-none focus:border-blue-500"
          placeholder="Requisitos"
        />

        <div className="grid gap-4 md:grid-cols-3">
          <select
            name="areaResponsable"
            value={form.areaResponsable}
            onChange={handleChange}
            className="rounded-lg border border-slate-800 bg-black px-4 py-3 text-white outline-none focus:border-blue-500"
          >
            <option>Bienestar Universitario</option>
            <option>Tutoría Académica</option>
            <option>Área de Becas</option>
            <option>Servicios Estudiantiles</option>
          </select>

          <select
            name="canalAtencion"
            value={form.canalAtencion}
            onChange={handleChange}
            className="rounded-lg border border-slate-800 bg-black px-4 py-3 text-white outline-none focus:border-blue-500"
          >
            <option>Presencial</option>
            <option>Virtual</option>
            <option>Mixto</option>
          </select>

          <select
            name="prioridad"
            value={form.prioridad}
            onChange={handleChange}
            className="rounded-lg border border-slate-800 bg-black px-4 py-3 text-white outline-none focus:border-blue-500"
          >
            <option>Alta</option>
            <option>Media</option>
            <option>Baja</option>
          </select>
        </div>

        <button
          type="submit"
          className="rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-500"
        >
          Registrar trámite
        </button>
      </form>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-slate-300">
          <thead>
            <tr className="border-b border-slate-800">
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
              <tr key={procedure.id} className="border-b border-slate-800">
                <td className="px-4 py-4">{procedure.codigoTramite}</td>
                <td className="px-4 py-4">
                  <p className="font-semibold text-white">{procedure.nombreTramite}</p>
                  <p className="text-xs text-slate-400">{procedure.descripcion}</p>
                  <p className="text-xs text-blue-400">Requisitos: {procedure.requisitos}</p>
                </td>
                <td className="px-4 py-4">{procedure.areaResponsable}</td>
                <td className="px-4 py-4">{procedure.canalAtencion}</td>
                <td className="px-4 py-4">{procedure.prioridad}</td>
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
  )
}
