
import React, { useMemo, useRef, useState, useEffect, Suspense } from 'react';
import { Canvas, useThree, useFrame } from '@react-three/fiber';
import { PerspectiveCamera, OrbitControls, Stats } from '@react-three/drei';
import * as THREE from 'three';
import { Fish } from './Fish';
import { Plant } from './Plant';
import { Crystal } from './Crystal';
import { WaterTank } from './WaterTank';
import { Particles } from './Particles';
import { PostProcessing } from './PostProcessing';
import { useAquariumStore } from '../store/aquariumStore';
import { audioManager } from '../utils/audio';
import { random } from '../utils/noise';
import { toast } from "@/components/ui/use-toast";

// Camera controller with audio-reactive movement
function CameraController() {
  const { camera } = useThree();
  const orbitControlsRef = useRef<any>(null);
  const orbitSpeed = useAquariumStore(state => state.orbitSpeed);
  
  useFrame(({ clock }) => {
    if (orbitControlsRef.current && orbitSpeed > 0) {
      // Apply automatic orbit if orbit speed is greater than 0
      orbitControlsRef.current.autoRotate = true;
      orbitControlsRef.current.autoRotateSpeed = orbitSpeed * 2;
    } else if (orbitControlsRef.current) {
      orbitControlsRef.current.autoRotate = false;
    }
  });
  
  return (
    <OrbitControls
      ref={orbitControlsRef}
      enableDamping
      dampingFactor={0.05}
      rotateSpeed={0.5}
      minDistance={5}
      maxDistance={15}
      // Limit vertical rotation to avoid strange angles
      minPolarAngle={Math.PI / 6}
      maxPolarAngle={Math.PI * 5/6}
    />
  );
}

// Mouse position tracker for particle interaction
function MouseTracker({ setMousePosition }: { setMousePosition: (position: THREE.Vector3 | null) => void }) {
  const { camera } = useThree();
  const [mousePosition, setMousePos] = useState<THREE.Vector3 | null>(null);
  const mouse = useMemo(() => new THREE.Vector2(), []);
  const raycaster = useMemo(() => new THREE.Raycaster(), []);
  const planeXZ = useMemo(() => new THREE.Plane(new THREE.Vector3(0, 1, 0), 0), []);
  const intersectionPoint = useMemo(() => new THREE.Vector3(), []);
  
  useFrame(({ gl, scene }) => {
    if (mousePosition) {
      raycaster.setFromCamera(mouse, camera);
      raycaster.ray.intersectPlane(planeXZ, intersectionPoint);
      setMousePosition(intersectionPoint.clone());
    } else {
      setMousePosition(null);
    }
  });
  
  return (
    <mesh
      visible={false}
      onPointerMove={(e) => {
        mouse.set(
          (e.clientX / window.innerWidth) * 2 - 1,
          -(e.clientY / window.innerHeight) * 2 + 1
        );
        setMousePos(new THREE.Vector3(e.point.x, e.point.y, e.point.z));
      }}
      onPointerLeave={() => {
        setMousePos(null);
      }}
    >
      <planeGeometry args={[100, 100]} />
      <meshBasicMaterial transparent opacity={0} />
    </mesh>
  );
}

// Audio-reactive scene contents
function AudioReactiveElements({ mousePosition, tankSize, fishData, plantPositions, crystalData }: {
  mousePosition: THREE.Vector3 | null;
  tankSize: [number, number, number];
  fishData: Array<{scale: number; speed: number; color: string}>;
  plantPositions: Array<[number, number, number]>;
  crystalData: Array<{
    position: [number, number, number];
    rotation: [number, number, number];
    color: string;
    height: number;
  }>;
}) {
  const [audioLevels, setAudioLevels] = useState({ bass: 0, mid: 0, treble: 0 });
  
  // Update audio levels in animation frame
  useFrame(() => {
    const levels = audioManager.getAudioLevels();
    setAudioLevels(levels);
  });
  
  // Use the audio level directly in each component 
  return (
    <WaterTank size={tankSize} audioLevel={audioLevels.bass}>
      {/* Generate fish */}
      {fishData.map((fish, i) => (
        <Fish
          key={`fish-${i}`}
          color={fish.color}
          scale={fish.scale}
          speed={fish.speed}
          tankSize={tankSize}
          index={i}
          audioLevel={audioLevels.bass}
        />
      ))}
      
      {/* Generate plants */}
      {plantPositions.map((position, i) => (
        <Plant
          key={`plant-${i}`}
          position={position}
          height={random(1.5, 3)}
          width={random(0.4, 0.8)}
          color={i % 2 === 0 ? '#B9FFCE' : '#A5F3FF'}
          audioLevel={audioLevels.bass}
        />
      ))}
      
      {/* Generate crystals */}
      {crystalData.map((crystal, i) => (
        <Crystal
          key={`crystal-${i}`}
          position={crystal.position}
          rotation={crystal.rotation}
          color={crystal.color}
          height={crystal.height}
          audioLevel={audioLevels.bass}
          onClick={() => console.log(`Crystal ${i} clicked`)}
        />
      ))}
      
      {/* Particles */}
      <Particles 
        count={150} // Reduced particle count further
        tankSize={tankSize}
        mousePosition={mousePosition}
        audioLevel={audioLevels.bass}
      />
      
      {/* Post-processing effects */}
      <PostProcessing audioLevel={audioLevels.bass} />
    </WaterTank>
  );
}

// Main aquarium scene component
export function AquariumScene() {
  const [mousePosition, setMousePosition] = useState<THREE.Vector3 | null>(null);
  const tankSize: [number, number, number] = [10, 6, 10]; // Width, height, depth
  const [fishCount] = useState(8); // Reduced fish count further
  const [plantCount] = useState(4); // Reduced plant count further
  const [crystalCount] = useState(3); // Reduced crystal count further
  
  // Generate fish data
  const fishData = useMemo(() => {
    return Array.from({ length: fishCount }, (_, i) => ({
      scale: random(0.5, 1.2),
      speed: random(0.5, 1.5),
      color: [
        '#C9B7FF', // Purple
        '#A5F3FF', // Blue
        '#FFB1DC', // Pink
        '#B9FFCE', // Green
      ][Math.floor(Math.random() * 4)],
    }));
  }, [fishCount]);
  
  // Generate plant positions
  const plantPositions = useMemo(() => {
    return Array.from({ length: plantCount }, () => {
      const tankWidth = tankSize[0];
      const tankDepth = tankSize[2];
      const x = (Math.random() - 0.5) * tankWidth * 0.8;
      const z = (Math.random() - 0.5) * tankDepth * 0.8;
      // Place plants on tank floor
      return [x, -tankSize[1]/2, z] as [number, number, number];
    });
  }, [plantCount, tankSize]);
  
  // Generate crystal positions
  const crystalData = useMemo(() => {
    return Array.from({ length: crystalCount }, () => {
      const tankWidth = tankSize[0];
      const tankHeight = tankSize[1];
      const tankDepth = tankSize[2];
      const x = (Math.random() - 0.5) * tankWidth * 0.7;
      const y = (Math.random() - 0.5) * tankHeight * 0.7;
      const z = (Math.random() - 0.5) * tankDepth * 0.7;
      return {
        position: [x, y, z] as [number, number, number],
        rotation: [
          Math.random() * Math.PI,
          Math.random() * Math.PI,
          Math.random() * Math.PI
        ] as [number, number, number],
        color: [
          '#C9B7FF', // Purple
          '#A5F3FF', // Blue
          '#FFB1DC', // Pink
          '#B9FFCE', // Green
        ][Math.floor(Math.random() * 4)],
        height: random(0.8, 1.5),
      };
    });
  }, [crystalCount, tankSize]);
  
  // Initialize audio
  useEffect(() => {
    // Setup error handler for WebGL context loss
    const handleContextLoss = () => {
      toast({
        title: "Graphics Error",
        description: "WebGL context lost. Try refreshing the page.",
        variant: "destructive"
      });
    };
    
    window.addEventListener('webglcontextlost', handleContextLoss);

    try {
      // Use a placeholder tone instead of loading a full audio file
      audioManager.initialize('/audio/main_theme.wav');
      
      // Add click event listener to start audio
      const handleClick = () => {
        try {
          audioManager.play();
        } catch (error) {
          console.error('Audio play error:', error);
          toast({
            title: "Audio Error",
            description: "Couldn't play audio. Try refreshing the page.",
            variant: "warning"
          });
        }
        document.removeEventListener('click', handleClick);
      };
      
      document.addEventListener('click', handleClick);
    } catch (error) {
      console.error('Audio initialization error:', error);
    }
    
    return () => {
      document.removeEventListener('click', handleClick);
      window.removeEventListener('webglcontextlost', handleContextLoss);
      try {
        audioManager.pause();
      } catch (error) {
        console.error('Audio pause error:', error);
      }
    };
  }, []);
  
  return (
    <Canvas 
      style={{ background: 'linear-gradient(to bottom, #1A1F2C, #222744)' }}
      gl={{ 
        antialias: false, // Disable antialiasing for performance
        powerPreference: 'low-power', // Request low power mode for better stability
        alpha: false,
        stencil: false,
        depth: true,
      }}
    >
      <ErrorBoundary>
        <Suspense fallback={<LoadingFallback />}>
          <MouseTracker setMousePosition={setMousePosition} />
          <CameraController />
          <PerspectiveCamera makeDefault position={[0, 0, 12]} fov={60} />
          
          {/* Simplified lighting setup */}
          <ambientLight intensity={0.3} />
          <directionalLight position={[5, 10, 5]} intensity={0.7} color="#F6F7FF" />
          
          {/* Reduced number of point lights */}
          <pointLight position={[5, 3, 0]} intensity={0.4} color="#C9B7FF" />
          <pointLight position={[-5, -2, 0]} intensity={0.4} color="#FFB1DC" />
          
          <AudioReactiveElements
            mousePosition={mousePosition}
            tankSize={tankSize}
            fishData={fishData}
            plantPositions={plantPositions}
            crystalData={crystalData}
          />
          
          {/* Only include Stats in development */}
          {process.env.NODE_ENV === 'development' && <Stats />}
        </Suspense>
      </ErrorBoundary>
    </Canvas>
  );
}

// Simple loading fallback
function LoadingFallback() {
  return (
    <mesh position={[0, 0, 0]}>
      <sphereGeometry args={[1, 8, 8]} />
      <meshBasicMaterial color="#A5F3FF" wireframe />
    </mesh>
  );
}

// Simple error boundary component
class ErrorBoundary extends React.Component<{children: React.ReactNode}, {hasError: boolean}> {
  constructor(props: {children: React.ReactNode}) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: any) {
    return { hasError: true };
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.error("3D Scene Error:", error, errorInfo);
    toast({
      title: "Rendering Error",
      description: "There was a problem rendering the 3D scene. Try refreshing.",
      variant: "destructive"
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[1, 1, 1]} />
          <meshBasicMaterial color="red" />
        </mesh>
      );
    }

    return this.props.children;
  }
}
