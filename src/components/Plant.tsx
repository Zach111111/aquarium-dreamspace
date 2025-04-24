
import { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useAquariumStore } from '../store/aquariumStore';
import { noise3D } from '../utils/noise';

interface PlantProps {
  position: [number, number, number];
  color?: string;
  height?: number;
  width?: number;
  segments?: number;
  audioLevel?: number;
}

export function Plant({ 
  position, 
  color = '#B9FFCE', 
  height = 2, 
  width = 0.5,
  segments = 4,
  audioLevel = 0
}: PlantProps) {
  const segmentsCount = 7; // Number of segments in the plant
  const mainStemRef = useRef<THREE.Group>(null);
  const stemSegmentRefs = useRef<THREE.Mesh[]>([]);
  const speedFactor = useAquariumStore(state => state.speedFactor);
  const baseColor = useMemo(() => new THREE.Color(color), [color]);
  const leafCount = useMemo(() => Math.floor(Math.random() * 3) + 2, []);
  const leafPositions = useMemo(() => 
    Array.from({ length: leafCount }).map(() => ({
      segment: Math.floor(Math.random() * (segmentsCount - 1)) + 1,
      angle: Math.random() * Math.PI * 2,
      length: 0.3 + Math.random() * 0.4,
      width: 0.1 + Math.random() * 0.15
    })), 
    [leafCount]
  );
  
  // Initialize segment positions
  const initialSegmentPositions = useMemo(() => {
    const positions = [];
    const segmentHeight = height / segmentsCount;
    for (let i = 0; i < segmentsCount; i++) {
      positions.push([0, i * segmentHeight, 0]);
    }
    return positions;
  }, [height, segmentsCount]);
  
  // Create materials with different shades of the base color
  const materials = useMemo(() => {
    return Array.from({ length: segmentsCount }).map((_, i) => {
      const segmentColor = baseColor.clone().lerp(
        new THREE.Color('#ffffff'), 
        0.1 * (i / segmentsCount)
      );
      
      return new THREE.MeshStandardMaterial({
        color: segmentColor,
        emissive: segmentColor.clone().multiplyScalar(0.2),
        roughness: 0.6,
        metalness: 0.1,
        transparent: true,
        opacity: 0.9,
      });
    });
  }, [baseColor, segmentsCount]);

  // Create leaf material
  const leafMaterial = useMemo(() => {
    const leafColor = baseColor.clone().lerp(new THREE.Color('#ffffff'), 0.2);
    return new THREE.MeshStandardMaterial({
      color: leafColor,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.8,
    });
  }, [baseColor]);

  useEffect(() => {
    // Initialize references array
    stemSegmentRefs.current = [];
  }, []);
  
  useFrame(({ clock }) => {
    if (!mainStemRef.current) return;
    
    const time = clock.getElapsedTime();
    const segmentSpacing = height / segmentsCount;
    
    // Add dynamic motion to each segment with increasing influence
    stemSegmentRefs.current.forEach((segment, i) => {
      if (!segment) return;
      
      // Base animation - swaying motion
      const swayFactor = 0.05 * (i + 1) * (i / segmentsCount); // More sway at the top
      const swayX = Math.sin(time * speedFactor * 0.8 + i * 0.2) * swayFactor;
      const swayZ = Math.cos(time * speedFactor * 0.7 + i * 0.3) * swayFactor;
      
      // Noise-based organic motion
      const noiseScale = 0.2;
      const noiseTime = time * 0.3;
      const noiseX = noise3D(i * noiseScale, 0, noiseTime) * 0.04 * (i + 1);
      const noiseZ = noise3D(i * noiseScale, 1, noiseTime) * 0.04 * (i + 1);
      
      // Audio reactivity
      const audioFactor = audioLevel * 0.3 * (i / segmentsCount);
      
      // Apply combined movement
      segment.position.x = swayX + noiseX + (audioFactor * Math.sin(time * 5));
      segment.position.z = swayZ + noiseZ + (audioFactor * Math.cos(time * 5));
      
      if (i > 0) {
        // Orient each segment to point at the next one (except the last segment)
        const parentPos = stemSegmentRefs.current[i-1].position;
        const currentPos = segment.position;
        
        // Calculate direction from parent to this segment
        const direction = new THREE.Vector3()
          .subVectors(currentPos, parentPos)
          .normalize();
          
        // Create rotation to align with this direction
        const axis = new THREE.Vector3(0, 1, 0);
        const angle = Math.atan2(direction.x, direction.z);
        segment.rotation.y = angle;
        
        // Tilt the segment based on how far it's moved from center
        const displacement = Math.sqrt(currentPos.x * currentPos.x + currentPos.z * currentPos.z);
        segment.rotation.x = displacement * 0.5;
      }
    });
  });

  return (
    <group position={[position[0], position[1], position[2]]}>
      <group ref={mainStemRef}>
        {/* Main stem segments */}
        {Array.from({ length: segmentsCount }).map((_, i) => (
          <mesh 
            key={`segment-${i}`}
            position={[
              initialSegmentPositions[i][0], 
              initialSegmentPositions[i][1], 
              initialSegmentPositions[i][2]
            ]}
            ref={el => {
              if (el) stemSegmentRefs.current[i] = el;
            }}
          >
            <cylinderGeometry 
              args={[
                width * 0.1 * (segmentsCount - i) / segmentsCount, // Top radius decreases with height
                width * 0.15 * (segmentsCount - i + 1) / segmentsCount, // Bottom radius
                height / segmentsCount, // Height of segment
                segments, // Radial segments
                1 // Height segments
              ]} 
            />
            <primitive object={materials[i]} />
          </mesh>
        ))}
        
        {/* Leaves */}
        {leafPositions.map((leaf, i) => {
          const segmentIndex = leaf.segment;
          const segmentHeight = height / segmentsCount;
          return (
            <mesh 
              key={`leaf-${i}`}
              position={[
                initialSegmentPositions[segmentIndex][0], 
                initialSegmentPositions[segmentIndex][1], 
                initialSegmentPositions[segmentIndex][2]
              ]}
              rotation={[0, leaf.angle, Math.PI / 4]}
            >
              <planeGeometry args={[leaf.width, leaf.length]} />
              <primitive object={leafMaterial} />
            </mesh>
          );
        })}
      </group>
    </group>
  );
}
