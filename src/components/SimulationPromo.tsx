import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { FlaskConical, Sparkles, Gauge, Map, ArrowRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export function SimulationPromo() {
  const navigate = useNavigate()
  return (
    <Card className="overflow-hidden border-primary/30 bg-gradient-to-r from-primary/5 to-accent/5">
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-3 rounded-xl bg-primary text-primary-foreground shadow">
              <FlaskConical className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-xl font-semibold">Run the Farm Simulation</h3>
              <p className="text-sm text-muted-foreground max-w-prose">
                Test strategies with live climate inputs and see outcomes for yield, water use, and resilience—before you try them in the field.
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Badge variant="secondary" className="gap-1"><Gauge className="h-3 w-3" /> Real‑time</Badge>
                <Badge variant="outline" className="gap-1"><Map className="h-3 w-3" /> Field‑aware</Badge>
                <Badge variant="default" className="gap-1"><Sparkles className="h-3 w-3" /> AI‑assisted</Badge>
              </div>
            </div>
          </div>
          <Button onClick={() => navigate('/simulation')}>
            Launch Simulation <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

export default SimulationPromo
