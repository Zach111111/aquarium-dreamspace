
import React, { Suspense, useEffect, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import WaterTank from './WaterTank';
import { DebugCube } from './scene/DebugCube';
import { ErrorBoundary } from './ErrorBoundary';
import { Lighting } from './Lighting';
import { toast } from "@/components/ui/use-toast";

export function FishTankDemo() {
  const canvasRef = useRef<HTMLDivElement>(null);
  
  // Handle context loss with standard event listeners
  useEffect(() => {
    const div = canvasRef.current;
    if (!div) return;
    
    // Need to find the canvas element after React Three Fiber creates it
    const setupEventListeners = () => {
      const canvas = div.querySelector('canvas');
      if (!canvas) {
        const timeoutId = setTimeout(setupEventListeners, 100);
        return () => clearTimeout(timeoutId);
      }
      
      const handleContextLost = (e: Event) => {
        e.preventDefault();
        console.warn('WebGL context lost', e);
        toast({
          title: "Rendering Issue",
          description: "WebGL context was lost. Trying to recover...",
          variant: "destructive"
        });
      };
      
      canvas.addEventListener('webglcontextlost', handleContextLost);
      return () => {
        canvas.removeEventListener('webglcontextlost', handleContextLost);
      };
    };
    
    const cleanup = setupEventListeners();
    return cleanup;
  }, []);

  return (
    <div className="w-full h-screen relative overflow-hidden">
      <ErrorBoundary>
        <div ref={canvasRef} className="absolute inset-0">
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
                // Type guard for camera to ensure it has aspect property
                if (camera.type === 'PerspectiveCamera') {
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
        </div>
      </ErrorBoundary>
    </div>
  );
}

FishTankDemo.displayName = 'FishTankDemo';
