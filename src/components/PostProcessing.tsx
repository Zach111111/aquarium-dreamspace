
import {
  EffectComposer,
  Bloom,
  Noise,
} from '@react-three/postprocessing';
import { BlendFunction, KernelSize } from 'postprocessing';
import { useAquariumStore } from '../store/aquariumStore';

interface PostProcessingProps {
  audioLevel?: number;
}

export function PostProcessing({ audioLevel = 0 }: PostProcessingProps) {
  const colorShift = useAquariumStore(state => state.colorShift);
  
  return (
    <EffectComposer multisampling={2}>
      {/* Reduced intensity Bloom effect for neon glow */}
      <Bloom 
        intensity={0.5 + audioLevel * 0.3} 
        luminanceThreshold={0.3} 
        luminanceSmoothing={0.9} 
        kernelSize={KernelSize.MEDIUM}
      />
      
      {/* Film grain with reduced opacity */}
      <Noise 
        opacity={0.03} 
        blendFunction={BlendFunction.OVERLAY}
      />
      
      {/* Removed Vignette effect which was causing errors */}
    </EffectComposer>
  );
}

// Add displayName to help with component identification
PostProcessing.displayName = 'PostProcessing';
