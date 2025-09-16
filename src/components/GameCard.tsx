import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { LucideIcon } from "lucide-react"
import { Clock, Users, Star, Play } from "lucide-react"

interface GameCardProps {
  title: string
  description: string
  category: string
  difficulty: string
  duration: string
  highScore: number
  players: number
  rating: number
  icon: LucideIcon
  color: string
  onClick?: () => void
}

export function GameCard({
  title,
  description,
  category,
  difficulty,
  duration,
  highScore,
  players,
  rating,
  icon: Icon,
  color,
  onClick
}: GameCardProps) {
  return (
    <Card className="hover:shadow-xl transition-all duration-300 hover:scale-105 animate-fade-in cursor-pointer" onClick={onClick}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between mb-2">
          <div className={cn("p-2 rounded-lg text-white animate-float", color)}>
            <Icon className="h-5 w-5" />
          </div>
          <Badge variant="outline">{difficulty}</Badge>
        </div>
        <CardTitle className="text-lg">{title}</CardTitle>
        <CardDescription className="text-sm">
          {description}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center">
            <Clock className="h-3 w-3 mr-1" />
            {duration}
          </div>
          <div className="flex items-center">
            <Users className="h-3 w-3 mr-1" />
            {players}
          </div>
          <div className="flex items-center">
            <Star className="h-3 w-3 mr-1 fill-current text-yellow-500" />
            {rating}
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="text-xs">
            <span className="text-muted-foreground">Best Score: </span>
            <span className="font-mono font-semibold text-primary">{highScore.toLocaleString()}</span>
          </div>
          <Badge variant="secondary" className="text-xs">
            {category}
          </Badge>
        </div>
        
        <Button className="w-full hover:scale-105 transition-transform" size="sm">
          <Play className="h-4 w-4 mr-2" />
          Play Now
        </Button>
      </CardContent>
    </Card>
  )
}