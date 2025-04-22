import React, { useMemo, useRef, useState, useEffect } from 'react';
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

// Audio-reactive elements wrapper
function AudioReactiveScene({ children }: { children: React.ReactNode }) {
  const [audioLevels, setAudioLevels] = useState({ bass: 0, mid: 0, treble: 0 });
  
  // Update audio levels in animation frame
  useFrame(() => {
    const levels = audioManager.getAudioLevels();
    setAudioLevels(levels);
  });
  
  // Check if children is a valid element before cloning
  const childrenWithProps = React.Children.map(children, child => {
    if (React.isValidElement(child)) {
      return React.cloneElement(child, { audioLevel: audioLevels.bass });
    }
    return child;
  });
  
  return <>{childrenWithProps}</>;
}

// Main aquarium scene component
export function AquariumScene() {
  const [mousePosition, setMousePosition] = useState<THREE.Vector3 | null>(null);
  const tankSize: [number, number, number] = [10, 6, 10]; // Width, height, depth
  const [fishCount] = useState(15);
  const [plantCount] = useState(8);
  const [crystalCount] = useState(6);
  
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
    audioManager.initialize('/audio/main_theme.wav');
    
    // Add click event listener to start audio
    const handleClick = () => {
      audioManager.play();
      document.removeEventListener('click', handleClick);
    };
    
    document.addEventListener('click', handleClick);
    
    return () => {
      document.removeEventListener('click', handleClick);
      audioManager.pause();
    };
  }, []);
  
  return (
    <Canvas style={{ background: 'linear-gradient(to bottom, #1A1F2C, #222744)' }}>
      <React.Suspense fallback={null}>
        <MouseTracker setMousePosition={setMousePosition} />
        <CameraController />
        <PerspectiveCamera makeDefault position={[0, 0, 12]} fov={60} />
        
        {/* Ambient lighting */}
        <ambientLight intensity={0.2} />
        
        {/* Main directional light */}
        <directionalLight 
          position={[5, 10, 5]} 
          intensity={0.8} 
          color="#F6F7FF" 
        />
        
        {/* Colored point lights for atmosphere */}
        <pointLight position={[5, 3, 0]} intensity={0.5} color="#C9B7FF" />
        <pointLight position={[-5, -2, 0]} intensity={0.5} color="#FFB1DC" />
        <pointLight position={[0, -3, 5]} intensity={0.5} color="#A5F3FF" />
        
        <AudioReactiveScene>
          <WaterTank size={tankSize}>
            {/* Generate fish */}
            {fishData.map((fish, i) => (
              <Fish
                key={`fish-${i}`}
                color={fish.color}
                scale={fish.scale}
                speed={fish.speed}
                tankSize={tankSize}
                index={i}
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
                onClick={() => console.log(`Crystal ${i} clicked`)}
              />
            ))}
            
            {/* Particles */}
            <Particles 
              count={300}
              tankSize={tankSize}
              mousePosition={mousePosition}
            />
          </WaterTank>
          
          <PostProcessing />
        </AudioReactiveScene>
        
        {/* Performance stats - remove in production */}
        <Stats />
      </React.Suspense>
    </Canvas>
  );
}
