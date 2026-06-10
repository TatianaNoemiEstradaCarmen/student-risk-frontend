-- ─────────────────────────────────────────────────────────────────────────
--  Migration: add creditos_aprobados / creditos_totales to `estudiantes`
--  Project : StudentRisk · Supabase
--  Run     : Paste into Supabase → SQL Editor → New query → Run
--  Why     : The HU-05 risk engine needs academic progress (créditos
--             aprobados vs totales) to compute the "Bajo progreso" factor.
-- ─────────────────────────────────────────────────────────────────────────
ALTER TABLE estudiantes
  ADD COLUMN IF NOT EXISTS creditos_aprobados integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS creditos_totales   integer NOT NULL DEFAULT 200;

-- Seed the 5 existing students with realistic values.
-- (carrera = 200 créditos totales aprox.)
-- 2do ciclo ≈ 40 créd · 3ro ≈ 60 · 5to ≈ 100 · 6to ≈ 120 · 8vo ≈ 160
UPDATE estudiantes SET creditos_aprobados = 60,  creditos_totales = 200 WHERE id = 1;  -- Juan Pérez      · 5to · ALTO
UPDATE estudiantes SET creditos_aprobados = 110, creditos_totales = 200 WHERE id = 2;  -- María López     · 3ro · MEDIO
UPDATE estudiantes SET creditos_aprobados = 175, creditos_totales = 200 WHERE id = 3;  -- Carlos Ramos    · 8vo · BAJO
UPDATE estudiantes SET creditos_aprobados = 20,  creditos_totales = 200 WHERE id = 4;  -- Lucía Torres    · 2do · ALTO
UPDATE estudiantes SET creditos_aprobados = 130, creditos_totales = 200 WHERE id = 5;  -- Diego Fernández · 6to · MEDIO

-- Verify
SELECT id, codigo, nombre, creditos_aprobados, creditos_totales
FROM   estudiantes
ORDER  BY id;
