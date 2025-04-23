
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import { KernelSize } from 'postprocessing';

interface PostProcessingProps {
  audioLevel?: number;
}

export function PostProcessing({ audioLevel = 0 }: PostProcessingProps) {
  // Extremely simplified post-processing to avoid WebGL context loss
  return (
    <EffectComposer enabled={false}>
      {/* Disabled Bloom until we fix the base rendering */}
      <Bloom 
        intensity={0.3} 
        luminanceThreshold={0.4} 
        luminanceSmoothing={0.9} 
        kernelSize={KernelSize.SMALL}
      />
    </EffectComposer>
  );
}

PostProcessing.displayName = 'PostProcessing';
