
import React, { useState, useEffect } from 'react';
import { ErrorBoundary } from './ErrorBoundary';
import { CanvasContainer } from './scene/CanvasContainer';
import { DebugCube } from './scene/DebugCube';
import { toast } from "@/components/ui/use-toast";

// Import WaterTank for direct use without lazy loading (to avoid TypeScript issues)
import WaterTank from './WaterTank';

export function AquariumScene() {
  const [showDebugCube, setShowDebugCube] = useState(false);
  const [renderAttempt, setRenderAttempt] = useState(0);
  const [useSimpleMode, setUseSimpleMode] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'd' && e.ctrlKey) {
        setShowDebugCube(prev => !prev);
        toast({
          title: showDebugCube ? "Debug Mode Off" : "Debug Mode On",
          description: showDebugCube ? "Debug cube hidden" : "Debug cube visible"
        });
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showDebugCube]);

  // Auto-recovery mechanism
  useEffect(() => {
    if (renderAttempt > 0) {
      const timer = setTimeout(() => {
        console.log("Auto-recovery: forcing scene re-render");
        setRenderAttempt(0);
        setUseSimpleMode(true); // Stay in simple mode after errors
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [renderAttempt]);

  const handleRenderError = () => {
    console.warn("Render error detected, incrementing render attempt counter");
    setRenderAttempt(prev => prev + 1);
    setUseSimpleMode(true);

    toast({
      title: "Rendering Issue Detected",
      description: "Switched to simplified mode for better compatibility",
      variant: "default"
    });
  };

  // Create a memoized lazy-loaded AquariumContent component
  const LazyAquariumContent = React.lazy(() => import('./scene/AquariumContent'));

  return (
    <ErrorBoundary>
      <CanvasContainer onError={handleRenderError}>
        {useSimpleMode ? (
          // Fallback: simple debug cube scene with water tank
          <React.Suspense fallback={null}>
            <ambientLight intensity={0.8} />
            <pointLight position={[10, 10, 10]} intensity={1.5} />
            <DebugCube visible={true} />
            <WaterTank 
              size={[8, 5, 8]} 
              useSimpleMaterial={true} 
            />
          </React.Suspense>
        ) : (
          // Try full aquarium content first
          <React.Suspense fallback={null}>
            <LazyAquariumContent key={`content-${renderAttempt}`} />
            <DebugCube visible={showDebugCube} />
          </React.Suspense>
        )}
      </CanvasContainer>
    </ErrorBoundary>
  );
}
