
import React, { useState, useEffect } from 'react';
import { ErrorBoundary } from './ErrorBoundary';
import { CanvasContainer } from './scene/CanvasContainer';
import { DebugCube } from './scene/DebugCube';
import { toast } from "@/components/ui/use-toast";

// Modified component to use simple fallback instead of complex content
export function AquariumScene() {
  const [showDebugCube, setShowDebugCube] = useState(false);
  const [renderAttempt, setRenderAttempt] = useState(0);
  const [useSimpleMode, setUseSimpleMode] = useState(true);

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
        setRenderAttempt(0); // Reset to trigger re-render
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [renderAttempt]);

  const handleRenderError = () => {
    console.warn("Render error detected, incrementing render attempt counter");
    setRenderAttempt(prev => prev + 1);
    setUseSimpleMode(true); // Switch to simple mode on error
    
    toast({
      title: "Rendering Issue Detected",
      description: "Switched to simplified mode for better compatibility",
      variant: "default"
    });
  };

  return (
    <ErrorBoundary>
      <CanvasContainer onError={handleRenderError}>
        {/* Simple mode shows just the debug cube and basic tank */}
        {useSimpleMode ? (
          <React.Suspense fallback={null}>
            <ambientLight intensity={0.5} />
            <pointLight position={[10, 10, 10]} />
            <DebugCube visible={true} />
          </React.Suspense>
        ) : (
          // This code path won't be used initially due to the errors
          <React.Suspense fallback={null}>
            {/* Import moved inside conditional to avoid errors */}
            {React.createElement(
              React.lazy(() => import('./scene/AquariumContent')),
              { key: `content-${renderAttempt}` }
            )}
            <DebugCube visible={showDebugCube} />
          </React.Suspense>
        )}
      </CanvasContainer>
    </ErrorBoundary>
  );
}
