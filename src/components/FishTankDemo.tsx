
import React, { Suspense, useEffect, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import WaterTank from './WaterTank';
import { DebugCube } from './scene/DebugCube';
import { ErrorBoundary } from './ErrorBoundary';
import { Lighting } from './Lighting';
import { toast } from "@/components/ui/use-toast";

export function FishTankDemo() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Handle context loss with standard event listeners
  useEffect(() => {
    const canvas = canvasRef.current;
    
    const handleContextLost = (e: Event) => {
      e.preventDefault();
      console.warn('WebGL context lost', e);
      toast({
        title: "Rendering Issue",
        description: "WebGL context was lost. Trying to recover...",
        variant: "destructive"
      });
    };
    
    if (canvas) {
      canvas.addEventListener('webglcontextlost', handleContextLost);
      return () => {
        canvas.removeEventListener('webglcontextlost', handleContextLost);
      };
    }
  }, []);

  return (
    <div className="w-full h-screen relative overflow-hidden">
      <ErrorBoundary>
        <Canvas
          className="absolute inset-0"
          style={{ background: '#1A1F2C' }}
          camera={{ position: [0, 0, 12], fov: 60 }}
          gl={{ 
            antialias: true, 
            alpha: false,
            stencil: false,
            depth: true,
            powerPreference: 'default'
          }}
          dpr={[0.6, 1]}
          onCreated={({ gl, camera }) => {
            const resize = () => {
              gl.setSize(window.innerWidth, window.innerHeight);
              // Only update aspect if camera is PerspectiveCamera
              if ('aspect' in camera) {
                camera.aspect = window.innerWidth / window.innerHeight;
                camera.updateProjectionMatrix();
              }
            };
            window.addEventListener('resize', resize);
            resize();
            return () => window.removeEventListener('resize', resize);
          }}
        >
          <Lighting />
          <DebugCube />
          
          <Suspense fallback={null}>
            <WaterTank size={[5, 4, 5]} useSimpleMaterial={true} />
          </Suspense>
          
          <OrbitControls enableDamping dampingFactor={0.1} />
        </Canvas>
        
        {/* Hidden canvas for context loss monitoring */}
        <canvas 
          ref={canvasRef}
          className="hidden" 
          width={1} 
          height={1}
        />
      </ErrorBoundary>
    </div>
  );
}

FishTankDemo.displayName = 'FishTankDemo';
