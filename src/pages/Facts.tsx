import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Lightbulb, Calendar, Clock, Leaf, Bug, Droplets } from "lucide-react"

const farmingFacts = [
  {
    fact: "Earthworms can process their own body weight in soil every single day, making them nature's ultimate soil aerators.",
    category: "Soil Health",
    tip: "Encourage earthworms in your garden by adding organic matter like compost.",
    icon: <Leaf className="h-4 w-4" />
  },
  {
    fact: "A single mature oak tree can produce enough oxygen for two people for one full year.",
    category: "Environmental",
    tip: "Plant native trees around your farm to improve air quality and provide wildlife habitat.",
    icon: <Leaf className="h-4 w-4" />
  },
  {
    fact: "Cover crops can increase soil organic matter by up to 1% annually when properly managed.",
    category: "Sustainable Farming",
    tip: "Plant cover crops like clover or rye grass during off-seasons to protect and enrich soil.",
    icon: <Droplets className="h-4 w-4" />
  },
  {
    fact: "Crop rotation can reduce pest populations by up to 80% compared to monoculture farming.",
    category: "Pest Management",
    tip: "Rotate crops from different plant families to break pest and disease cycles naturally.",
    icon: <Bug className="h-4 w-4" />
  },
  {
    fact: "Mycorrhizal fungi can increase a plant's root surface area by up to 1000 times.",
    category: "Soil Biology",
    tip: "Avoid excessive tilling to preserve beneficial fungal networks in your soil.",
    icon: <Leaf className="h-4 w-4" />
  },
  {
    fact: "Companion planting can increase crop yields by 20-30% while reducing pest damage.",
    category: "Integrated Farming",
    tip: "Plant basil near tomatoes, marigolds near vegetables, and legumes near corn.",
    icon: <Leaf className="h-4 w-4" />
  },
  {
    fact: "One inch of topsoil can take 100-1000 years to form naturally.",
    category: "Soil Conservation",
    tip: "Prevent erosion with ground cover, terracing, and minimal tillage practices.",
    icon: <Droplets className="h-4 w-4" />
  },
  {
    fact: "Beneficial insects can control up to 90% of pest species naturally.",
    category: "Biological Control",
    tip: "Create habitat for beneficial insects with diverse flowering plants and shelter.",
    icon: <Bug className="h-4 w-4" />
  }
]

export default function Facts() {
  const today = new Date()
  const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / 1000 / 60 / 60 / 24)
  const todaysFact = farmingFacts[dayOfYear % farmingFacts.length]

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center space-x-2">
          <Lightbulb className="h-8 w-8 text-primary animate-pulse" />
          <h1 className="text-3xl font-bold gradient-text">Daily Agricultural Facts</h1>
        </div>
        <p className="text-muted-foreground">
          Discover fascinating facts about sustainable farming and agriculture
        </p>
      </div>

      {/* Today's Featured Fact */}
      <Card className="bg-gradient-to-br from-primary/10 to-accent/10 border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center text-primary">
            <Calendar className="h-5 w-5 mr-2" />
            Today's Featured Fact
            <Badge variant="secondary" className="ml-auto">
              {todaysFact.category}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-lg font-medium">
            {todaysFact.fact}
          </p>
          <div className="p-4 bg-accent/20 rounded-lg border border-accent/30">
            <div className="flex items-center space-x-2 mb-2">
              <Lightbulb className="h-4 w-4 text-primary" />
              <span className="text-sm font-semibold text-primary">Pro Tip:</span>
            </div>
            <p className="text-sm text-muted-foreground">
              {todaysFact.tip}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* All Facts Grid */}
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold flex items-center">
          <Clock className="h-6 w-6 mr-2 text-primary" />
          Agricultural Knowledge Base
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {farmingFacts.map((fact, index) => (
            <Card 
              key={index} 
              className={`hover:shadow-lg transition-all duration-300 hover:scale-105 animate-fade-in ${
                index === (dayOfYear % farmingFacts.length) 
                  ? 'ring-2 ring-primary/50 bg-primary/5' 
                  : ''
              }`}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <Badge variant={index === (dayOfYear % farmingFacts.length) ? 'default' : 'secondary'}>
                    <span className="mr-1">{fact.icon}</span>
                    {fact.category}
                  </Badge>
                  {index === (dayOfYear % farmingFacts.length) && (
                    <Badge variant="outline" className="text-xs">
                      Today
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm font-medium">
                  {fact.fact}
                </p>
                <div className="p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center space-x-1 mb-1">
                    <Lightbulb className="h-3 w-3 text-primary" />
                    <span className="text-xs font-medium text-primary">Tip:</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {fact.tip}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}