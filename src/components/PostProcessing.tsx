
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import { KernelSize } from 'postprocessing';
import { useEffect, useState, useCallback } from 'react';
import { useThree } from '@react-three/fiber';
import { useAquariumStore } from '../store/aquariumStore';
import { toast } from "@/components/ui/use-toast";

interface PostProcessingProps {
  audioLevel?: number;
}

export function PostProcessing({ audioLevel = 0 }: PostProcessingProps) {
  const [enabled, setEnabled] = useState(true);
  const [recoveryAttempts, setRecoveryAttempts] = useState(0);
  const { gl } = useThree();
  const colorShift = useAquariumStore(state => state.colorShift);
  
  // Handle WebGL context loss with auto-recovery
  const handleContextLost = useCallback((event: Event) => {
    event.preventDefault();
    console.warn('WebGL context lost, disabling post-processing');
    setEnabled(false);
    
    // Show notification
    toast({
      title: "Graphics Warning",
      description: "WebGL context lost. Visual effects temporarily disabled.",
      variant: "destructive"
    });
    
    // Try to recover if not too many attempts
    if (recoveryAttempts < 3) {
      setTimeout(() => {
        console.log(`Attempting to re-enable post-processing (attempt ${recoveryAttempts + 1})`);
        setEnabled(true);
        setRecoveryAttempts(prev => prev + 1);
      }, 3000);
    }
  }, [recoveryAttempts]);
  
  const handleContextRestored = useCallback(() => {
    console.log('WebGL context restored, re-enabling post-processing');
    setEnabled(true);
    
    toast({
      title: "Graphics Restored",
      description: "Visual effects have been re-enabled.",
    });
  }, []);
  
  // Add WebGL context loss recovery and cleanup
  useEffect(() => {
    const canvas = gl.domElement;
    
    canvas.addEventListener('webglcontextlost', handleContextLost);
    canvas.addEventListener('webglcontextrestored', handleContextRestored);
    
    return () => {
      canvas.removeEventListener('webglcontextlost', handleContextLost);
      canvas.removeEventListener('webglcontextrestored', handleContextRestored);
    };
  }, [gl, handleContextLost, handleContextRestored]);
  
  // Scale bloom intensity with audio level
  const bloomIntensity = 0.4 + (audioLevel || 0) * 0.6;
  
  // Safety wrapper for EffectComposer
  try {
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
  } catch (error) {
    console.error("PostProcessing error:", error);
    setEnabled(false);
    return null;
  }
}

PostProcessing.displayName = 'PostProcessing';
