
import { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useAquariumStore } from '../store/aquariumStore';
import { noise3D, calculateSeaweedMovement } from '../utils/noise';

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
  segments = 8,
  audioLevel = 0
}: PlantProps) {
  const mainStemRef = useRef<THREE.Group>(null);
  const stemSegmentRefs = useRef<THREE.Mesh[]>([]);
  const speedFactor = useAquariumStore(state => state.speedFactor);
  
  const baseColor = useMemo(() => new THREE.Color(color), [color]);
  const leafCount = useMemo(() => Math.floor(Math.random() * 3) + 2, []);
  
  // Generate leaf positions
  const leafPositions = useMemo(() => 
    Array.from({ length: leafCount }).map(() => ({
      segment: Math.floor(Math.random() * (segments - 1)) + 1,
      angle: Math.random() * Math.PI * 2,
      length: 0.3 + Math.random() * 0.4,
      width: 0.1 + Math.random() * 0.15
    })), 
    [leafCount, segments]
  );
  
  // Initialize segment positions
  const initialSegmentPositions = useMemo(() => {
    const positions = [];
    const segmentHeight = height / segments;
    for (let i = 0; i < segments; i++) {
      positions.push([0, i * segmentHeight, 0]);
    }
    return positions;
  }, [height, segments]);
  
  // Create materials with different shades
  const materials = useMemo(() => {
    return Array.from({ length: segments }).map((_, i) => {
      const segmentColor = baseColor.clone().lerp(
        new THREE.Color('#ffffff'), 
        0.1 * (i / segments)
      );
      
      return new THREE.MeshStandardMaterial({
        color: segmentColor,
        transparent: true,
        opacity: 0.9,
        metalness: 0.1,
        roughness: 0.7,
      });
    });
  }, [baseColor, segments]);

  // Leaf material
  const leafMaterial = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: baseColor.clone().lerp(new THREE.Color('#ffffff'), 0.2),
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.8,
    });
  }, [baseColor]);

  useFrame(({ clock }) => {
    if (!mainStemRef.current) return;
    
    const time = clock.getElapsedTime();
    
    // Animate each segment
    stemSegmentRefs.current.forEach((segment, i) => {
      if (!segment) return;
      
      const [xOffset, zOffset] = calculateSeaweedMovement(
        i,
        segments,
        time * speedFactor,
        0.15,
        audioLevel
      );
      
      // Apply movement
      segment.position.x = xOffset;
      segment.position.z = zOffset;
      
      // Orient segments
      if (i > 0) {
        const prevSegment = stemSegmentRefs.current[i - 1];
        if (prevSegment) {
          const direction = new THREE.Vector3()
            .subVectors(segment.position, prevSegment.position)
            .normalize();
          
          // Calculate rotation to point at next segment
          const quaternion = new THREE.Quaternion();
          const up = new THREE.Vector3(0, 1, 0);
          const axis = new THREE.Vector3().crossVectors(up, direction).normalize();
          const angle = Math.acos(up.dot(direction));
          quaternion.setFromAxisAngle(axis, angle);
          
          segment.quaternion.slerp(quaternion, 0.1);
        }
      }
    });
  });

  return (
    <group position={position}>
      <group ref={mainStemRef}>
        {/* Stem segments */}
        {Array.from({ length: segments }).map((_, i) => (
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
                width * 0.1 * (segments - i) / segments,
                width * 0.15 * (segments - i + 1) / segments,
                height / segments,
                6,
                1
              ]} 
            />
            <primitive object={materials[i]} />
          </mesh>
        ))}
        
        {/* Leaves */}
        {leafPositions.map((leaf, i) => (
          <mesh 
            key={`leaf-${i}`}
            position={[
              initialSegmentPositions[leaf.segment][0], 
              initialSegmentPositions[leaf.segment][1], 
              initialSegmentPositions[leaf.segment][2]
            ]}
            rotation={[0, leaf.angle, Math.PI / 4]}
          >
            <planeGeometry args={[leaf.width, leaf.length]} />
            <primitive object={leafMaterial} />
          </mesh>
        ))}
      </group>
    </group>
  );
}
