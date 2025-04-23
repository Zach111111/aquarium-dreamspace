
import { useRef } from 'react';
import { useFrame, extend } from '@react-three/fiber';
import * as THREE from 'three';
import { useAquariumStore } from '../store/aquariumStore';

// Extend Three.js with ShaderMaterial so <shaderMaterial /> works
extend({ ShaderMaterial: THREE.ShaderMaterial });

interface WaterTankProps {
  size: [number, number, number];
  children: React.ReactNode;
  audioLevel?: number;
}

export function WaterTank({ size, children, audioLevel = 0 }: WaterTankProps) {
  const [width, height, depth] = size;
  const toggleMenu = useAquariumStore(state => state.toggleMenu);
  const waterRef = useRef<THREE.Mesh>(null);

  const pressTimer = useRef<NodeJS.Timeout | null>(null);
  const isPressing = useRef(false);

  const handlePointerDown = () => {
    isPressing.current = true;
    pressTimer.current = setTimeout(() => {
      if (isPressing.current) {
        toggleMenu();
      }
    }, 800);
  };

  const handlePointerUp = () => {
    isPressing.current = false;
    if (pressTimer.current) {
      clearTimeout(pressTimer.current);
    }
  };

  useFrame(({ clock }) => {
    if (!waterRef.current) return;
    const time = clock.getElapsedTime();
    if (waterRef.current.material instanceof THREE.ShaderMaterial) {
      waterRef.current.material.uniforms.uTime.value = time;
      waterRef.current.material.uniforms.uAudioLevel.value = audioLevel;
    }
  });

  // Water shader with explicit uniforms/props
  const waterShader = {
    uniforms: {
      uTime: { value: 0 },
      uColor: { value: new THREE.Color('#A5F3FF') },
      uAudioLevel: { value: 0 }
    },
    vertexShader: `
      varying vec2 vUv;
      varying vec3 vPosition;
      void main() {
        vUv = uv;
        vPosition = position;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      precision mediump float;
      uniform float uTime;
      uniform vec3 uColor;
      uniform float uAudioLevel;
      varying vec2 vUv;
      varying vec3 vPosition;

      float noise(vec2 p) {
        return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
      }

      void main() {
        float causticIntensity = 0.03 * (1.0 + uAudioLevel * 2.0);
        vec2 causticUv = vUv * 10.0 + uTime * 0.1;
        float caustic = noise(causticUv) * causticIntensity;

        vec3 waterColor = uColor + vec3(caustic);

        float depthFactor = (vPosition.y + 0.5) * 0.5;
        waterColor = mix(waterColor * 0.7, waterColor, depthFactor);

        if (vPosition.y > 0.48) {
          float wave = sin(vUv.x * 20.0 + uTime)
                     * sin(vUv.y * 20.0 + uTime)
                     * 0.05;
          waterColor += vec3(wave);
        }

        gl_FragColor = vec4(waterColor, 0.6);
      }
    `,
  };

  // Use the custom water shader for final scene
  const useSimpleMaterial = false;

  // thickness for the glass walls
  const wallThickness = 0.25;

  return (
    <group>
      {/* Water volume */}
      <mesh
        ref={waterRef}
        position={[0, 0, 0]}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
      >
        <boxGeometry args={[width, height, depth]} />
        {useSimpleMaterial ? (
          <meshStandardMaterial
            color="#66ccff"
            transparent
            opacity={0.2}
            side={THREE.DoubleSide}
          />
        ) : (
          <shaderMaterial
            attach="material"
            args={[waterShader]}
            transparent
            side={THREE.DoubleSide}
          />
        )}
      </mesh>
      {/* Glass walls */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry
          args={[
            width + wallThickness,
            height + wallThickness,
            depth + wallThickness,
          ]}
        />
        <meshPhysicalMaterial
          color="#F6F7FF"
          transparent
          opacity={0.2}
          roughness={0.05}
          metalness={0.0}
          transmission={0.9}
          thickness={0.25}
          side={THREE.BackSide}
        />
      </mesh>
      {/* Tank contents */}
      <group position={[0, 0, 0]}>
        {children}
      </group>
    </group>
  );
}

WaterTank.displayName = 'WaterTank';

