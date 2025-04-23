import { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Mesh, Vector3 } from 'three';
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

function lerpVec(target: Vector3, dest: Vector3, amt: number) {
  target.x += (dest.x - target.x) * amt;
  target.y += (dest.y - target.y) * amt;
  target.z += (dest.z - target.z) * amt;
}

export function Fish({
  color = '#A5F3FF',
  scale = 1,
  speed = 1,
  tankSize,
  index,
  audioLevel = 0,
  allFishPositions = [],
}: FishProps) {
  const fishRef = useRef<Mesh>(null);
  const velocity = useRef(new Vector3(random(-1, 1), random(-0.5, 0.5), random(-1, 1)));
  const targetPosition = useRef(new Vector3());
  const soloTendency = useRef(Math.random() * 0.7 + 0.3); // blend between group & solo

  // Initial random position
  useEffect(() => {
    if (fishRef.current) {
      const [tankWidth, tankHeight, tankDepth] = tankSize;
      fishRef.current.position.set(
        random(-tankWidth * 0.3, tankWidth * 0.3),
        random(-tankHeight * 0.2, tankHeight * 0.2),
        random(-tankDepth * 0.3, tankDepth * 0.3)
      );
      targetPosition.current.copy(fishRef.current.position);
    }
    // eslint-disable-next-line
  }, [tankSize]);

  useFrame(({ clock }) => {
    if (!fishRef.current) return;
    const [tankWidth, tankHeight, tankDepth] = tankSize;
    const t = clock.getElapsedTime();
    const fish = fishRef.current;
    const thisPos = fish.position;
    let target = new Vector3().copy(targetPosition.current);

    // natural gentle noise-based wandering
    const noiseScale = 0.45;
    target.x += noise3D(index * 10 + 10, 0, t * 0.25) * noiseScale * 3;
    target.y += noise3D(0, index * 10 + 20, t * 0.19) * noiseScale * 2;
    target.z += noise3D(0, 0, t * 0.23 + index * 5) * noiseScale * 3;

    // Schooling effect ("boids-lite")
    if (allFishPositions && allFishPositions.length > 2) {
      // steer toward group "center" sometimes, but keep some solo/chaos
      let avg = new Vector3();
      let neighborCount = 0;
      allFishPositions.forEach((pos, i) => {
        if (i !== index && pos) {
          if (thisPos.distanceTo(pos) < 3.5) { // in proximity
            avg.add(pos);
            neighborCount++;
          }
        }
      });
      if (neighborCount > 0) {
        avg.multiplyScalar(1 / neighborCount);
        // steer slightly to the group with solo blend
        target.lerp(avg, 0.25 * (1 - soloTendency.current));
      }
    }

    // Smoothly chase the target
    lerpVec(thisPos, target, 0.012 * (0.7 + 0.6 * speed) * (1 + audioLevel * 0.3));

    // Stay in tank bounds & vertical level
    thisPos.x = Math.max(-tankWidth / 2 + 1, Math.min(tankWidth / 2 - 1, thisPos.x));
    thisPos.y = Math.max(-tankHeight / 2 + 1, Math.min(tankHeight / 2 - 1, thisPos.y));
    thisPos.z = Math.max(-tankDepth / 2 + 1, Math.min(tankDepth / 2 - 1, thisPos.z));

    // Subtle "turn to direction of velocity"
    const prev = velocity.current.clone();
    velocity.current.subVectors(thisPos, prev);
    if (velocity.current.length() > 0.01) {
      let lookHere = new Vector3().copy(thisPos).add(velocity.current.clone().normalize());
      fish.lookAt(lookHere);
      // add a gentle perlin "wobble" twist
      fish.rotation.z = Math.sin(t * 2.7 + index) * 0.17;
    }

    // Gentle breathing/pulse
    const breath = 1 + Math.sin(t * 3 + index * 50) * 0.045;
    fish.scale.set(scale * 1, scale * 0.5 * breath, scale * 0.88);
  });

  // Shape: body + tail, as before
  return (
    <group>
      <mesh ref={fishRef} scale={[1, 0.6, 0.5]}>
        <tetrahedronGeometry args={[0.5, 0]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.15}
          roughness={0.36}
        />
      </mesh>
      {/* Tail fin */}
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
}

Fish.displayName = 'Fish';
