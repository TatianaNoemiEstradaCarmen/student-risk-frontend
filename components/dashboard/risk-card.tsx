"use client"

import { RiskFactorsBadge, type RiskFactor } from "@/components/dashboard/risk-factors-badge"
import {
  ShieldCheck,
  ShieldAlert,
  ShieldX,
  TrendingUp,
} from "lucide-react"

interface RiskComponents {
  gpaScore: number
  attendanceScore: number
  failedCoursesScore: number
  progressScore: number
}

interface RiskCardProps {
  risk: "LOW" | "MEDIUM" | "HIGH"
  riskScore: number
  components?: RiskComponents
  factors?: RiskFactor[]
  explanation?: string
  recommendation?: string
  compact?: boolean
  className?: string
}

const riskConfig = {
  HIGH: {
    icon: ShieldX,
    color: "text-red-400",
    bgColor: "bg-red-500/10",
    borderColor: "border-red-500/20",
    gradientFrom: "from-red-500",
    gradientTo: "to-red-600",
    ringColor: "stroke-red-500",
    bgRing: "stroke-red-500/15",
    label: "Riesgo Alto",
  },
  MEDIUM: {
    icon: ShieldAlert,
    color: "text-yellow-400",
    bgColor: "bg-yellow-500/10",
    borderColor: "border-yellow-500/20",
    gradientFrom: "from-yellow-500",
    gradientTo: "to-yellow-600",
    ringColor: "stroke-yellow-500",
    bgRing: "stroke-yellow-500/15",
    label: "Riesgo Medio",
  },
  LOW: {
    icon: ShieldCheck,
    color: "text-green-400",
    bgColor: "bg-green-500/10",
    borderColor: "border-green-500/20",
    gradientFrom: "from-green-500",
    gradientTo: "to-green-600",
    ringColor: "stroke-green-500",
    bgRing: "stroke-green-500/15",
    label: "Riesgo Bajo",
  },
}

const componentLabels: Record<string, string> = {
  gpaScore: "Promedio",
  attendanceScore: "Asistencia",
  failedCoursesScore: "Desaprobados",
  progressScore: "Progreso",
}

const componentIcons: Record<string, React.ReactNode> = {
  gpaScore: <TrendingUp className="h-3 w-3" />,
  attendanceScore: "📋",
  failedCoursesScore: "⚠️",
  progressScore: "📊",
}

function GaugeCircle({ score, config }: { score: number; config: typeof riskConfig.HIGH }) {
  const radius = 40
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (score / 100) * circumference

  return (
    <div className="relative flex items-center justify-center">
      <svg width="100" height="100" viewBox="0 0 100 100" className="-rotate-90">
        {/* Fondo */}
        <circle
          cx="50"
          cy="50"
          r={radius}
          fill="none"
          strokeWidth="8"
          className={config.bgRing}
        />
        {/* Progreso */}
        <circle
          cx="50"
          cy="50"
          r={radius}
          fill="none"
          strokeWidth="8"
          strokeLinecap="round"
          stroke="currentColor"
          className={config.ringColor}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 0.8s ease" }}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className={`text-2xl font-bold ${config.color}`}>
          {score.toFixed(0)}
        </span>
        <span className="text-[10px] text-foreground/40">/100</span>
      </div>
    </div>
  )
}

function ComponentBar({ label, score }: { label: string; score: number }) {
  const getBarColor = (s: number) => {
    if (s < 40) return "bg-red-500"
    if (s < 65) return "bg-yellow-500"
    return "bg-green-500"
  }

  return (
    <div className="flex items-center gap-2">
      <span className="text-[10px] text-foreground/50 w-20 truncate">
        {label}
      </span>
      <div className="flex-1 h-1.5 rounded-full bg-primary/10 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${getBarColor(score)}`}
          style={{ width: `${Math.min(score, 100)}%` }}
        />
      </div>
      <span className={`text-[10px] font-medium w-7 text-right ${getBarColor(score)}`}>
        {score.toFixed(0)}
      </span>
    </div>
  )
}

export function RiskCard({
  risk,
  riskScore,
  components,
  factors = [],
  explanation,
  recommendation,
  compact = false,
  className = "",
}: RiskCardProps) {
  const config = riskConfig[risk] || riskConfig.LOW
  const Icon = config.icon

  if (compact) {
    // Versión compacta para tablas
    return (
      <div className={`flex items-center gap-3 ${className}`}>
        <div className={`rounded-full p-2 ${config.bgColor}`}>
          <Icon className={`h-5 w-5 ${config.color}`} />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className={`text-sm font-bold ${config.color}`}>
              {riskScore.toFixed(1)}
            </span>
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full border ${config.borderColor} ${config.bgColor} ${config.color}`}>
              {config.label}
            </span>
          </div>
          {factors.length > 0 && (
            <RiskFactorsBadge factors={factors.slice(0, 2)} className="mt-1" />
          )}
        </div>
      </div>
    )
  }

  // Versión completa
  return (
    <div className={`rounded-2xl border ${config.borderColor} bg-card/40 backdrop-blur-xl p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className={`rounded-xl p-2.5 ${config.bgColor}`}>
            <Icon className={`h-6 w-6 ${config.color}`} />
          </div>
          <div>
            <h3 className={`text-lg font-bold ${config.color}`}>
              {config.label}
            </h3>
            {recommendation && (
              <p className="text-xs text-foreground/60">{recommendation}</p>
            )}
          </div>
        </div>
        <span className={`text-sm font-semibold ${config.color}`}>
          Score: {riskScore.toFixed(1)}/100
        </span>
      </div>

      {/* Gauge + Componentes */}
      <div className="flex items-center gap-6 mb-6">
        <GaugeCircle score={riskScore} config={config} />
        
        {components && (
          <div className="flex-1 space-y-2.5">
            {Object.entries(components).map(([key, score]) => (
              <ComponentBar
                key={key}
                label={componentLabels[key] || key}
                score={score}
              />
            ))}
          </div>
        )}
      </div>

      {/* Factores */}
      <div className="border-t border-border pt-4">
        <h4 className="text-xs font-semibold text-foreground/40 uppercase tracking-wider mb-3">
          Factores de Riesgo
        </h4>
        <RiskFactorsBadge factors={factors} />
      </div>

      {/* Explicación (solo si hay factores) */}
      {explanation && factors.length > 0 && (
        <p className="mt-4 text-[11px] leading-relaxed text-foreground/50 italic border-l-2 border-primary/20 pl-3">
          {explanation}
        </p>
      )}
    </div>
  )
}