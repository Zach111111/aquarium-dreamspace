
import { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { noise2D } from '../utils/noise';

interface WaterTankProps {
  size: [number, number, number];
  children: React.ReactNode;
  audioLevel?: number;
  useSimpleMaterial?: boolean;
}

export function WaterTank({ size, children, audioLevel = 0, useSimpleMaterial = false }: WaterTankProps) {
  const [width, height, depth] = size;
  const waterRef = useRef<THREE.Mesh>(null);
  const waterSurfaceRef = useRef<THREE.Mesh>(null);
  const glassRef = useRef<THREE.Mesh>(null);
  const edgesRef = useRef<THREE.LineSegments>(null);
  const bubblesRef = useRef<THREE.Points>(null);
  const bubbleVelocitiesRef = useRef<THREE.Vector3[]>([]);
  const bubbleCount = 30;
  
  // Enhanced water material with better transparency and light effects
  const waterMaterial = useMemo(() => {
    return new THREE.MeshPhysicalMaterial({
      color: "#66ccff",
      transparent: true,
      opacity: 0.6, // Increased opacity for better visibility
      side: THREE.DoubleSide,
      depthWrite: false, // Changed to false to prevent depth issues with transparent objects
      roughness: 0.1,
      metalness: 0.2,
      clearcoat: 0.8,
      clearcoatRoughness: 0.2,
      envMapIntensity: 1.5,
      transmission: 0.95,
      ior: 1.33
    });
  }, []);

  // Improved glass material with better reflections
  const glassMaterial = useMemo(() => {
    return new THREE.MeshPhysicalMaterial({
      color: "#F6F7FF",
      transparent: true,
      opacity: 0.2, // Slightly increased opacity
      side: THREE.DoubleSide, // Changed to DoubleSide to see both faces
      depthWrite: false,
      depthTest: true,
      roughness: 0.05,
      metalness: 0.9,
      envMapIntensity: 1.5,
      transmission: 0.98,
      reflectivity: 0.9,
      clearcoat: 1.0
    });
  }, []);

  // Simple material for low-performance mode
  const simpleMaterial = useMemo(() => {
    return new THREE.MeshBasicMaterial({
      color: "#66ccff",
      transparent: true,
      opacity: 0.4, // Increased opacity
      side: THREE.DoubleSide
    });
  }, []);

  // Dynamic water surface using vertices
  const waterSurfaceGeometry = useMemo(() => {
    const geometry = new THREE.PlaneGeometry(
      width * 0.98, 
      depth * 0.98, 
      16, // More segments for smoother waves
      16
    );
    geometry.rotateX(-Math.PI / 2); // Rotate to horizontal
    geometry.translate(0, height * 0.95 / 2, 0); // Position at tank top
    return geometry;
  }, [width, depth, height]);
  
  // Water surface material
  const waterSurfaceMaterial = useMemo(() => {
    return new THREE.MeshPhysicalMaterial({
      color: "#77ddff",
      transparent: true,
      opacity: 0.7,
      side: THREE.DoubleSide,
      roughness: 0.1,
      metalness: 0.5,
      envMapIntensity: 2.0,
      reflectivity: 1.0,
      clearcoat: 1.0,
      clearcoatRoughness: 0.1,
      wireframe: false,
    });
  }, []);

  // Bubble geometry and material
  const bubbleGeometry = useMemo(() => {
    return new THREE.BufferGeometry();
    
    // Create initial random positions for bubbles within tank boundaries
    const positions = new Float32Array(bubbleCount * 3);
    for (let i = 0; i < bubbleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * width * 0.8;
      positions[i * 3 + 1] = -height * 0.45 + Math.random() * height * 0.1; // Start near bottom
      positions[i * 3 + 2] = (Math.random() - 0.5) * depth * 0.8;
    }
    
    bubbleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    return bubbleGeometry;
  }, [width, height, depth, bubbleCount]);
  
  const bubbleMaterial = useMemo(() => {
    return new THREE.PointsMaterial({
      color: '#ffffff',
      size: 0.05,
      transparent: true,
      opacity: 0.7,
      blending: THREE.AdditiveBlending,
    });
  }, []);

  // Initialize bubble physics
  useEffect(() => {
    bubbleVelocitiesRef.current = Array(bubbleCount).fill(0).map(() => 
      new THREE.Vector3(
        (Math.random() - 0.5) * 0.003, 
        0.005 + Math.random() * 0.01, 
        (Math.random() - 0.5) * 0.003
      )
    );
  }, [bubbleCount]);

  useFrame(({ clock }) => {
    const time = clock.getElapsedTime();
    
    // Animate water volume with subtle rotation
    if (waterRef.current) {
      waterRef.current.rotation.y = Math.sin(time * 0.1) * 0.02;
    }
    
    // Dynamic water surface animation
    if (waterSurfaceRef.current && waterSurfaceRef.current.geometry) {
      const geometry = waterSurfaceRef.current.geometry;
      const position = geometry.attributes.position;
      
      for (let i = 0; i < position.count; i++) {
        const x = position.getX(i);
        const z = position.getZ(i);
        
        // Calculate wave height based on noise and time
        const noiseScale = 0.3;
        const waveSpeed = 0.4;
        const nx = noise2D(x * noiseScale + time * waveSpeed, z * noiseScale + time * waveSpeed * 0.8);
        const waveHeight = 0.05 * nx;
        
        // Add audio reactivity
        const audioFactor = audioLevel * 0.15;
        const audioWave = audioFactor * Math.sin(time * 5 + x * 2 + z * 2);
        
        // Apply combined height
        const y = waveHeight + audioWave;
        position.setY(i, y + height * 0.95 / 2); // Adjust for base position
      }
      
      position.needsUpdate = true;
    }
    
    // Animate bubbles
    if (bubblesRef.current && bubblesRef.current.geometry) {
      const positions = bubblesRef.current.geometry.attributes.position;
      
      for (let i = 0; i < bubbleCount; i++) {
        // Update bubble position
        positions.setX(i, positions.getX(i) + bubbleVelocitiesRef.current[i].x);
        positions.setY(i, positions.getY(i) + bubbleVelocitiesRef.current[i].y);
        positions.setZ(i, positions.getZ(i) + bubbleVelocitiesRef.current[i].z);
        
        // Apply subtle random movement
        bubbleVelocitiesRef.current[i].x += (Math.random() - 0.5) * 0.001;
        bubbleVelocitiesRef.current[i].z += (Math.random() - 0.5) * 0.001;
        
        // Constrain within tank boundaries
        if (Math.abs(positions.getX(i)) > width * 0.45) {
          bubbleVelocitiesRef.current[i].x *= -0.8;
        }
        
        if (Math.abs(positions.getZ(i)) > depth * 0.45) {
          bubbleVelocitiesRef.current[i].z *= -0.8;
        }
        
        // Reset bubbles that reach the top
        if (positions.getY(i) > height * 0.45) {
          positions.setY(i, -height * 0.45 + Math.random() * 0.1);
          positions.setX(i, (Math.random() - 0.5) * width * 0.8);
          positions.setZ(i, (Math.random() - 0.5) * depth * 0.8);
        }
      }
      
      positions.needsUpdate = true;
    }
  });

  return (
    <group>
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 5, 5]} intensity={0.7} castShadow />
      
      {/* Water volume */}
      <mesh ref={waterRef} position={[0, 0, 0]} renderOrder={1}>
        <boxGeometry args={[width * 0.98, height * 0.98, depth * 0.98]} />
        <primitive object={useSimpleMaterial ? simpleMaterial : waterMaterial} />
      </mesh>
      
      {/* Dynamic water surface */}
      <mesh ref={waterSurfaceRef} renderOrder={3}>
        <primitive object={waterSurfaceGeometry} />
        <primitive object={waterSurfaceMaterial} />
      </mesh>
      
      {/* Glass walls */}
      <mesh ref={glassRef} position={[0, 0, 0]} renderOrder={2}>
        <boxGeometry args={[width + 0.25, height + 0.25, depth + 0.25]} />
        <primitive object={glassMaterial} />
      </mesh>

      {/* Tank edges with increased opacity */}
      <lineSegments ref={edgesRef} renderOrder={4}>
        <edgesGeometry args={[new THREE.BoxGeometry(width + 0.25, height + 0.25, depth + 0.25)]} />
        <lineBasicMaterial color="#ffffff" opacity={0.8} transparent linewidth={1} />
      </lineSegments>
      
      {/* Bubbles */}
      <points ref={bubblesRef} renderOrder={5}>
        <primitive object={bubbleGeometry} />
        <primitive object={bubbleMaterial} />
      </points>
      
      {/* Tank contents */}
      <group position={[0, 0, 0]}>
        {children}
      </group>
    </group>
  );
}
