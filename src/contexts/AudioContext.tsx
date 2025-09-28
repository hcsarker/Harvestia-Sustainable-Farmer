import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface AudioSettingsType {
  isAudioEnabled: boolean;
  toggleAudio: () => void;
  playButtonSound: () => void;
  playSuccessSound: () => void;
  playErrorSound: () => void;
  playNotificationSound: () => void;
  volume: number;
  setVolume: (volume: number) => void;
}

const AudioSettingsContext = createContext<AudioSettingsType | undefined>(undefined);

interface AudioProviderProps {
  children: ReactNode;
}

export const AudioProvider: React.FC<AudioProviderProps> = ({ children }) => {
  const [isAudioEnabled, setIsAudioEnabled] = useState(() => {
    const saved = localStorage.getItem('harvestia-audio-enabled');
    return saved ? JSON.parse(saved) : true;
  });

  const [volume, setVolumeState] = useState(() => {
    const saved = localStorage.getItem('harvestia-audio-volume');
    return saved ? JSON.parse(saved) : 0.7;
  });

  useEffect(() => {
    localStorage.setItem('harvestia-audio-enabled', JSON.stringify(isAudioEnabled));
  }, [isAudioEnabled]);

  useEffect(() => {
    localStorage.setItem('harvestia-audio-volume', JSON.stringify(volume));
  }, [volume]);

  const toggleAudio = () => {
    setIsAudioEnabled(!isAudioEnabled);
  };

  const setVolume = (newVolume: number) => {
    setVolumeState(Math.max(0, Math.min(1, newVolume)));
  };

  // Web Audio API sounds
  const playSound = (frequency: number, duration: number, type: OscillatorType = 'sine') => {
    if (!isAudioEnabled) return;

    try {
      const WebAudioContext = window.AudioContext || (window as unknown as { webkitAudioContext: typeof window.AudioContext }).webkitAudioContext;
      const audioCtx = new WebAudioContext();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);

      oscillator.frequency.setValueAtTime(frequency, audioCtx.currentTime);
      oscillator.type = type;

      gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
      gainNode.gain.linearRampToValueAtTime(volume * 0.3, audioCtx.currentTime + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + duration);

      oscillator.start(audioCtx.currentTime);
      oscillator.stop(audioCtx.currentTime + duration);
    } catch (error) {
      console.warn('Audio playback failed:', error);
    }
  };

  const playButtonSound = () => {
    playSound(800, 0.1, 'square');
  };

  const playSuccessSound = () => {
    // Play a pleasant success chord
    playSound(523, 0.15); // C5
    setTimeout(() => playSound(659, 0.15), 50); // E5
    setTimeout(() => playSound(784, 0.15), 100); // G5
  };

  const playErrorSound = () => {
    // Play a descending error tone
    playSound(400, 0.1);
    setTimeout(() => playSound(350, 0.1), 100);
    setTimeout(() => playSound(300, 0.2), 200);
  };

  const playNotificationSound = () => {
    // Play a gentle notification chime
    playSound(1000, 0.1);
    setTimeout(() => playSound(1200, 0.1), 100);
  };

  return (
    <AudioSettingsContext.Provider value={{
      isAudioEnabled,
      toggleAudio,
      playButtonSound,
      playSuccessSound,
      playErrorSound,
      playNotificationSound,
      volume,
      setVolume,
    }}>
      {children}
    </AudioSettingsContext.Provider>
  );
};

export const useAudio = (): AudioSettingsType => {
  const context = useContext(AudioSettingsContext);
  if (context === undefined) {
    throw new Error('useAudio must be used within an AudioProvider');
  }
  return context;
};