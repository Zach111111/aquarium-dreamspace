
import { useMemo } from 'react';
import * as THREE from 'three';

export const GlassMaterial = () => {
  const material = useMemo(() => {
    return new THREE.MeshPhysicalMaterial({
      color: "#F6F7FF",
      transparent: true,
      opacity: 0.2,
      side: THREE.DoubleSide,
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

  return <primitive object={material} />;
};
