
import { useEffect, useState } from 'react';
import { audioManager } from '../../utils/audio';

interface AudioLevels {
  bass: number;
  mid: number;
  treble: number;
}

interface AudioLevelMonitorProps {
  audioInitialized: boolean;
  onLevelsChange: (levels: AudioLevels) => void;
}

export function AudioLevelMonitor({ audioInitialized, onLevelsChange }: AudioLevelMonitorProps) {
  useEffect(() => {
    let isMounted = true;
    
    const updateAudioLevels = () => {
      if (!audioInitialized || !isMounted) return;
      
      try {
        const levels = audioManager.getAudioLevels();
        onLevelsChange(levels);
      } catch (error) {
        onLevelsChange({ bass: 0, mid: 0, treble: 0 });
      }
      
      requestAnimationFrame(updateAudioLevels);
    };
    
    updateAudioLevels();
    
    return () => {
      isMounted = false;
    };
  }, [audioInitialized, onLevelsChange]);

  return null;
}
