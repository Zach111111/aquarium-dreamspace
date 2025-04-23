
import React, { useState, useEffect, Suspense } from 'react';
import { ErrorBoundary } from './ErrorBoundary';
import { CanvasContainer } from './scene/CanvasContainer';
import { DebugCube } from './scene/DebugCube';
import { toast } from "@/components/ui/use-toast";
import { AudioReactiveElements } from './AudioReactiveElements';

export function AquariumScene() {
  const [showDebugCube, setShowDebugCube] = useState(false);
  const [useSimpleMode, setUseSimpleMode] = useState(true);
  const [renderAttempt, setRenderAttempt] = useState(0);
  const [isMounted, setIsMounted] = useState(false);

  // Track mounted state to prevent state updates after unmount
  useEffect(() => {
    setIsMounted(true);
    return () => setIsMounted(false);
  }, []);

  // Recovery mechanism
  useEffect(() => {
    if (renderAttempt > 0) {
      console.log(`AquariumScene: Recovery attempt ${renderAttempt}`);
    }
  }, [renderAttempt]);

  const handleRenderError = () => {
    console.warn("Render error detected, using simple mode");
    
    if (isMounted) {
      setUseSimpleMode(true);
      setRenderAttempt(prev => prev + 1);
      
      toast({
        title: "Rendering Issue Detected",
        description: "Switched to simplified mode for better compatibility",
        variant: "default"
      });
    }
  };

  // Pre-define data for the scene with improved positions
  const tankSize: [number, number, number] = [8, 5, 8];
  
  const fishData = Array.from({ length: 6 }, (_, i) => ({
    scale: 0.7 + Math.random() * 0.3,
    speed: 0.8 + Math.random() * 0.4,
    color: `hsl(${i * 40 + 180}, 70%, ${50 + i * 5}%)`
  }));
  
  const plantPositions: [number, number, number][] = [
    [-2.5, -2, -2.5],
    [2.5, -2, 2.5],
    [-2.5, -2, 2.5],
    [2.5, -2, -2.5],
    [0, -2, -3],
    [0, -2, 3],
  ];
  
  const crystalData = [
    {
      position: [-1.5, -1.2, -1] as [number, number, number],
      rotation: [0, 0, 0] as [number, number, number],
      color: '#88FFFF',
      height: 1
    },
    {
      position: [1.5, -1, 1] as [number, number, number],
      rotation: [0, 0, 0] as [number, number, number],
      color: '#AAFFEE',
      height: 0.8
    },
    {
      position: [0, -1.5, 0] as [number, number, number],
      rotation: [0, 0, 0] as [number, number, number],
      color: '#CCFFFF',
      height: 1.2
    }
  ];

  return (
    <ErrorBoundary>
      <CanvasContainer onError={handleRenderError}>
        <Suspense fallback={
          <mesh position={[0, 0, 0]}>
            <sphereGeometry args={[1, 8, 8]} />
            <meshBasicMaterial color="#8EDFFF" wireframe />
          </mesh>
        }>
          {showDebugCube && <DebugCube visible={true} />}
          
          <AudioReactiveElements
            mousePosition={null}
            tankSize={tankSize}
            fishData={fishData}
            plantPositions={plantPositions}
            crystalData={crystalData}
          />
        </Suspense>
      </CanvasContainer>
    </ErrorBoundary>
  );
}
