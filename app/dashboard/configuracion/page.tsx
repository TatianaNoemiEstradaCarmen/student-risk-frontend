'use client';

import { Save, Bell, Lock, User } from 'lucide-react';
import { useState } from 'react';

export default function ConfiguracionPage() {
  const [settings, setSettings] = useState({
    nombreInstitucio: 'Universidad Nacional',
    email: 'admin@universidad.edu',
    notificacionesCriticas: true,
    notificacionesAdvertencias: true,
    notificacionesSemanales: false,
    idioma: 'es',
    tema: 'oscuro',
  });

  const handleChange = (field: string, value: any) => {
    setSettings({ ...settings, [field]: value });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Configuración</h1>
        <p className="text-muted-foreground mt-1">Gestiona los parámetros del sistema</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-card border border-border rounded-xl p-6 backdrop-blur-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-primary/10 rounded-lg">
                <User className="w-5 h-5 text-primary" />
              </div>
              <h2 className="text-lg font-semibold text-foreground">Información General</h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Nombre de la Institución
                </label>
                <input
                  type="text"
                  value={settings.nombreInstitucio}
                  onChange={(e) => handleChange('nombreInstitucio', e.target.value)}
                  className="w-full px-4 py-2 bg-input border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Email del Administrador
                </label>
                <input
                  type="email"
                  value={settings.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  className="w-full px-4 py-2 bg-input border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Idioma</label>
                <select
                  value={settings.idioma}
                  onChange={(e) => handleChange('idioma', e.target.value)}
                  className="w-full px-4 py-2 bg-input border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50"
                >
                  <option value="es">Español</option>
                  <option value="en">English</option>
                  <option value="pt">Português</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Tema</label>
                <select
                  value={settings.tema}
                  onChange={(e) => handleChange('tema', e.target.value)}
                  className="w-full px-4 py-2 bg-input border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50"
                >
                  <option value="oscuro">Oscuro</option>
                  <option value="claro">Claro</option>
                  <option value="auto">Automático</option>
                </select>
              </div>
            </div>
          </div>

          <div className="bg-card border border-border rounded-xl p-6 backdrop-blur-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Bell className="w-5 h-5 text-primary" />
              </div>
              <h2 className="text-lg font-semibold text-foreground">Notificaciones</h2>
            </div>

            <div className="space-y-4">
              <label className="flex items-center gap-4 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.notificacionesCriticas}
                  onChange={(e) =>
                    handleChange('notificacionesCriticas', e.target.checked)
                  }
                  className="w-5 h-5 rounded bg-input border border-border cursor-pointer accent-primary"
                />
                <div>
                  <p className="font-medium text-foreground">Alertas Críticas</p>
                  <p className="text-sm text-muted-foreground">
                    Notificaciones de casos críticos de deserción
                  </p>
                </div>
              </label>

              <label className="flex items-center gap-4 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.notificacionesAdvertencias}
                  onChange={(e) =>
                    handleChange('notificacionesAdvertencias', e.target.checked)
                  }
                  className="w-5 h-5 rounded bg-input border border-border cursor-pointer accent-primary"
                />
                <div>
                  <p className="font-medium text-foreground">Advertencias</p>
                  <p className="text-sm text-muted-foreground">
                    Notificaciones de riesgo medio y cambios detectados
                  </p>
                </div>
              </label>

              <label className="flex items-center gap-4 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.notificacionesSemanales}
                  onChange={(e) =>
                    handleChange('notificacionesSemanales', e.target.checked)
                  }
                  className="w-5 h-5 rounded bg-input border border-border cursor-pointer accent-primary"
                />
                <div>
                  <p className="font-medium text-foreground">Reportes Semanales</p>
                  <p className="text-sm text-muted-foreground">
                    Resumen semanal de actividades y cambios
                  </p>
                </div>
              </label>
            </div>
          </div>

          <div className="bg-card border border-border rounded-xl p-6 backdrop-blur-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Lock className="w-5 h-5 text-primary" />
              </div>
              <h2 className="text-lg font-semibold text-foreground">Seguridad</h2>
            </div>

            <div className="space-y-3">
              <button className="w-full px-4 py-2 bg-primary/10 border border-primary/30 rounded-lg text-primary hover:bg-primary/20 transition-colors font-medium text-sm">
                Cambiar Contraseña
              </button>
              <button className="w-full px-4 py-2 bg-input border border-border rounded-lg text-foreground hover:bg-primary/10 transition-colors font-medium text-sm">
                Autenticación de Dos Factores
              </button>
            </div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-6 backdrop-blur-sm h-fit">
          <h3 className="text-lg font-semibold text-foreground mb-4">Información del Sistema</h3>
          <div className="space-y-4">
            <div className="py-3 border-b border-border">
              <p className="text-xs text-muted-foreground">Versión del Sistema</p>
              <p className="text-sm font-semibold text-foreground">2.1.0</p>
            </div>
            <div className="py-3 border-b border-border">
              <p className="text-xs text-muted-foreground">Última Actualización</p>
              <p className="text-sm font-semibold text-foreground">25 de mayo, 2024</p>
            </div>
            <div className="py-3">
              <p className="text-xs text-muted-foreground">Estado</p>
              <p className="flex items-center gap-2 text-sm font-semibold text-primary">
                <span className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                Operativo
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-3">
        <button className="px-6 py-2 bg-input border border-border rounded-lg text-foreground hover:bg-primary/10 transition-colors font-medium">
          Cancelar
        </button>
        <button className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-primary to-secondary rounded-lg text-primary-foreground hover:shadow-lg hover:shadow-primary/20 transition-all font-medium">
          <Save className="w-5 h-5" />
          <span>Guardar Cambios</span>
        </button>
      </div>
    </div>
  );
}
