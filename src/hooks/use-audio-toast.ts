import { useToast as useBaseToast, toast as baseToast } from "./use-toast";
import { useAudio } from "@/contexts/AudioContext";

interface AudioToastOptions {
  title?: string;
  description?: string;
  variant?: "default" | "destructive";
  withSound?: boolean;
}

export function useAudioToast() {
  const { toast: baseToastFn, ...rest } = useBaseToast();
  const { playSuccessSound, playErrorSound, playNotificationSound } = useAudio();

  const toast = (options: AudioToastOptions) => {
    const { withSound = true, variant, ...toastOptions } = options;

    // Play appropriate sound based on variant
    if (withSound) {
      switch (variant) {
        case 'destructive':
          playErrorSound();
          break;
        default:
          if (options.title?.includes('Success') || options.title?.includes('Complete')) {
            playSuccessSound();
          } else {
            playNotificationSound();
          }
          break;
      }
    }

    return baseToastFn({
      ...toastOptions,
      variant,
    });
  };

  const successToast = (title: string, description?: string) => {
    return toast({
      title,
      description,
      variant: "default",
      withSound: true,
    });
  };

  const errorToast = (title: string, description?: string) => {
    return toast({
      title,
      description,
      variant: "destructive",
      withSound: true,
    });
  };

  const infoToast = (title: string, description?: string) => {
    return toast({
      title,
      description,
      variant: "default",
      withSound: true,
    });
  };

  return {
    ...rest,
    toast,
    successToast,
    errorToast,
    infoToast,
  };
}

// Also create enhanced version of the standalone toast function
export const audioToast = {
  success: (title: string, description?: string) => {
    // Since we can't use hooks here, we'll use a global audio context
    // This is a compromise for standalone usage
    baseToast({
      title,
      description,
      variant: "default",
    });
  },
  error: (title: string, description?: string) => {
    baseToast({
      title,
      description,
      variant: "destructive",
    });
  },
  info: (title: string, description?: string) => {
    baseToast({
      title,
      description,
      variant: "default",
    });
  },
};