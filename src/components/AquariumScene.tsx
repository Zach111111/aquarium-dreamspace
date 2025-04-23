
import React, { useState } from 'react';
import { ErrorBoundary } from './ErrorBoundary';
import { CanvasContainer } from './scene/CanvasContainer';
import { DebugCube } from './scene/DebugCube';
import { toast } from "@/components/ui/use-toast";
import { AudioReactiveElements } from './AudioReactiveElements';

export function AquariumScene() {
  const [showDebugCube, setShowDebugCube] = useState(false);
  const [useSimpleMode, setUseSimpleMode] = useState(true);

  const handleRenderError = () => {
    console.warn("Render error detected, using simple mode");
    setUseSimpleMode(true);

    toast({
      title: "Rendering Issue Detected",
      description: "Switched to simplified mode for better compatibility",
      variant: "default"
    });
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
        <React.Suspense fallback={null}>
          {showDebugCube && <DebugCube visible={true} />}
          
          <AudioReactiveElements
            mousePosition={null}
            tankSize={tankSize}
            fishData={fishData}
            plantPositions={plantPositions}
            crystalData={crystalData}
          />
        </React.Suspense>
      </CanvasContainer>
    </ErrorBoundary>
  );
}
