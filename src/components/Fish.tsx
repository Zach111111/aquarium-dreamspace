
import { useRef, useMemo, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Group, Vector3, MathUtils } from 'three';
import { useAquariumStore } from '../store/aquariumStore';
import { toast } from "@/components/ui/use-toast";

interface FishProps {
  color?: string;
  scale?: number;
  speed?: number;
  tankSize: [number, number, number];
  index: number;
  audioLevel?: number;
  groupOffset?: { x: number; y: number; z: number };
}

export function Fish({ 
  color = '#A5F3FF',
  scale = 1, 
  speed = 1,
  tankSize,
  index,
  audioLevel = 0,
  groupOffset = { x: 0, y: 0, z: 0 }
}: FishProps) {
  const fishRef = useRef<Group>(null);
  const bodyRef = useRef<THREE.Mesh>(null);
  const tailRef = useRef<THREE.Mesh>(null);
  const speedFactor = useAquariumStore(state => state.speedFactor);
  const decrementScore = useAquariumStore(state => state.decrementScore);
  const [isHovered, setIsHovered] = useState(false);
  const [isClicked, setIsClicked] = useState(false);
  
  // Calculate tank boundaries
  const [tankWidth, tankHeight, tankDepth] = tankSize;
  const bounds = {
    minX: -(tankWidth/2) * 0.8,
    maxX: (tankWidth/2) * 0.8,
    minY: -(tankHeight/2) * 0.8,
    maxY: (tankHeight/2) * 0.8,
    minZ: -(tankDepth/2) * 0.8,
    maxZ: (tankDepth/2) * 0.8
  };
  
  const initialPosition = useMemo(() => new Vector3(
    MathUtils.lerp(bounds.minX, bounds.maxX, Math.random()),
    MathUtils.lerp(bounds.minY, bounds.maxY, Math.random()),
    MathUtils.lerp(bounds.minZ, bounds.maxZ, Math.random())
  ), [bounds]);

  const movementParams = useMemo(() => ({
    amplitude: 0.01 + Math.random() * 0.01,
    frequency: 0.5 + Math.random() * 1.0,
    phaseOffset: Math.random() * Math.PI * 2 + index * (Math.PI / 4),
    verticalFactor: 0.3 + Math.random() * 0.7
  }), [index]);

  // Body and tail materials
  const bodyMaterial = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: color,
      emissive: color,
      emissiveIntensity: 0.2,
      roughness: 0.4
    });
  }, [color]);

  const tailMaterial = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: color,
      emissive: color,
      emissiveIntensity: 0.2,
      roughness: 0.4
    });
  }, [color]);

  useFrame(({ clock }) => {
    if (!fishRef.current) return;
    
    const time = clock.getElapsedTime();
    const actualSpeed = speed * speedFactor;
    
    // Calculate base position with group offset
    const phase = time * movementParams.frequency * actualSpeed + movementParams.phaseOffset;
    
    const targetPos = new Vector3(
      initialPosition.x + Math.sin(phase) * 6 + groupOffset.x,
      initialPosition.y + Math.sin(phase * movementParams.verticalFactor) * 4 + groupOffset.y,
      initialPosition.z + Math.cos(phase * 0.7) * 5 + groupOffset.z
    );
    
    // Apply boundary limits
    targetPos.x = MathUtils.clamp(targetPos.x, bounds.minX, bounds.maxX);
    targetPos.y = MathUtils.clamp(targetPos.y, bounds.minY, bounds.maxY);
    targetPos.z = MathUtils.clamp(targetPos.z, bounds.minZ, bounds.maxZ);
    
    // Smooth movement
    fishRef.current.position.lerp(targetPos, 0.02 * actualSpeed);
    
    // Fish rotation
    const direction = new Vector3().subVectors(targetPos, fishRef.current.position).normalize();
    if (direction.length() > 0.1) {
      fishRef.current.lookAt(fishRef.current.position.clone().add(direction));
      fishRef.current.rotation.z = Math.sin(time * 3 * speedFactor) * 0.2;
    }

    // Update materials based on hover state
    if (bodyRef.current && bodyRef.current.material) {
      const material = bodyRef.current.material as THREE.MeshStandardMaterial;
      material.emissiveIntensity = isHovered ? 0.5 : 0.2;
      material.color.set(isClicked ? '#ff6666' : color);
    }

    if (tailRef.current && tailRef.current.material) {
      const material = tailRef.current.material as THREE.MeshStandardMaterial;
      material.emissiveIntensity = isHovered ? 0.5 : 0.2;
      material.color.set(isClicked ? '#ff6666' : color);
    }

    // Reset click animation after short time
    if (isClicked) {
      setTimeout(() => setIsClicked(false), 300);
    }
  });

  const handlePointerDown = (e: THREE.Event) => {
    // Stop event propagation to prevent it from reaching objects behind
    e.stopPropagation();
    
    decrementScore();
    setIsClicked(true);
    toast({
      title: "You touched a fish, oh no!",
      description: "-1",
      variant: "destructive",
      className: "compact-toast bg-[#1A1F2C] border-[#E5DEFF] text-[#E5DEFF]",
    });
  };

  return (
    <group 
      ref={fishRef} 
      position={initialPosition.toArray()}
      renderOrder={5} // Set a high render order for better visibility
    >
      {/* Fish body */}
      <mesh 
        ref={bodyRef}
        scale={[1, 0.6, 0.5]}
        onPointerDown={handlePointerDown}
        onPointerOver={(e) => {
          e.stopPropagation();
          document.body.style.cursor = 'pointer';
          setIsHovered(true);
        }}
        onPointerOut={(e) => {
          e.stopPropagation();
          document.body.style.cursor = 'default';
          setIsHovered(false);
        }}
      >
        <tetrahedronGeometry args={[0.5, 0]} />
        <meshStandardMaterial 
          color={isClicked ? '#ff6666' : color} 
          emissive={color} 
          emissiveIntensity={isHovered ? 0.5 : 0.2}
          roughness={0.4}
        />
      </mesh>
      
      {/* Fish tail */}
      <mesh 
        ref={tailRef}
        position={[-0.4, 0, 0]} 
        scale={[0.4, 0.3, 0.2]}
        onPointerDown={handlePointerDown}
        onPointerOver={(e) => {
          e.stopPropagation();
          document.body.style.cursor = 'pointer';
          setIsHovered(true);
        }}
        onPointerOut={(e) => {
          e.stopPropagation();
          document.body.style.cursor = 'default';
          setIsHovered(false);
        }}
      >
        <tetrahedronGeometry args={[0.5, 0]} />
        <meshStandardMaterial 
          color={isClicked ? '#ff6666' : color} 
          emissive={color} 
          emissiveIntensity={isHovered ? 0.5 : 0.2}
          roughness={0.4}
        />
      </mesh>
    </group>
  );
}
