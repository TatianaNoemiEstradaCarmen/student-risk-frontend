import { TrendingUp, TrendingDown } from 'lucide-react';
import type { ReactNode } from 'react';

interface KPICardProps {
  title: string;
  value: string | number;
  change: number;
  icon: ReactNode;
  changeLabel?: string;
}

export function KPICard({ title, value, change, icon, changeLabel }: KPICardProps) {
  const isPositive = change >= 0;

  return (
    <div className="bg-card border border-border rounded-xl p-6 backdrop-blur-sm hover:border-primary/50 transition-all hover:shadow-lg hover:shadow-primary/10">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-muted-foreground text-sm font-medium">{title}</p>
          <h3 className="text-3xl font-bold text-foreground mt-2">{value}</h3>

          <div className="flex items-center gap-2 mt-4">
            <div
              className={`flex items-center gap-1 text-sm font-medium ${
                isPositive ? 'text-accent' : 'text-destructive'
              }`}
            >
              {isPositive ? (
                <TrendingUp className="w-4 h-4" />
              ) : (
                <TrendingDown className="w-4 h-4" />
              )}
              <span>{Math.abs(change)}%</span>
            </div>
            <span className="text-muted-foreground text-sm">
              {changeLabel || 'vs último mes'}
            </span>
          </div>
        </div>

        <div className="p-3 bg-primary/10 rounded-lg">
          <div className="text-primary">{icon}</div>
        </div>
      </div>
    </div>
  );
}
