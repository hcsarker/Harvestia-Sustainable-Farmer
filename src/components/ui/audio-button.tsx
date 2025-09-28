import React from 'react';
import { Button as BaseButton } from "@/components/ui/button";
import { useAudio } from "@/contexts/AudioContext";
import { ButtonProps } from "@/components/ui/button";

interface AudioButtonProps extends ButtonProps {
  soundType?: 'button' | 'success' | 'error' | 'notification';
  disabled?: boolean;
}

export const AudioButton = React.forwardRef<HTMLButtonElement, AudioButtonProps>(
  ({ soundType = 'button', onClick, disabled, children, ...props }, ref) => {
    const { playButtonSound, playSuccessSound, playErrorSound, playNotificationSound } = useAudio();

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (disabled) return;

      // Play appropriate sound
      switch (soundType) {
        case 'success':
          playSuccessSound();
          break;
        case 'error':
          playErrorSound();
          break;
        case 'notification':
          playNotificationSound();
          break;
        default:
          playButtonSound();
          break;
      }

      // Call original onClick handler
      if (onClick) {
        onClick(e);
      }
    };

    return (
      <BaseButton
        ref={ref}
        onClick={handleClick}
        disabled={disabled}
        {...props}
      >
        {children}
      </BaseButton>
    );
  }
);

AudioButton.displayName = "AudioButton";