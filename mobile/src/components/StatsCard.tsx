import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { LucideIcon } from "lucide-react"

interface StatsCardProps {
  title: string
  value: string | number | React.ReactNode
  icon: LucideIcon
  trend?: {
    value: number
    isPositive: boolean
  }
  className?: string
  animate?: boolean
}

export function StatsCard({ title, value, icon: Icon, trend, className, animate = true }: StatsCardProps) {
  return (
    <Card className={cn(
      "hover:shadow-lg transition-all duration-300",
      animate && "hover:scale-105 hover:shadow-primary/10",
      className
    )}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <div className="flex items-center space-x-2">
              <h3 className="text-2xl font-bold text-foreground">{value}</h3>
              {trend && (
                <span className={cn(
                  "text-xs px-2 py-1 rounded-full",
                  trend.isPositive 
                    ? "text-emerald-600 bg-emerald-100 dark:text-emerald-400 dark:bg-emerald-900/30" 
                    : "text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/30"
                )}>
                  {trend.isPositive ? '+' : ''}{trend.value}%
                </span>
              )}
            </div>
          </div>
          <div className="p-3 rounded-full bg-primary/10 text-primary">
            <Icon className={cn("h-6 w-6", animate && "animate-float")} />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}