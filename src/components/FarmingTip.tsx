import { Card } from "@/components/ui/card";
import { Lightbulb } from "lucide-react";

export const FarmingTip = () => {
  const tips = [
    "Crop rotation helps maintain soil nutrients and reduces pest buildup naturally.",
    "Monitor soil moisture levels regularly - overwatering can be as harmful as underwatering.",
    "Companion planting can naturally deter pests and improve crop yields.",
    "Use NASA SMAP data to optimize irrigation timing based on soil moisture patterns.",
    "MODIS vegetation indices help track crop health and predict harvest timing."
  ];

  const randomTip = tips[Math.floor(Math.random() * tips.length)];

  return (
    <Card className="p-6 bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20">
      <div className="flex items-start space-x-4">
        <div className="p-2 bg-primary/20 rounded-lg">
          <Lightbulb className="h-5 w-5 text-primary" />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-primary mb-2">
            🌱 Daily Farming Insight
          </h3>
          <p className="text-foreground/90">
            {randomTip}
          </p>
        </div>
      </div>
    </Card>
  );
};