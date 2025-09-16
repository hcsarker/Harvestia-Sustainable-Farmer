import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface FarmingCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  color: "primary" | "accent" | "secondary" | "muted";
  onClick?: () => void;
}

const colorVariants = {
  primary: "bg-gradient-to-br from-primary to-primary/80 text-primary-foreground",
  accent: "bg-gradient-to-br from-accent to-accent/80 text-accent-foreground", 
  secondary: "bg-gradient-to-br from-secondary to-secondary/80 text-secondary-foreground",
  muted: "bg-gradient-to-br from-muted to-muted/80 text-muted-foreground"
};

export const FarmingCard = ({ title, description, icon, color, onClick }: FarmingCardProps) => {
  return (
    <Card 
      className={cn(
        "p-6 cursor-pointer transition-all duration-200 hover:scale-105 border-0",
        "hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)]",
        colorVariants[color]
      )}
      onClick={onClick}
    >
      <div className="flex flex-col items-center text-center space-y-4">
        <div className="text-4xl">
          {icon}
        </div>
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">{title}</h3>
          <p className="text-sm opacity-90">{description}</p>
        </div>
      </div>
    </Card>
  );
};