
import React from 'react';
import { toast } from "@/components/ui/use-toast";

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(_error: any) {
    return { hasError: true };
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.error("3D Scene Error:", error, errorInfo);
    toast({
      title: "Rendering Error",
      description: "There was a problem rendering the 3D scene. Try refreshing.",
      variant: "destructive"
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[1, 1, 1]} />
          <meshBasicMaterial color="red" />
        </mesh>
      );
    }

    return this.props.children;
  }
}
