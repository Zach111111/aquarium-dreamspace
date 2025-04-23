
import { Mesh } from 'three';

interface DebugCubeProps {
  visible?: boolean;
}

export function DebugCube({ visible = false }: DebugCubeProps) {
  if (!visible) return null;
  
  return (
    <mesh position={[0, 0, 0]}>
      <boxGeometry args={[1, 1, 1]} />
      <meshBasicMaterial color="hotpink" wireframe />
    </mesh>
  );
}

