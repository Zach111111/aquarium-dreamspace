
import { useEffect } from 'react';
import {
  EffectComposer,
  Bloom,
  ChromaticAberration,
  Noise,
  Vignette,
  Scanline,
} from '@react-three/postprocessing';
import { BlendFunction, Resizer, KernelSize } from 'postprocessing';
import { useAquariumStore } from '../store/aquariumStore';
import { Vector2 } from 'three';

interface PostProcessingProps {
  audioLevel?: number;
}

export function PostProcessing({ audioLevel = 0 }: PostProcessingProps) {
  const colorShift = useAquariumStore(state => state.colorShift);
  
  return (
    <EffectComposer multisampling={4}>
      {/* Bloom effect for neon glow */}
      <Bloom 
        intensity={1.0 + audioLevel * 0.5} 
        luminanceThreshold={0.2} 
        luminanceSmoothing={0.9} 
        kernelSize={KernelSize.LARGE}
      />
      
      {/* Subtle chromatic aberration */}
      <ChromaticAberration 
        offset={new Vector2(0.002 + audioLevel * 0.002, 0.002 + audioLevel * 0.002)} 
        blendFunction={BlendFunction.NORMAL}
        radialModulation={false}
        modulationOffset={0.0}
      />
      
      {/* Film grain */}
      <Noise 
        opacity={0.05} 
        blendFunction={BlendFunction.OVERLAY}
      />
      
      {/* VHS scanlines */}
      <Scanline
        density={1.5}
        opacity={0.15 + audioLevel * 0.05}
        scrollSpeed={10.0 + audioLevel * 5}
      />
      
      {/* Vignette darkening around edges */}
      <Vignette
        offset={0.1}
        darkness={0.5}
        eskil={false}
        blendFunction={BlendFunction.NORMAL}
      />
    </EffectComposer>
  );
}
