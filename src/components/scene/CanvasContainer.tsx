
import React, { useEffect, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import * as THREE from 'three';
import { ErrorBoundary } from '../ErrorBoundary';
import { LoadingFallback } from '../LoadingFallback';
import { toast } from "@/components/ui/use-toast";

interface CanvasContainerProps {
  children: React.ReactNode;
  onError?: (event: React.SyntheticEvent) => void;
}

export function CanvasContainer({ children, onError }: CanvasContainerProps) {
  const [renderFailed, setRenderFailed] = useState(false);

  useEffect(() => {
    if (renderFailed) {
      const timer = setTimeout(() => {
        console.log("Attempting to recover from render failure...");
        setRenderFailed(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [renderFailed]);

  const handleCanvasError = (event: React.SyntheticEvent) => {
    console.error("Canvas render error:", event);
    setRenderFailed(true);
    toast({
      title: "Render Error",
      description: "There was a problem rendering the 3D scene. Attempting to recover...",
      variant: "destructive"
    });
    
    if (onError) onError(event);
  };

  return (
    <Canvas 
      className="w-full h-full"
      style={{ background: '#1A1F2C' }}
      gl={{ 
        antialias: true,
        powerPreference: 'high-performance',
        alpha: false,
        stencil: false,
        depth: true,
      }}
      dpr={[0.6, 1.0]} 
      performance={{ min: 0.5 }}
      frameloop="demand"
      onCreated={({ gl }) => {
        gl.setClearColor(new THREE.Color('#1A1F2C'));
        console.log("Canvas created successfully");
      }}
      onError={handleCanvasError}
    >
      <ErrorBoundary>
        <React.Suspense fallback={<LoadingFallback />}>
          {children}
        </React.Suspense>
      </ErrorBoundary>
    </Canvas>
  );
}

CanvasContainer.displayName = 'CanvasContainer';
