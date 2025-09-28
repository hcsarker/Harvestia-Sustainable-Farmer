import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Volume2, VolumeX } from "lucide-react";
import { useAudio } from "@/contexts/AudioContext";

export const AudioControls = () => {
  const { isAudioEnabled, toggleAudio, volume, setVolume, playButtonSound } = useAudio();

  const handleToggle = () => {
    if (isAudioEnabled) {
      // Play a quick sound before turning off
      playButtonSound();
    }
    setTimeout(() => toggleAudio(), isAudioEnabled ? 100 : 0);
  };

  const handleVolumeChange = (newVolume: number[]) => {
    setVolume(newVolume[0]);
    // Play a test sound when adjusting volume
    if (isAudioEnabled) {
      playButtonSound();
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9"
          onClick={(e) => {
            e.preventDefault();
            playButtonSound();
          }}
        >
          {isAudioEnabled ? (
            <Volume2 className="h-4 w-4" />
          ) : (
            <VolumeX className="h-4 w-4" />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-4" align="end">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Audio Settings</span>
            <Button
              variant={isAudioEnabled ? "default" : "secondary"}
              size="sm"
              onClick={handleToggle}
            >
              {isAudioEnabled ? "ON" : "OFF"}
            </Button>
          </div>
          
          {isAudioEnabled && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Volume</span>
                <span>{Math.round(volume * 100)}%</span>
              </div>
              <Slider
                value={[volume]}
                onValueChange={handleVolumeChange}
                min={0}
                max={1}
                step={0.1}
                className="w-full"
              />
            </div>
          )}
          
          <div className="text-xs text-muted-foreground">
            {isAudioEnabled 
              ? "Audio feedback enabled for buttons and notifications"
              : "All sounds are disabled"
            }
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};