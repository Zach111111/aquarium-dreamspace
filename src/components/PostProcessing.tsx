
import {
  EffectComposer,
  Bloom,
} from '@react-three/postprocessing';
import { KernelSize } from 'postprocessing';
import { useAquariumStore } from '../store/aquariumStore';

interface PostProcessingProps {
  audioLevel?: number;
}

export function PostProcessing({ audioLevel = 0 }: PostProcessingProps) {
  // Simplified post-processing to avoid WebGL context loss
  return (
    <EffectComposer enabled={true} multisampling={0}>
      {/* Reduced intensity Bloom effect for neon glow */}
      <Bloom 
        intensity={0.3 + audioLevel * 0.2} 
        luminanceThreshold={0.4} 
        luminanceSmoothing={0.9} 
        kernelSize={KernelSize.SMALL}
      />
      
      {/* Removed Noise effect which was causing errors */}
    </EffectComposer>
  );
}

// Add displayName to help with component identification
PostProcessing.displayName = 'PostProcessing';
