"use client"

import {
  AlertTriangle,
  TrendingDown,
  BookOpen,
  GraduationCap,
  Clock,
} from "lucide-react"

export interface RiskFactor {
  key: string
  label: string
  message: string
  severity: "high" | "medium" | "low"
  value: number | null
  score: number
  weight: number
}

interface RiskFactorsBadgeProps {
  factors: RiskFactor[]
  className?: string
}

const factorIcons: Record<string, React.ReactNode> = {
  low_gpa: <TrendingDown className="h-3.5 w-3.5" />,
  low_attendance: <Clock className="h-3.5 w-3.5" />,
  failed_courses: <AlertTriangle className="h-3.5 w-3.5" />,
  low_progress: <GraduationCap className="h-3.5 w-3.5" />,
}

const severityStyles = {
  high: "border-red-500/30 bg-red-500/10 text-red-400",
  medium: "border-yellow-500/30 bg-yellow-500/10 text-yellow-400",
  low: "border-blue-500/30 bg-blue-500/10 text-blue-400",
}

const severityDots = {
  high: "bg-red-500",
  medium: "bg-yellow-500",
  low: "bg-blue-500",
}

export function RiskFactorsBadge({ factors, className = "" }: RiskFactorsBadgeProps) {
  if (!factors || factors.length === 0) {
    return (
      <div className={`flex items-center gap-2 text-xs text-green-400 ${className}`}>
        <div className="h-2 w-2 rounded-full bg-green-500" />
        <span>Sin factores críticos</span>
      </div>
    )
  }

  return (
    <div className={`flex flex-wrap gap-1.5 ${className}`}>
      {factors.map((factor) => (
        <div
          key={factor.key}
          className="group relative"
        >
          <span
            className={`
              inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 
              text-[11px] font-medium cursor-help transition-all
              hover:scale-105
              ${severityStyles[factor.severity]}
            `}
          >
            <span className={`h-1.5 w-1.5 rounded-full ${severityDots[factor.severity]}`} />
            {factorIcons[factor.key]}
            {factor.label}
            <span className="text-[10px] opacity-60 ml-0.5">
              {factor.score.toFixed(0)}%
            </span>
          </span>

          {/* Tooltip */}
          <div className="
            absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2
            bg-popover border border-border rounded-lg shadow-xl
            text-xs text-foreground w-64 z-50
            opacity-0 invisible group-hover:opacity-100 group-hover:visible
            transition-all duration-200 pointer-events-none
          ">
            <p className="leading-relaxed">{factor.message}</p>
            <div className="mt-2 flex items-center gap-2 text-[10px] text-foreground/50">
              <span>Peso: {(factor.weight * 100).toFixed(0)}%</span>
              <span>•</span>
              <span>Score: {factor.score.toFixed(0)}/100</span>
            </div>
            <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1
              border-4 border-transparent border-t-popover" 
            />
          </div>
        </div>
      ))}
    </div>
  )
}