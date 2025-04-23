
import { ErrorBoundary } from './ErrorBoundary';
import { LoadingFallback } from './LoadingFallback';
import { Suspense } from 'react';
import { MainScene } from './scene/MainScene';

export function AquariumScene() {
  return (
    <ErrorBoundary>
      <Suspense fallback={<LoadingFallback />}>
        <MainScene />
      </Suspense>
    </ErrorBoundary>
  );
}

