
import { useState, useEffect } from 'react';
import { audioManager } from '../utils/audio';

export interface AudioLevels {
  bass: number;
  mid: number;
  treble: number;
}

export function useAudioAnalyzer(): {
  audioLevels: AudioLevels;
  isInitialized: boolean;
  initializeAudio: () => void;
} {
  const [audioLevels, setAudioLevels] = useState<AudioLevels>({ bass: 0, mid: 0, treble: 0 });
  const [isInitialized, setIsInitialized] = useState(false);
  
  const initializeAudio = () => {
    try {
      audioManager.initialize('/audio/main_theme.wav');
      audioManager.play();
      audioManager.setVolume(0.5);
      setIsInitialized(true);
      console.log("✅ Audio initialized successfully");
    } catch (error) {
      console.error('Failed to initialize audio:', error);
    }
  };
  
  useEffect(() => {
    const updateLevels = () => {
      if (isInitialized) {
        try {
          const levels = audioManager.getAudioLevels();
          setAudioLevels(levels);
        } catch (error) {
          // Silent fail with default values
          setAudioLevels({ bass: 0, mid: 0, treble: 0 });
        }
      }
      
      requestAnimationFrame(updateLevels);
    };
    
    const handle = requestAnimationFrame(updateLevels);
    return () => cancelAnimationFrame(handle);
  }, [isInitialized]);
  
  return { audioLevels, isInitialized, initializeAudio };
}
