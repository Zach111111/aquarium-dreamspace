
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

  // Use the most compatible WebGL settings
  return (
    <Canvas 
      className="w-full h-full"
      style={{ background: '#1A1F2C' }}
      gl={{ 
        antialias: false,  // Disable antialiasing for better compatibility
        powerPreference: 'default',
        alpha: false,
        stencil: false,
        depth: true,
        failIfMajorPerformanceCaveat: false
      }}
      dpr={0.6} // Much lower resolution for better compatibility
      frameloop="demand" // Only render when needed
      onCreated={({ gl }) => {
        gl.setClearColor(new THREE.Color('#1A1F2C'));
        console.log("Canvas created successfully");
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
  );
}

CanvasContainer.displayName = 'CanvasContainer';
