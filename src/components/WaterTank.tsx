
import React, { useRef, useState, useEffect, useMemo } from 'react';
import { useFrame, extend, Object3DNode } from '@react-three/fiber';
import * as THREE from 'three';
import { shaderMaterial } from '@react-three/drei';
import { useAquariumStore } from '../store/aquariumStore';

// Define WaterShaderMaterial - custom shader material for the water effect
const WaterShaderMaterial = shaderMaterial(
  // Uniforms
  {
    time: 0,
    color: new THREE.Color('#66ccff'),
    opacity: 0.6
  },
  // Vertex shader
  `
    varying vec2 vUv;
    varying vec3 vPosition;
    
    void main() {
      vUv = uv;
      vPosition = position;
      vec3 pos = position;
      
      // Simple wave effect
      float waveHeight = sin(pos.x * 2.0 + time) * 0.05;
      waveHeight += sin(pos.z * 3.0 + time * 1.5) * 0.03;
      pos.y += waveHeight;
      
      gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
    }
  `,
  // Fragment shader
  `
    uniform float time;
    uniform vec3 color;
    uniform float opacity;
    
    varying vec2 vUv;
    varying vec3 vPosition;
    
    void main() {
      // Water color effect
      vec3 waterColor = color;
      
      // Add some depth effect
      float depth = clamp(vPosition.y * 0.5 + 0.5, 0.0, 1.0);
      waterColor = mix(waterColor * 0.5, waterColor, depth);
      
      // Add ripple effect
      float ripple = sin(vUv.x * 20.0 + time) * 0.05;
      ripple += sin(vUv.y * 20.0 + time * 0.8) * 0.05;
      waterColor += ripple;
      
      gl_FragColor = vec4(waterColor, opacity);
    }
  `
);

// Extend to make it available in JSX
extend({ WaterShaderMaterial });

// Add type for the extended material
declare global {
  namespace JSX {
    interface IntrinsicElements {
      waterShaderMaterial: Object3DNode<typeof WaterShaderMaterial, typeof THREE.ShaderMaterial>;
    }
  }
}

interface WaterTankProps {
  size?: [number, number, number];
  children?: React.ReactNode;
  audioLevel?: number;
  useSimpleMaterial?: boolean;
}

export function WaterTank({ 
  size = [5, 4, 5], 
  children, 
  audioLevel = 0,
  useSimpleMaterial = false
}: WaterTankProps) {
  const [width, height, depth] = size;
  const toggleMenu = useAquariumStore(state => state.toggleMenu);
  const waterRef = useRef<THREE.Mesh>(null);
  const glassRef = useRef<THREE.Mesh>(null);
  const waterShaderRef = useRef<THREE.ShaderMaterial>(null);
  
  // Material fallback state
  const [shouldUseSimpleMaterial, setShouldUseSimpleMaterial] = useState(useSimpleMaterial);
  const [materialFailure, setMaterialFailure] = useState(false);

  // Performance monitoring
  useEffect(() => {
    let frameCount = 0;
    let lastTime = performance.now();
    let fps = 60;
    
    const checkPerformance = () => {
      frameCount++;
      const now = performance.now();
      
      if (now - lastTime >= 1000) {
        fps = frameCount;
        frameCount = 0;
        lastTime = now;
        
        // If FPS drops below threshold, switch to simple materials
        if (fps < 30 && !shouldUseSimpleMaterial) {
          console.log('Low performance detected, switching to simple materials');
          setShouldUseSimpleMaterial(true);
        }
      }
      
      requestAnimationFrame(checkPerformance);
    };
    
    const handle = requestAnimationFrame(checkPerformance);
    
    return () => cancelAnimationFrame(handle);
  }, [shouldUseSimpleMaterial]);

  // Basic interaction with safe error handling
  const handlePointerDown = () => {
    try {
      toggleMenu();
    } catch (error) {
      console.error("Error in menu toggle:", error);
    }
  };

  // Update shader uniforms on each frame
  useFrame(({ clock }) => {
    // Update shader time uniform
    if (waterShaderRef.current) {
      waterShaderRef.current.uniforms.time.value = clock.getElapsedTime();
    }
    
    if (!waterRef.current) return;
    
    try {
      // Simple water animation
      const time = clock.getElapsedTime();
      waterRef.current.rotation.y = Math.sin(time * 0.1) * 0.05;
      
      // Audio-reactive water movement
      if (audioLevel > 0.1) {
        waterRef.current.position.y = Math.sin(time * 2) * audioLevel * 0.2;
      }
    } catch (error) {
      console.error("Water animation error:", error);
    }
  });

  // Material creation with error handling
  const glassMaterial = useMemo(() => {
    try {
      if (shouldUseSimpleMaterial || materialFailure) {
        return new THREE.MeshBasicMaterial({
          color: "#F6F7FF",
          transparent: true,
          opacity: 0.2,
          side: THREE.BackSide
        });
      } else {
        return new THREE.MeshPhysicalMaterial({
          color: "#F6F7FF",
          transparent: true,
          opacity: 0.2,
          transmission: 0.95,
          thickness: 0.25,
          roughness: 0.05,
          ior: 1.52,
          side: THREE.BackSide
        });
      }
    } catch (error) {
      console.error("Failed to create glass material:", error);
      setMaterialFailure(true);
      return new THREE.MeshBasicMaterial({
        color: "#F6F7FF",
        transparent: true,
        opacity: 0.2,
        side: THREE.BackSide
      });
    }
  }, [shouldUseSimpleMaterial, materialFailure]);

  // thickness for the glass walls
  const wallThickness = 0.25;

  return (
    <group>
      {/* Water volume */}
      <mesh
        ref={waterRef}
        position={[0, 0, 0]}
        onPointerDown={handlePointerDown}
      >
        <boxGeometry args={[width * 0.98, height * 0.98, depth * 0.98]} />
        {shouldUseSimpleMaterial || materialFailure ? (
          <meshBasicMaterial 
            color="#66ccff"
            transparent
            opacity={0.6}
          />
        ) : (
          <waterShaderMaterial 
            ref={waterShaderRef}
            transparent
            side={THREE.DoubleSide}
            opacity={0.6}
          />
        )}
      </mesh>
      
      {/* Glass walls */}
      <mesh 
        ref={glassRef}
        position={[0, 0, 0]}
      >
        <boxGeometry
          args={[
            width + wallThickness,
            height + wallThickness,
            depth + wallThickness,
          ]}
        />
        <primitive object={glassMaterial} attach="material" />
      </mesh>
      
      {/* Tank contents */}
      <group position={[0, 0, 0]}>
        {children}
      </group>
    </group>
  );
}

WaterTank.displayName = 'WaterTank';
