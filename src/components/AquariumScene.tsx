
import React, { useState, useEffect } from 'react';
import { ErrorBoundary } from './ErrorBoundary';
import { CanvasContainer } from './scene/CanvasContainer';
import { DebugCube } from './scene/DebugCube';
import AquariumContent from './scene/AquariumContent';
import { toast } from "@/components/ui/use-toast";

// Main wrapper component
export function AquariumScene() {
  const [showDebugCube, setShowDebugCube] = useState(false);
  const [renderAttempt, setRenderAttempt] = useState(0);

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

  // Add an auto-recovery mechanism
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
  };

  return (
    <ErrorBoundary>
      <CanvasContainer onError={handleRenderError}>
        <AquariumContent key={`content-${renderAttempt}`} />
        <DebugCube visible={showDebugCube} />
      </CanvasContainer>
    </ErrorBoundary>
  );
}
