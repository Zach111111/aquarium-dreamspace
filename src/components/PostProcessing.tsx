
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import { KernelSize } from 'postprocessing';
import { useEffect, useState } from 'react';
import { useThree } from '@react-three/fiber';
import { useAquariumStore } from '../store/aquariumStore';

interface PostProcessingProps {
  audioLevel?: number;
}

export function PostProcessing({ audioLevel = 0 }: PostProcessingProps) {
  const [enabled, setEnabled] = useState(true);
  const { gl } = useThree();
  const colorShift = useAquariumStore(state => state.colorShift);
  
  // Add WebGL context loss recovery
  useEffect(() => {
    const canvas = gl.domElement;
    
    const handleContextLost = (event: Event) => {
      event.preventDefault();
      console.warn('WebGL context lost, disabling post-processing');
      setEnabled(false);
    };
    
    const handleContextRestored = () => {
      console.log('WebGL context restored, re-enabling post-processing');
      setEnabled(true);
    };
    
    canvas.addEventListener('webglcontextlost', handleContextLost);
    canvas.addEventListener('webglcontextrestored', handleContextRestored);
    
    return () => {
      canvas.removeEventListener('webglcontextlost', handleContextLost);
      canvas.removeEventListener('webglcontextrestored', handleContextRestored);
    };
  }, [gl]);
  
  // Scale bloom intensity with audio level
  const bloomIntensity = 0.4 + audioLevel * 0.6;
  
  return (
    <EffectComposer enabled={enabled}>
      <Bloom 
        intensity={bloomIntensity}
        luminanceThreshold={0.2}
        luminanceSmoothing={0.9}
        kernelSize={KernelSize.LARGE}
      />
    </EffectComposer>
  );
}

PostProcessing.displayName = 'PostProcessing';
