
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import { KernelSize } from 'postprocessing';

interface PostProcessingProps {
  audioLevel?: number;
}

export function PostProcessing({ audioLevel = 0 }: PostProcessingProps) {
  // Completely disable post-processing until the base scene is stable
  return null;
}

PostProcessing.displayName = 'PostProcessing';
