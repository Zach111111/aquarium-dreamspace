
import React, { useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import { useFrame } from '@react-three/fiber';
import { Group, Mesh, Vector3 } from 'three';
import { noise3D, random } from '../utils/noise';

interface FishProps {
  color?: string;
  scale?: number;
  speed?: number;
  tankSize: [number, number, number];
  index: number;
  audioLevel?: number;
  allFishPositions?: Vector3[];
}

// Helper function for vector interpolation
function lerpVec(target: Vector3, dest: Vector3, amt: number) {
  target.x += (dest.x - target.x) * amt;
  target.y += (dest.y - target.y) * amt;
  target.z += (dest.z - target.z) * amt;
}

export const Fish = forwardRef<Group, FishProps>(({
  color = '#A5F3FF',
  scale = 1,
  speed = 1,
  tankSize = [10, 6, 10], // Default size to prevent undefined
  index = 0,
  audioLevel = 0,
  allFishPositions = [],
}, ref) => {
  const groupRef = useRef<Group>(null);
  
  // Forward the ref
  useImperativeHandle(ref, () => groupRef.current as Group);

  const velocity = useRef(new Vector3(random(-1, 1), random(-0.5, 0.5), random(-1, 1)));
  const targetPosition = useRef(new Vector3());
  const soloTendency = useRef(Math.random() * 0.7 + 0.3);

  // Initialize fish position
  useEffect(() => {
    if (groupRef.current) {
      const [tankWidth, tankHeight, tankDepth] = tankSize;
      groupRef.current.position.set(
        random(-tankWidth * 0.3, tankWidth * 0.3),
        random(-tankHeight * 0.2, tankHeight * 0.2),
        random(-tankDepth * 0.3, tankDepth * 0.3)
      );
      targetPosition.current.copy(groupRef.current.position);
    }
  }, [tankSize]);

  // Handle fish movement with safe error handling
  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    
    try {
      const [tankWidth, tankHeight, tankDepth] = tankSize;
      const t = clock.getElapsedTime();
      const fish = groupRef.current;
      const thisPos = fish.position;
      const target = new Vector3().copy(targetPosition.current);

      const noiseScale = 0.45;
      target.x += noise3D(index * 10 + 10, 0, t * 0.25) * noiseScale * 3;
      target.y += noise3D(0, index * 10 + 20, t * 0.19) * noiseScale * 2;
      target.z += noise3D(0, 0, t * 0.23 + index * 5) * noiseScale * 3;

      // Safe handling of neighbor fish
      if (allFishPositions && allFishPositions.length > 0) {
        const avg = new Vector3();
        let neighborCount = 0;
        
        for (let i = 0; i < allFishPositions.length; i++) {
          const pos = allFishPositions[i];
          if (i !== index && pos && thisPos.distanceTo(pos) < 3.5) {
            avg.add(pos);
            neighborCount++;
          }
        }
        
        if (neighborCount > 0) {
          avg.divideScalar(neighborCount);
          target.lerp(avg, 0.25 * (1 - soloTendency.current));
        }
      }

      // Move towards target
      lerpVec(thisPos, target, 0.012 * (0.7 + 0.6 * speed) * (1 + audioLevel * 0.3));

      // Constrain to tank bounds
      thisPos.x = Math.max(-tankWidth / 2 + 1, Math.min(tankWidth / 2 - 1, thisPos.x));
      thisPos.y = Math.max(-tankHeight / 2 + 1, Math.min(tankHeight / 2 - 1, thisPos.y));
      thisPos.z = Math.max(-tankDepth / 2 + 1, Math.min(tankDepth / 2 - 1, thisPos.z));

      // Rotation
      const prev = thisPos.clone();
      velocity.current.subVectors(thisPos, prev);
      if (velocity.current.length() > 0.01) {
        const lookHere = new Vector3().copy(thisPos).add(velocity.current.normalize());
        fish.lookAt(lookHere);
        fish.rotation.z = Math.sin(t * 2.7 + index) * 0.17;
      }

      // Breathing animation
      const breath = 1 + Math.sin(t * 3 + index * 50) * 0.045;
      fish.scale.set(scale * 1, scale * 0.5 * breath, scale * 0.88);
    } catch (error) {
      console.error("Fish animation error:", error);
    }
  });

  // Simple fish mesh
  return (
    <group ref={groupRef}>
      <mesh scale={[1, 0.6, 0.5]}>
        <tetrahedronGeometry args={[0.5, 0]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.15}
          roughness={0.36}
        />
      </mesh>
      <mesh position={[0.4, 0, 0]} rotation={[0, 0, Math.PI]} scale={[0.38, 0.25, 0.16]}>
        <tetrahedronGeometry args={[0.5, 0]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.16}
          roughness={0.4}
        />
      </mesh>
    </group>
  );
});

Fish.displayName = 'Fish';
