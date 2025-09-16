import React, { useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { 
  Droplets, 
  Leaf, 
  Calendar,
  Settings,
  AlertTriangle,
  CheckCircle,
  Clock
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface Decision {
  id: string
  type: 'irrigation' | 'fertilizer' | 'livestock'
  title: string
  status: 'pending' | 'scheduled' | 'completed'
  impact: 'low' | 'medium' | 'high'
  cost: number
  week: number
}

interface DecisionsPanelProps {
  currentWeek: number
  onDecisionMake: (decision: Decision) => void
  pastDecisions?: Decision[]
  budget: number
}

export const DecisionsPanel: React.FC<DecisionsPanelProps> = ({
  currentWeek,
  onDecisionMake,
  pastDecisions = [],
  budget
}) => {
  // Irrigation state
  const [irrigationMethod, setIrrigationMethod] = useState<'fixed' | 'soil-trigger' | 'deficit'>('soil-trigger')
  const [irrigationAmount, setIrrigationAmount] = useState([25])
  const [irrigationFrequency, setIrrigationFrequency] = useState('weekly')
  
  // Fertilizer state
  const [fertilizerType, setFertilizerType] = useState('NPK')
  const [fertilizerDose, setFertilizerDose] = useState([50])
  const [splitApplication, setSplitApplication] = useState(true)
  const [useInhibitor, setUseInhibitor] = useState(false)
  
  // Livestock state
  const [stockingRate, setStockingRate] = useState([2])
  const [rotationEnabled, setRotationEnabled] = useState(true)

  const makeIrrigationDecision = () => {
    const cost = irrigationAmount[0] * 2 // $2 per mm
    if (cost > budget) return

    const decision: Decision = {
      id: `irrigation-${Date.now()}`,
      type: 'irrigation',
      title: `${irrigationMethod} irrigation - ${irrigationAmount[0]}mm`,
      status: 'scheduled',
      impact: irrigationAmount[0] > 30 ? 'high' : 'medium',
      cost,
      week: currentWeek + 1
    }
    onDecisionMake(decision)
  }

  const makeFertilizerDecision = () => {
    const baseCost = fertilizerDose[0] * 5
    const cost = baseCost + (useInhibitor ? baseCost * 0.3 : 0)
    if (cost > budget) return

    const decision: Decision = {
      id: `fertilizer-${Date.now()}`,
      type: 'fertilizer',
      title: `${fertilizerType} application - ${fertilizerDose[0]}kg/ha`,
      status: 'scheduled',
      impact: fertilizerDose[0] > 60 ? 'high' : 'medium',
      cost,
      week: currentWeek + 1
    }
    onDecisionMake(decision)
  }

  const makeLivestockDecision = () => {
    const decision: Decision = {
      id: `livestock-${Date.now()}`,
      type: 'livestock',
      title: `Adjust stocking rate to ${stockingRate[0]} animals/ha`,
      status: 'scheduled',
      impact: 'medium',
      cost: 0,
      week: currentWeek + 1
    }
    onDecisionMake(decision)
  }

  const getDecisionIcon = (type: string) => {
    switch (type) {
      case 'irrigation': return <Droplets className="h-4 w-4" />
      case 'fertilizer': return <Leaf className="h-4 w-4" />
      case 'livestock': return <Leaf className="h-4 w-4" />
      default: return <Settings className="h-4 w-4" />
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4 text-primary" />
      case 'scheduled': return <Clock className="h-4 w-4 text-secondary" />
      case 'pending': return <AlertTriangle className="h-4 w-4 text-accent" />
      default: return null
    }
  }

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'hsl(var(--primary))'
      case 'medium': return 'hsl(var(--secondary))'
      case 'low': return 'hsl(var(--muted))'
      default: return 'hsl(var(--muted))'
    }
  }

  return (
    <Card className="w-full bg-background/95 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Farm Decisions
          </div>
          <Badge variant="outline" className="text-sm">
            Budget: ${budget.toLocaleString()}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <Tabs defaultValue="irrigation" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="irrigation" className="flex items-center gap-2">
              <Droplets className="h-4 w-4" />
              Irrigation
            </TabsTrigger>
            <TabsTrigger value="fertilizer" className="flex items-center gap-2">
              <Leaf className="h-4 w-4" />
              Fertilizer
            </TabsTrigger>
            <TabsTrigger value="livestock" className="flex items-center gap-2">
              <Leaf className="h-4 w-4" />
              Livestock
            </TabsTrigger>
          </TabsList>

          <TabsContent value="irrigation" className="space-y-4 mt-4">
            <div className="space-y-4 p-4 border rounded-lg">
              <div>
                <Label className="text-sm font-medium">Irrigation Method</Label>
                <Select value={irrigationMethod} onValueChange={(value: any) => setIrrigationMethod(value)}>
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fixed">Fixed Interval</SelectItem>
                    <SelectItem value="soil-trigger">Soil Moisture Trigger</SelectItem>
                    <SelectItem value="deficit">Deficit Irrigation</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-sm font-medium">
                  Water Amount: {irrigationAmount[0]}mm
                </Label>
                <Slider
                  value={irrigationAmount}
                  onValueChange={setIrrigationAmount}
                  max={50}
                  min={5}
                  step={5}
                  className="mt-2"
                />
              </div>

              <div>
                <Label className="text-sm font-medium">Frequency</Label>
                <Select value={irrigationFrequency} onValueChange={setIrrigationFrequency}>
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="biweekly">Bi-weekly</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between pt-2">
                <div className="text-sm">
                  <p className="font-medium">Cost: ${(irrigationAmount[0] * 2).toLocaleString()}</p>
                  <p className="text-muted-foreground">Impact: Water stress reduction</p>
                </div>
                <Button 
                  onClick={makeIrrigationDecision}
                  disabled={irrigationAmount[0] * 2 > budget}
                  size="sm"
                >
                  Schedule
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="fertilizer" className="space-y-4 mt-4">
            <div className="space-y-4 p-4 border rounded-lg">
              <div>
                <Label className="text-sm font-medium">Fertilizer Type</Label>
                <Select value={fertilizerType} onValueChange={setFertilizerType}>
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="NPK">NPK (15-15-15)</SelectItem>
                    <SelectItem value="Nitrogen">High Nitrogen</SelectItem>
                    <SelectItem value="Phosphorus">High Phosphorus</SelectItem>
                    <SelectItem value="Organic">Organic Compost</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-sm font-medium">
                  Application Rate: {fertilizerDose[0]}kg/ha
                </Label>
                <Slider
                  value={fertilizerDose}
                  onValueChange={setFertilizerDose}
                  max={100}
                  min={10}
                  step={10}
                  className="mt-2"
                />
              </div>

              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="split-application"
                    checked={splitApplication}
                    onCheckedChange={setSplitApplication}
                  />
                  <Label htmlFor="split-application" className="text-sm">
                    Split Application (reduces leaching)
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="inhibitor"
                    checked={useInhibitor}
                    onCheckedChange={setUseInhibitor}
                  />
                  <Label htmlFor="inhibitor" className="text-sm">
                    Nitrification Inhibitor (+30% cost)
                  </Label>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <div className="text-sm">
                  <p className="font-medium">
                    Cost: ${((fertilizerDose[0] * 5) * (useInhibitor ? 1.3 : 1)).toLocaleString()}
                  </p>
                  <p className="text-muted-foreground">Impact: Nutrient availability</p>
                </div>
                <Button 
                  onClick={makeFertilizerDecision}
                  disabled={((fertilizerDose[0] * 5) * (useInhibitor ? 1.3 : 1)) > budget}
                  size="sm"
                >
                  Schedule
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="livestock" className="space-y-4 mt-4">
            <div className="space-y-4 p-4 border rounded-lg">
              <div>
                <Label className="text-sm font-medium">
                  Stocking Rate: {stockingRate[0]} animals/hectare
                </Label>
                <Slider
                  value={stockingRate}
                  onValueChange={setStockingRate}
                  max={5}
                  min={0.5}
                  step={0.5}
                  className="mt-2"
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="rotation"
                  checked={rotationEnabled}
                  onCheckedChange={setRotationEnabled}
                />
                <Label htmlFor="rotation" className="text-sm">
                  Enable Rotational Grazing (improves pasture health)
                </Label>
              </div>

              <div className="flex items-center justify-between pt-2">
                <div className="text-sm">
                  <p className="font-medium">Cost: $0 (management change)</p>
                  <p className="text-muted-foreground">Impact: Pasture recovery</p>
                </div>
                <Button onClick={makeLivestockDecision} size="sm">
                  Apply
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Recent Decisions */}
        {pastDecisions.length > 0 && (
          <>
            <Separator />
            <div className="space-y-3">
              <h4 className="text-sm font-medium flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Recent Decisions
              </h4>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {pastDecisions.slice(-5).map((decision) => (
                  <div
                    key={decision.id}
                    className="flex items-center justify-between p-2 bg-muted/20 rounded text-sm"
                  >
                    <div className="flex items-center gap-2">
                      {getDecisionIcon(decision.type)}
                      <span className="font-medium">{decision.title}</span>
                      <Badge 
                        variant="secondary"
                        style={{ backgroundColor: getImpactColor(decision.impact) + '20' }}
                      >
                        {decision.impact}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">Week {decision.week}</span>
                      {getStatusIcon(decision.status)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}