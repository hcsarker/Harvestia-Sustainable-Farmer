import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Leaf, Satellite, CloudSun, Rocket } from 'lucide-react'

export default function About() {
  return (
    <div className="container py-10 md:py-14">
      {/* Hero */}
      <div className="mb-8 md:mb-12 flex flex-col items-center text-center">
        <Badge className="mb-3 animate-in fade-in slide-in-from-top-2 bg-gradient-to-r from-emerald-500 to-lime-500 text-white">
          <div className="flex items-center gap-2"><Leaf className="h-4 w-4" /> Sustainable Learning</div>
        </Badge>
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
          About <span className="bg-gradient-to-r from-emerald-500 to-teal-500 bg-clip-text text-transparent">Harvestia</span>
        </h1>
        <p className="mt-3 max-w-2xl text-sm md:text-base text-muted-foreground animate-in fade-in duration-700">
          Learn climate-smart agriculture through interactive lessons, quizzes, and real satellite insights.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6 md:gap-8 items-start">
        {/* Left: Mission */}
        <Card className="animate-in fade-in slide-in-from-left-4">
          <CardHeader>
            <CardTitle>Our Mission</CardTitle>
            <CardDescription>Accessible, data-driven farming education</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              Harvestia brings together modern web technology and open satellite data to help learners
              understand sustainable farming practices and make better decisions under changing climates.
            </p>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <Rocket className="h-5 w-5 text-emerald-500 mt-0.5" />
                <div>
                  <div className="font-medium">Interactive and engaging</div>
                  <div className="text-sm text-muted-foreground">Learn by doing: quizzes, simulations, and tips.</div>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <Satellite className="h-5 w-5 text-emerald-500 mt-0.5" />
                <div>
                  <div className="font-medium">Powered by satellite data</div>
                  <div className="text-sm text-muted-foreground">NASA POWER, MODIS, SMAP, GPM and more.</div>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <CloudSun className="h-5 w-5 text-emerald-500 mt-0.5" />
                <div>
                  <div className="font-medium">Climate-smart practices</div>
                  <div className="text-sm text-muted-foreground">Turn insights into practical field decisions.</div>
                </div>
              </li>
            </ul>
          </CardContent>
        </Card>

        {/* Right: Illustration */}
        <Card className="overflow-hidden group animate-in fade-in slide-in-from-right-4">
          <CardContent className="p-0">
            <div className="relative">
              <img
                src="/Team logo.jpg"
                alt="Harvestia"
                className="w-full h-[260px] md:h-[340px] object-cover transform transition duration-500 group-hover:scale-[1.02]"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/60 to-transparent" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Data Sources */}
      <div className="mt-8 grid sm:grid-cols-3 gap-4 md:gap-6">
        {[
          { icon: Satellite, title: 'NASA POWER', desc: 'Irradiance, temperature, wind' },
          { icon: CloudSun, title: 'GPM & SMAP', desc: 'Rainfall, soil moisture' },
          { icon: Leaf, title: 'MODIS', desc: 'Vegetation and land surface' },
        ].map((item, i) => (
          <Card key={i} className="hover:shadow-md transition-all duration-300 animate-in fade-in slide-in-from-bottom-2">
            <CardContent className="p-5 flex items-start gap-3">
              <item.icon className="h-5 w-5 text-emerald-500 mt-0.5" />
              <div>
                <div className="font-medium">{item.title}</div>
                <div className="text-sm text-muted-foreground">{item.desc}</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
