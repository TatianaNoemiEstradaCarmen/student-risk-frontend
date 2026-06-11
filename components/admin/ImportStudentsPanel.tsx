'use client'

import { useState } from 'react'
import * as XLSX from 'xlsx'
import { uploadStudents } from '@/src/services/importStudentsService'

export default function ImportStudentsPanel() {
  const [fileName, setFileName] = useState('')
  const [rows, setRows] = useState<any[]>([])
  const [invalidRows, setInvalidRows] = useState<any[]>([])
  const [message, setMessage] = useState('')

  const handleFile = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0]

    if (!file) return

    setFileName(file.name)

    const data = await file.arrayBuffer()

    const workbook = XLSX.read(data)

    const sheet =
      workbook.Sheets[workbook.SheetNames[0]]

    const json = XLSX.utils.sheet_to_json(sheet)

    const invalid = json.filter(
      (row: any) =>
        !row.codigo ||
        !row.dni ||
        !row.nombre ||
        !row.correo
    )

    setRows(json)
    setInvalidRows(invalid)
  }

  const handleImport = async () => {
    try {
      const validRows = rows.filter(
        (row: any) =>
          row.codigo &&
          row.dni &&
          row.nombre &&
          row.correo
      )

      await uploadStudents(validRows)

      setMessage(
        `${validRows.length} estudiantes importados correctamente`
      )
    } catch (error) {
      console.error(error)
      setMessage('Error al importar estudiantes')
    }
  }

  return (
    <div className="rounded-2xl border border-primary/20 bg-card/40 p-8">
      <h2 className="mb-6 text-2xl font-bold">
        Importación de estudiantes
      </h2>

      <input
        type="file"
        accept=".xlsx,.csv"
        onChange={handleFile}
      />

      {fileName && (
        <p className="mt-4">
          Archivo: {fileName}
        </p>
      )}

      {rows.length > 0 && (
        <div className="mt-4">
          <p>
            Registros encontrados:
            {' '}
            {rows.length}
          </p>

          <p>
            Registros inválidos:
            {' '}
            {invalidRows.length}
          </p>
        </div>
      )}

      <button
        onClick={handleImport}
        className="mt-6 rounded-lg bg-blue-600 px-4 py-2 text-white"
      >
        Importar
      </button>

      {message && (
        <p className="mt-4 font-semibold">
          {message}
        </p>
      )}
    </div>
  )
}