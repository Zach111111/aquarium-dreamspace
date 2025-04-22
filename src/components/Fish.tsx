
import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { MathUtils, Mesh, Vector3 } from 'three';
import { perlinMovement, generatePositionInTank } from '../utils/noise';

interface FishProps {
  color?: string;
  scale?: number;
  speed?: number;
  tankSize: [number, number, number];
  index: number;
  audioLevel?: number;
}

export function Fish({ 
  color = '#A5F3FF', 
  scale = 1, 
  speed = 1, 
  tankSize,
  index,
  audioLevel = 0
}: FishProps) {
  const fishRef = useRef<Mesh>(null);
  const [tankWidth, tankHeight, tankDepth] = tankSize;
  
  // Create a unique starting position and target for each fish
  const initialPosition = useMemo(() => generatePositionInTank(tankWidth * 0.8, tankHeight * 0.8, tankDepth * 0.8), [tankWidth, tankHeight, tankDepth]);
  const target = useRef(new Vector3(...initialPosition));
  const velocity = useRef(new Vector3(0, 0, 0));
  const baseColor = useRef(color);
  
  // Update fish position each frame
  useFrame(({ clock }) => {
    if (!fishRef.current) return;
    
    const fish = fishRef.current;
    const time = clock.getElapsedTime();
    const fishSpeed = speed * (1 + audioLevel * 0.5); // Boost speed based on audio
    
    // Create perlin noise movement
    const [nx, ny, nz] = perlinMovement(index, index * 0.5, index * 0.2, time * 0.2, fishSpeed, 0.5);
    
    // Update position with noise and boundary checking
    const newX = MathUtils.clamp(fish.position.x + nx, -tankWidth/2 * 0.8, tankWidth/2 * 0.8);
    const newY = MathUtils.clamp(fish.position.y + ny, -tankHeight/2 * 0.8, tankHeight/2 * 0.8);
    const newZ = MathUtils.clamp(fish.position.z + nz, -tankDepth/2 * 0.8, tankDepth/2 * 0.8);
    
    // Apply smooth movement
    fish.position.set(newX, newY, newZ);
    
    // Make fish face the direction of movement
    if (nx !== 0 || ny !== 0 || nz !== 0) {
      const lookTarget = new Vector3(
        fish.position.x + nx * 10,
        fish.position.y + ny * 10,
        fish.position.z + nz * 10
      );
      fish.lookAt(lookTarget);
    }
    
    // Add a little wobble to rotation based on movement and audio
    fish.rotation.z += Math.sin(time * 2) * 0.02 * (1 + audioLevel * 0.3);
    
    // Scale fish slightly with audio
    const pulseScale = 1 + audioLevel * 0.1;
    fish.scale.set(scale * pulseScale, scale * pulseScale, scale * 1.2 * pulseScale);
  });

  // Simple low-poly fish shape
  return (
    <mesh ref={fishRef} position={[initialPosition[0], initialPosition[1], initialPosition[2]]}>
      <group rotation={[0, Math.PI, 0]}>
        {/* Fish body */}
        <mesh>
          <tetrahedronGeometry args={[0.5, 0]} />
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.2} />
        </mesh>
        
        {/* Fish tail */}
        <mesh position={[0.5, 0, 0]} rotation={[0, 0, Math.PI / 4]}>
          <coneGeometry args={[0.2, 0.5, 4, 1]} />
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.15} />
        </mesh>
      </group>
    </mesh>
  );
}
