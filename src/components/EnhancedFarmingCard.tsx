import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { ArrowRight, Zap } from "lucide-react";

interface EnhancedFarmingCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  color: "primary" | "accent" | "secondary" | "muted";
  stats?: {
    label: string;
    value: string;
  }[];
  features?: string[];
  onClick?: () => void;
}

const colorVariants = {
  primary: {
    card: "bg-gradient-to-br from-primary/10 to-primary/20 border-primary/30 hover:from-primary/20 hover:to-primary/30",
    icon: "text-primary",
    button: "bg-primary hover:bg-primary/90"
  },
  accent: {
    card: "bg-gradient-to-br from-accent/10 to-accent/20 border-accent/30 hover:from-accent/20 hover:to-accent/30",
    icon: "text-accent",
    button: "bg-accent hover:bg-accent/90"
  },
  secondary: {
    card: "bg-gradient-to-br from-secondary/10 to-secondary/20 border-secondary/30 hover:from-secondary/20 hover:to-secondary/30",
    icon: "text-secondary", 
    button: "bg-secondary hover:bg-secondary/90"
  },
  muted: {
    card: "bg-gradient-to-br from-muted/20 to-muted/30 border-muted/40 hover:from-muted/30 hover:to-muted/40",
    icon: "text-muted-foreground",
    button: "bg-muted hover:bg-muted/90"
  }
};

export const EnhancedFarmingCard = ({ 
  title, 
  description, 
  icon, 
  color, 
  stats, 
  features, 
  onClick 
}: EnhancedFarmingCardProps) => {
  const variant = colorVariants[color];

  return (
    <Card 
      className={cn(
        "p-6 cursor-pointer transition-all duration-300 hover:scale-105 border animate-fade-in",
        "hover:shadow-xl hover:shadow-primary/10 group",
        variant.card
      )}
      onClick={onClick}
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className={cn("text-4xl animate-float", variant.icon)}>
            {icon}
          </div>
          <Badge variant="secondary" className="opacity-80">
            <Zap className="h-3 w-3 mr-1" />
            Active
          </Badge>
        </div>

        {/* Content */}
        <div className="space-y-3">
          <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors">
            {title}
          </h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {description}
          </p>
        </div>

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-2 gap-3">
            {stats.map((stat, index) => (
              <div key={index} className="text-center p-2 bg-background/50 rounded-lg">
                <div className={cn("text-lg font-bold", variant.icon)}>{stat.value}</div>
                <div className="text-xs text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        )}

        {/* Features */}
        {features && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-foreground">Key Features:</h4>
            <div className="space-y-1">
              {features.slice(0, 3).map((feature, index) => (
                <div key={index} className="flex items-center text-xs text-muted-foreground">
                  <ArrowRight className="h-3 w-3 mr-2 text-primary opacity-60" />
                  {feature}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Button */}
        <Button 
          className={cn(
            "w-full group-hover:scale-105 transition-transform",
            variant.button
          )}
          size="sm"
        >
          Explore Module
          <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
        </Button>
      </div>
    </Card>
  );
};