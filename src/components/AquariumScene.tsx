
import React, { useState, useEffect } from 'react';
import { ErrorBoundary } from './ErrorBoundary';
import { CanvasContainer } from './scene/CanvasContainer';
import { DebugCube } from './scene/DebugCube';
import AquariumContent from './scene/AquariumContent';
import { toast } from "@/components/ui/use-toast";

// Main wrapper component
export function AquariumScene() {
  const [showDebugCube, setShowDebugCube] = useState(false);

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

  return (
    <ErrorBoundary>
      <CanvasContainer>
        <AquariumContent />
        <DebugCube visible={showDebugCube} />
      </CanvasContainer>
    </ErrorBoundary>
  );
}
