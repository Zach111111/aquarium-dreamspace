
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
  const [recovery, setRecovery] = useState(0);

  useEffect(() => {
    if (renderFailed) {
      const timer = setTimeout(() => {
        setRenderFailed(false);
        setRecovery(prev => prev + 1);
        console.log("Attempting to recover from render failure...");
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [renderFailed]);

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
      dpr={[0.5, 1]} // Lower resolution for better compatibility
      frameloop="demand" // Only render when needed
      key={`canvas-${recovery}`} // Force re-creation on recovery
      onCreated={({ gl }) => {
        gl.setClearColor(new THREE.Color('#1A1F2C'));
        // Disable advanced WebGL features for better compatibility
        gl.getContextAttributes().powerPreference = 'default';
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
