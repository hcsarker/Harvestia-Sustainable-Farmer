import { FarmingCard } from "@/components/FarmingCard";
import { EnhancedFarmingCard } from "@/components/EnhancedFarmingCard";
import { FarmingTip } from "@/components/FarmingTip";
import { StatsCard } from "@/components/StatsCard";
import { InteractiveChart } from "@/components/InteractiveChart";
import { ProgressRing } from "@/components/ProgressRing";
import { AnimatedCounter } from "@/components/AnimatedCounter";
import { useState } from "react";
import { 
  Sprout, 
  Droplets, 
  Beef, 
  BarChart3, 
  Map, 
  BookOpen, 
  Trophy, 
  User,
  Thermometer,
  CloudRain,
  Sun,
  Wind,
  Zap,
  Shield,
  Heart,
  Target
} from "lucide-react";

const Index = () => {
  const [selectedModule, setSelectedModule] = useState<string | null>(null);

  // Sample data for charts
  const yieldData = [
    { month: 'Jan', yield: 2400 },
    { month: 'Feb', yield: 2600 },
    { month: 'Mar', yield: 2800 },
    { month: 'Apr', yield: 3200 },
    { month: 'May', yield: 3500 },
    { month: 'Jun', yield: 3800 }
  ];

  const weatherData = [
    { day: 'Mon', temp: 22 },
    { day: 'Tue', temp: 25 },
    { day: 'Wed', temp: 23 },
    { day: 'Thu', temp: 27 },
    { day: 'Fri', temp: 24 },
    { day: 'Sat', temp: 26 },
    { day: 'Sun', temp: 28 }
  ];

  const farmingModules = [
    {
      id: "crops",
      title: "Crop Management",
      description: "Advanced monitoring and optimization of crop growth using real-time satellite data and AI-powered insights",
      icon: <Sprout className="h-8 w-8" />,
      color: "primary" as const,
      stats: [
        { label: "Fields", value: "12" },
        { label: "Yield", value: "+23%" }
      ],
      features: [
        "Real-time health monitoring",
        "Predictive yield analysis", 
        "Disease detection alerts"
      ]
    },
    {
      id: "irrigation", 
      title: "Smart Irrigation",
      description: "Precision water management system powered by SMAP soil moisture data and weather forecasting",
      icon: <Droplets className="h-8 w-8" />,
      color: "accent" as const,
      stats: [
        { label: "Water Saved", value: "30%" },
        { label: "Efficiency", value: "85%" }
      ],
      features: [
        "Automated scheduling",
        "Soil moisture tracking",
        "Weather integration"
      ]
    },
    {
      id: "livestock",
      title: "Livestock Grazing",
      description: "Optimize pasture management and animal health through satellite vegetation monitoring",
      icon: <Beef className="h-8 w-8" />,
      color: "secondary" as const,
      stats: [
        { label: "Pastures", value: "8" },
        { label: "Health", value: "92%" }
      ],
      features: [
        "Grazing rotation planning",
        "Vegetation health tracking",
        "Animal location monitoring"
      ]
    },
    {
      id: "analytics",
      title: "Farm Analytics", 
      description: "Comprehensive data insights and reporting from NASA climate datasets and IoT sensors",
      icon: <BarChart3 className="h-8 w-8" />,
      color: "muted" as const,
      stats: [
        { label: "Data Points", value: "1.2M" },
        { label: "Accuracy", value: "94%" }
      ],
      features: [
        "Predictive modeling",
        "Trend analysis",
        "Custom reports"
      ]
    },
    {
      id: "mapping",
      title: "Field Mapping",
      description: "Interactive high-resolution satellite imagery analysis with boundary detection and change monitoring",
      icon: <Map className="h-8 w-8" />,
      color: "primary" as const,
      stats: [
        { label: "Resolution", value: "10cm" },
        { label: "Updates", value: "Daily" }
      ],
      features: [
        "Boundary mapping",
        "Change detection",
        "3D visualization"
      ]
    },
    {
      id: "learning",
      title: "Farming Guide",
      description: "Interactive learning platform with courses, tutorials, and expert guidance for sustainable practices",
      icon: <BookOpen className="h-8 w-8" />,
      color: "accent" as const,
      stats: [
        { label: "Courses", value: "25+" },
        { label: "Progress", value: "72%" }
      ],
      features: [
        "Expert-led courses",
        "Practical tutorials",
        "Community forum"
      ]
    }
  ];

  return (
    <main className="container mx-auto px-4 py-8 space-y-8">
      {/* Welcome Section */}
      <div className="text-center space-y-6 animate-fade-in">
        <div className="relative">
          <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent animate-float">
            🌾 HARVESTIA 🛰️
          </h1>
          <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-accent/20 blur-3xl -z-10"></div>
        </div>
        <p className="text-2xl font-medium text-muted-foreground">
          Welcome back, <span className="text-primary font-bold">Sustainable Farmer!</span> 
        </p>
        <p className="text-lg text-foreground/80 max-w-3xl mx-auto leading-relaxed">
          Your intelligent gateway to data-driven sustainable agriculture using cutting-edge NASA satellite insights and precision farming technology
        </p>
        
        {/* Live Stats Banner */}
        <div className="flex items-center justify-center space-x-8 py-4 px-6 bg-gradient-to-r from-primary/10 to-accent/10 rounded-full border border-primary/20">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium">System Active</span>
          </div>
          <div className="flex items-center space-x-2">
            <Thermometer className="h-4 w-4 text-primary" />
            <span className="text-sm">24°C</span>
          </div>
          <div className="flex items-center space-x-2">
            <CloudRain className="h-4 w-4 text-accent" />
            <span className="text-sm">Optimal</span>
          </div>
        </div>
      </div>

        {/* Enhanced Stats Grid */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatsCard
            title="Fields Monitored"
            value={12}
            icon={Map}
            trend={{ value: 8.5, isPositive: true }}
          />
          <StatsCard
            title="Water Efficiency"
            value="85%"
            icon={Droplets}
            trend={{ value: 12.3, isPositive: true }}
          />
          <StatsCard
            title="Sustainability Score"
            value={2100}
            icon={Shield}
            trend={{ value: 5.7, isPositive: true }}
          />
          <StatsCard
            title="Achievements"
            value={7}
            icon={Trophy}
            trend={{ value: 16.2, isPositive: true }}
          />
        </section>

        {/* Progress Overview */}
        <section className="grid md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-br from-card to-primary/5 p-6 rounded-xl border border-primary/20">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Learning Progress</h3>
              <BookOpen className="h-5 w-5 text-primary" />
            </div>
            <div className="flex items-center justify-center">
              <ProgressRing progress={72} size={100} />
            </div>
            <p className="text-center text-sm text-muted-foreground mt-2">
              3 of 5 courses completed
            </p>
          </div>
          
          <div className="bg-gradient-to-br from-card to-accent/5 p-6 rounded-xl border border-accent/20">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Farm Health</h3>
              <Heart className="h-5 w-5 text-accent" />
            </div>
            <div className="flex items-center justify-center">
              <ProgressRing progress={88} size={100} color="hsl(var(--accent))" />
            </div>
            <p className="text-center text-sm text-muted-foreground mt-2">
              Excellent condition
            </p>
          </div>
          
          <div className="bg-gradient-to-br from-card to-secondary/5 p-6 rounded-xl border border-secondary/20">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Weekly Goals</h3>
              <Target className="h-5 w-5 text-secondary" />
            </div>
            <div className="flex items-center justify-center">
              <ProgressRing progress={64} size={100} color="hsl(var(--secondary))" />
            </div>
            <p className="text-center text-sm text-muted-foreground mt-2">
              4 of 7 goals achieved
            </p>
          </div>
        </section>

        {/* Data Visualizations */}
        <section className="grid md:grid-cols-2 gap-6">
          <InteractiveChart
            title="Crop Yield Trends"
            description="Monthly yield performance across all fields"
            data={yieldData}
            xKey="month"
            yKey="yield"
            type="line"
          />
          <InteractiveChart
            title="Weekly Temperature"
            description="Daily temperature readings this week"
            data={weatherData}
            xKey="day"
            yKey="temp"
            type="bar"
            color="hsl(var(--accent))"
          />
        </section>

        {/* Daily Farming Tip */}
        <FarmingTip />

        {/* Enhanced Farming Modules Grid */}
        <section className="space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Explore Your Smart Farm
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Discover powerful modules designed to transform your farming operations with cutting-edge technology
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {farmingModules.map((module, index) => (
              <div key={module.id} style={{ animationDelay: `${index * 0.1}s` }}>
                <EnhancedFarmingCard
                  title={module.title}
                  description={module.description}
                  icon={module.icon}
                  color={module.color}
                  stats={module.stats}
                  features={module.features}
                  onClick={() => setSelectedModule(module.id)}
                />
              </div>
            ))}
          </div>
        </section>

        {/* Quick Actions */}
        <section className="bg-gradient-to-r from-primary/10 via-accent/10 to-secondary/10 p-6 rounded-xl border border-primary/20">
          <h3 className="text-xl font-semibold mb-4 flex items-center">
            <Zap className="h-5 w-5 mr-2 text-primary animate-pulse" />
            Quick Actions
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <button className="flex items-center space-x-2 p-3 bg-white/50 dark:bg-black/20 rounded-lg hover:bg-white/80 dark:hover:bg-black/40 transition-all duration-300 hover:scale-105 border border-primary/20">
              <Sun className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">Weather</span>
            </button>
            <button className="flex items-center space-x-2 p-3 bg-white/50 dark:bg-black/20 rounded-lg hover:bg-white/80 dark:hover:bg-black/40 transition-all duration-300 hover:scale-105 border border-accent/20">
              <BarChart3 className="h-4 w-4 text-accent" />
              <span className="text-sm font-medium">Analytics</span>
            </button>
            <button className="flex items-center space-x-2 p-3 bg-white/50 dark:bg-black/20 rounded-lg hover:bg-white/80 dark:hover:bg-black/40 transition-all duration-300 hover:scale-105 border border-secondary/20">
              <Wind className="h-4 w-4 text-secondary" />
              <span className="text-sm font-medium">Air Quality</span>
            </button>
            <button className="flex items-center space-x-2 p-3 bg-white/50 dark:bg-black/20 rounded-lg hover:bg-white/80 dark:hover:bg-black/40 transition-all duration-300 hover:scale-105 border border-primary/20">
              <Shield className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">Alerts</span>
            </button>
          </div>
        </section>

      {/* Enhanced Footer */}
      <footer className="text-center pt-12 pb-6 border-t border-primary/20 bg-gradient-to-r from-primary/5 to-accent/5">
        <div className="space-y-4">
          <div className="flex items-center justify-center space-x-2 text-2xl">
            <span className="animate-bounce-subtle">🌱</span>
            <span className="animate-bounce-subtle" style={{animationDelay: '0.1s'}}>📊</span>
            <span className="animate-bounce-subtle" style={{animationDelay: '0.2s'}}>🛰️</span>
            <span className="animate-bounce-subtle" style={{animationDelay: '0.3s'}}>🌾</span>
          </div>
          <p className="text-sm text-muted-foreground font-medium">
            Explore • Learn • Discover • Harvest • Sustain
          </p>
          <p className="text-xs text-muted-foreground/70">
            Powered by NASA Earth Science Data & AI Technology
          </p>
        </div>
      </footer>
    </main>
  );
};

export default Index;
