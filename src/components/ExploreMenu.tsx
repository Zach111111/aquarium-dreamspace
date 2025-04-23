
import { useAquariumStore } from '../store/aquariumStore';
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { useState, useEffect } from 'react';
import { audioManager } from '../utils/audio';

interface ExploreMenuProps {
  isVisible: boolean;
}

export const ExploreMenu = ({ isVisible }: ExploreMenuProps) => {
  const { 
    orbitSpeed, 
    colorShift, 
    musicVolume,
    speedFactor,
    setOrbitSpeed, 
    toggleColorShift, 
    setMusicVolume,
    setSpeedFactor
  } = useAquariumStore();

  // Update audio volume when musicVolume changes
  useEffect(() => {
    audioManager.setVolume(musicVolume);
  }, [musicVolume]);

  // Apply glitch animation randomly
  const [glitchClass, setGlitchClass] = useState('');
  
  useEffect(() => {
    const glitchInterval = setInterval(() => {
      if (Math.random() > 0.8) {
        setGlitchClass('animate-glitch');
        setTimeout(() => setGlitchClass(''), 500);
      }
    }, 5000);
    
    return () => clearInterval(glitchInterval);
  }, []);

  if (!isVisible) return null;

  return (
    <div className={`absolute top-20 right-10 z-10 bg-black/40 backdrop-blur-md p-6 rounded-lg border border-aquarium-blue/30 text-aquarium-white ${glitchClass}`}>
      <div className="mb-6 text-center">
        <h2 className="text-xl font-bold text-aquarium-blue mb-1">SETTINGS</h2>
        <div className="h-0.5 w-full bg-gradient-to-r from-aquarium-purple/0 via-aquarium-blue to-aquarium-purple/0"></div>
      </div>
      
      <div className="space-y-6">
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <label htmlFor="speed-factor" className="text-sm text-aquarium-blue">ANIMATION SPEED</label>
            <span className="text-xs opacity-70">{Math.round(speedFactor * 100)}%</span>
          </div>
          <Slider
            id="speed-factor"
            defaultValue={[speedFactor]}
            min={0.1}
            max={2.0}
            step={0.1}
            onValueChange={(value) => setSpeedFactor(value[0])}
            className="cursor-pointer"
          />
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <label htmlFor="orbit-speed" className="text-sm text-aquarium-blue">CAMERA ORBIT</label>
            <span className="text-xs opacity-70">{Math.round(orbitSpeed * 100)}%</span>
          </div>
          <Slider
            id="orbit-speed"
            defaultValue={[orbitSpeed]}
            max={1}
            step={0.01}
            onValueChange={(value) => setOrbitSpeed(value[0])}
            className="cursor-pointer"
          />
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <label htmlFor="music-volume" className="text-sm text-aquarium-blue">MUSIC VOLUME</label>
            <span className="text-xs opacity-70">{Math.round(musicVolume * 100)}%</span>
          </div>
          <Slider
            id="music-volume"
            defaultValue={[musicVolume]}
            max={1}
            step={0.01}
            onValueChange={(value) => setMusicVolume(value[0])}
            className="cursor-pointer"
          />
        </div>
        
        <div className="flex items-center justify-between">
          <label htmlFor="color-shift" className="text-sm text-aquarium-blue">COLOR SHIFT</label>
          <Switch
            id="color-shift"
            checked={colorShift}
            onCheckedChange={toggleColorShift}
          />
        </div>
      </div>
    </div>
  );
};
