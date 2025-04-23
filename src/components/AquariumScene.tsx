
import React, { useState } from 'react';
import { ErrorBoundary } from './ErrorBoundary';
import { CanvasContainer } from './scene/CanvasContainer';
import { DebugCube } from './scene/DebugCube';
import { toast } from "@/components/ui/use-toast";
import { AudioReactiveElements } from './AudioReactiveElements';

export function AquariumScene() {
  const [showDebugCube, setShowDebugCube] = useState(true); // Show debug cube by default
  const [useSimpleMode, setUseSimpleMode] = useState(true); // Use simple mode by default

  const handleRenderError = () => {
    console.warn("Render error detected, using simple mode");
    setUseSimpleMode(true);

    toast({
      title: "Rendering Issue Detected",
      description: "Switched to simplified mode for better compatibility",
      variant: "default"
    });
  };

  // Pre-define data for the simple scene
  const tankSize: [number, number, number] = [8, 5, 8];
  const fishData = [
    { scale: 0.8, speed: 1, color: '#88CCFF' },
    { scale: 0.7, speed: 1.2, color: '#77AADD' },
    { scale: 0.9, speed: 0.9, color: '#99DDFF' },
  ];
  const plantPositions: [number, number, number][] = [
    [-2, -2, -2],
    [2, -2, 2],
    [-2, -2, 2],
    [2, -2, -2],
  ];
  const crystalData = [
    {
      position: [0, -1, 0] as [number, number, number],
      rotation: [0, 0, 0] as [number, number, number],
      color: '#88FFFF',
      height: 1
    }
  ];

  return (
    <ErrorBoundary>
      <CanvasContainer onError={handleRenderError}>
        <React.Suspense fallback={null}>
          <ambientLight intensity={0.8} />
          <pointLight position={[10, 10, 10]} intensity={1.5} />
          
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
