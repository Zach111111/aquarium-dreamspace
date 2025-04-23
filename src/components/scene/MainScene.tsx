
import { useState, useRef, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { PerspectiveCamera, OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { useAquariumStore } from '../../store/aquariumStore';
import { AudioReactiveElements } from '../AudioReactiveElements';
import { toast } from "@/components/ui/use-toast";
import { MousePositionTracker } from './MousePositionTracker';
import { DebugCube } from './DebugCube';

export function MainScene() {
  const [mousePosition, setMousePosition] = useState<THREE.Vector3 | null>(null);
  const tankSize: [number, number, number] = [10, 6, 10];
  const orbitSpeed = useAquariumStore(state => state.orbitSpeed);
  const [showDebugCube, setShowDebugCube] = useState(false);
  const [renderFailed, setRenderFailed] = useState(false);

  // Global debug key handler
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

  // Error detection and recovery
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
  };

  return (
    <Canvas 
      className="w-full h-full"
      style={{ background: '#1A1F2C' }}
      gl={{ 
        antialias: true,
        powerPreference: 'default',
        alpha: false,
        stencil: false,
        depth: true,
      }}
      dpr={[1, 1.5]}
      onCreated={({ gl }) => {
        gl.setClearColor(new THREE.Color('#1A1F2C'));
      }}
      onError={handleCanvasError}
    >
      <MousePositionTracker setMousePosition={setMousePosition} />
      
      <PerspectiveCamera makeDefault position={[0, 0, 12]} fov={60} />
      <OrbitControls 
        enableZoom={true} 
        enablePan={false} 
        autoRotate={orbitSpeed > 0} 
        autoRotateSpeed={orbitSpeed * 2}
        maxDistance={20}
        minDistance={8}
      />
      
      <DebugCube visible={showDebugCube} />

      <AudioReactiveElements
        mousePosition={mousePosition}
        tankSize={tankSize}
        fishData={Array.from({ length: 5 }, (_, index) => ({
          scale: 0.7 + Math.random() * 0.6,
          speed: 0.5 + Math.random() * 1.5,
          color: `hsl(${index * 36 + 180}, 70%, ${50 + index * 5}%)`
        }))}
        plantPositions={Array.from({ length: 6 }, () => ([
          (Math.random() - 0.5) * tankSize[0] * 0.7,
          -tankSize[1] / 2 * 0.9,
          (Math.random() - 0.5) * tankSize[2] * 0.7
        ] as [number, number, number]))}
        crystalData={Array.from({ length: 3 }, () => ({
          position: [
            (Math.random() - 0.5) * tankSize[0] * 0.6,
            -tankSize[1] / 2 * 0.7 + Math.random() * 0.5,
            (Math.random() - 0.5) * tankSize[2] * 0.6
          ] as [number, number, number],
          rotation: [
            Math.random() * Math.PI * 0.2,
            Math.random() * Math.PI * 2,
            Math.random() * Math.PI * 0.2
          ] as [number, number, number],
          color: `hsl(${Math.random() * 60 + 240}, 70%, 60%)`,
          height: 0.8 + Math.random() * 1.2
        }))}
      />
    </Canvas>
  );
}

