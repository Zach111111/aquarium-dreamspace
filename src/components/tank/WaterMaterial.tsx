
import { useMemo } from 'react';
import * as THREE from 'three';

interface WaterMaterialProps {
  useSimpleMaterial?: boolean;
}

export const WaterMaterial = ({ useSimpleMaterial = false }: WaterMaterialProps) => {
  const material = useMemo(() => {
    return useSimpleMaterial ? 
      new THREE.MeshBasicMaterial({
        color: "#66ccff",
        transparent: true,
        opacity: 0.4,
        side: THREE.DoubleSide
      }) :
      new THREE.MeshPhysicalMaterial({
        color: "#66ccff",
        transparent: true,
        opacity: 0.6,
        side: THREE.DoubleSide,
        depthWrite: false,
        roughness: 0.1,
        metalness: 0.2,
        clearcoat: 0.8,
        clearcoatRoughness: 0.2,
        envMapIntensity: 1.5,
        transmission: 0.95,
        ior: 1.33
      });
  }, [useSimpleMaterial]);

  return <primitive object={material} />;
};
