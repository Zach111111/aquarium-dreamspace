
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import { KernelSize } from 'postprocessing';

interface PostProcessingProps {
  audioLevel?: number;
}

export function PostProcessing({ audioLevel = 0 }: PostProcessingProps) {
  // Start with minimal post-processing to ensure stability
  return (
    <EffectComposer enabled={true} multisampling={0}>
      {/* Bloom with minimal settings */}
      <Bloom 
        intensity={0.2} 
        luminanceThreshold={0.4} 
        luminanceSmoothing={0.9} 
        kernelSize={KernelSize.SMALL}
      />
    </EffectComposer>
  );
}

PostProcessing.displayName = 'PostProcessing';
