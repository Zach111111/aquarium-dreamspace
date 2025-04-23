
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
        powerPreference: 'default', // Changed from 'high-performance' to be more compatible
        alpha: false,
        stencil: false,
        depth: true,
        precision: "highp"
      }}
      dpr={[0.5, 0.8]} // Reduced DPR for better performance
      frameloop="always" // Changed from "demand" to ensure continuous rendering
      onCreated={({ gl }) => {
        gl.setClearColor(new THREE.Color('#1A1F2C'));
        console.log("Canvas created successfully");
        
        // Add context loss handler
        gl.domElement.addEventListener('webglcontextlost', (e) => {
          e.preventDefault();
          console.warn("WebGL context lost");
        });
        
        gl.domElement.addEventListener('webglcontextrestored', () => {
          console.log("WebGL context restored");
        });
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
