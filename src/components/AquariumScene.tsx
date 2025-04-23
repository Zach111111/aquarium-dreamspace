
import React, { useState, useEffect } from 'react';
import { ErrorBoundary } from './ErrorBoundary';
import { CanvasContainer } from './scene/CanvasContainer';
import { DebugCube } from './scene/DebugCube';
import { toast } from "@/components/ui/use-toast";

// Modified component to show full scene by default
export function AquariumScene() {
  const [showDebugCube, setShowDebugCube] = useState(false);
  const [renderAttempt, setRenderAttempt] = useState(0);
  const [useSimpleMode, setUseSimpleMode] = useState(false); // show REAL tank by default

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
        setUseSimpleMode(false); // Try to return to full scene after recovery
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [renderAttempt]);

  const handleRenderError = () => {
    console.warn("Render error detected, incrementing render attempt counter");
    setRenderAttempt(prev => prev + 1);
    setUseSimpleMode(true); // Only switch to fallback on error

    toast({
      title: "Rendering Issue Detected",
      description: "Switched to simplified mode for better compatibility",
      variant: "default"
    });
  };

  return (
    <ErrorBoundary>
      <CanvasContainer onError={handleRenderError}>
        {/* Try REAL scene, fallback to debug cube after error */}
        {!useSimpleMode ? (
          <React.Suspense fallback={null}>
            {/* Import moved inside conditional to avoid errors */}
            {React.createElement(
              React.lazy(() => import('./scene/AquariumContent')),
              { key: `content-${renderAttempt}` }
            )}
            <DebugCube visible={showDebugCube} />
          </React.Suspense>
        ) : (
          // Fallback: simple debug cube scene
          <React.Suspense fallback={null}>
            <ambientLight intensity={0.5} />
            <pointLight position={[10, 10, 10]} />
            <DebugCube visible={true} />
          </React.Suspense>
        )}
      </CanvasContainer>
    </ErrorBoundary>
  );
}
