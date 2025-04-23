
import { useEffect, useState } from 'react';
import { audioManager } from '../../utils/audio';
import { toast } from "@/components/ui/use-toast";

interface AquariumInitializerProps {
  onAudioInit: (state: boolean) => void;
}

export function AquariumInitializer({ onAudioInit }: AquariumInitializerProps) {
  const [audioInitialized, setAudioInitialized] = useState(false);
  const [audioFailed, setAudioFailed] = useState(false);

  useEffect(() => {
    const initAudio = () => {
      if (audioInitialized || audioFailed) return;
      
      try {
        audioManager.initialize('/audio/main_theme.wav');
        audioManager.play();
        audioManager.setVolume(0.5);
        setAudioInitialized(true);
        onAudioInit(true);
        console.log("✅ Audio initialized successfully");
      } catch (error) {
        console.error('Failed to initialize audio:', error);
        setAudioFailed(true);
        onAudioInit(false);
        toast({
          title: "Audio Error",
          description: "Failed to initialize audio. Some features may be limited.",
          variant: "destructive"
        });
      }
    };
    
    const handleInteraction = () => {
      initAudio();
      window.removeEventListener('click', handleInteraction);
      window.removeEventListener('keydown', handleInteraction);
    };
    
    window.addEventListener('click', handleInteraction);
    window.addEventListener('keydown', handleInteraction);
    
    return () => {
      window.removeEventListener('click', handleInteraction);
      window.removeEventListener('keydown', handleInteraction);
    };
  }, [audioInitialized, audioFailed, onAudioInit]);

  return null;
}
