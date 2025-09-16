import { Button } from "@/components/ui/button";
import { Menu, User } from "lucide-react";

interface HeaderProps {
  onMenuClick?: () => void;
}

export const Header = ({ onMenuClick }: HeaderProps) => {
  return (
    <header className="flex items-center justify-between p-4 bg-card border-b border-border">
      <div className="flex items-center space-x-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={onMenuClick}
          className="md:hidden"
        >
          <Menu className="h-5 w-5" />
        </Button>
        <div className="flex items-center space-x-2">
          <span className="text-2xl">🌾</span>
          <h1 className="text-xl font-bold text-primary">HARVESTIA</h1>
        </div>
      </div>
      
      <Button variant="outline" size="icon" className="rounded-full">
        <User className="h-5 w-5" />
      </Button>
    </header>
  );
};