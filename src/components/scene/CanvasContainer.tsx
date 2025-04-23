
import React, { useState } from 'react';
import { Canvas } from '@react-three/fiber';
import * as THREE from 'three';
import { ErrorBoundary } from '../ErrorBoundary';
import { toast } from "@/components/ui/use-toast";

interface CanvasContainerProps {
  children: React.ReactNode;
  onError?: (event: React.SyntheticEvent) => void;
}

export function CanvasContainer({ children, onError }: CanvasContainerProps) {
  const [renderFailed, setRenderFailed] = useState(false);
  
  const handleCanvasError = (event: React.SyntheticEvent) => {
    console.error("Canvas render error:", event);
    setRenderFailed(true);
    
    if (onError) onError(event);
    
    toast({
      title: "Rendering Error",
      description: "There was a problem rendering the 3D scene. See console for details.",
      variant: "destructive",
    });
  };

  return (
    <div className="relative w-full h-full overflow-hidden">
      <Canvas 
        className="absolute inset-0"
        style={{ background: '#1A1F2C' }}
        gl={{ 
          antialias: false,
          powerPreference: 'default',
          alpha: false,
          stencil: false,
          depth: true,
          failIfMajorPerformanceCaveat: false
        }}
        dpr={0.6}
        frameloop="demand"
        onCreated={({ gl, camera }) => {
          gl.setClearColor(new THREE.Color('#1A1F2C'));
          console.log("Canvas created successfully");
          
          const resize = () => {
            gl.setSize(window.innerWidth, window.innerHeight);
            if (camera instanceof THREE.PerspectiveCamera) {
              camera.aspect = window.innerWidth / window.innerHeight;
              camera.updateProjectionMatrix();
            }
          };
          window.addEventListener('resize', resize);
          resize();
          return () => window.removeEventListener('resize', resize);
        }}
        onError={handleCanvasError}
      >
        <ErrorBoundary>
          {!renderFailed && children}
          {renderFailed && (
            <>
              <ambientLight intensity={0.5} />
              <mesh position={[0, 0, 0]}>
                <boxGeometry args={[2, 2, 2]} />
                <meshBasicMaterial color="#FF0000" wireframe />
              </mesh>
            </>
          )}
        </ErrorBoundary>
      </Canvas>
    </div>
  );
}

CanvasContainer.displayName = 'CanvasContainer';
