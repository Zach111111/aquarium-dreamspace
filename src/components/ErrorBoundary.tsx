
import React from 'react';
import { toast } from "@/components/ui/use-toast";

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: any;
  errorInfo: React.ErrorInfo | null;
  retryCount: number;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null, 
      errorInfo: null,
      retryCount: 0
    };
  }

  static getDerivedStateFromError(error: any) {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error: any, errorInfo: React.ErrorInfo) {
    // Log the error to console
    console.error("3D Scene Error:", error, errorInfo);
    
    // Show toast notification to user
    toast({
      title: "Rendering Error",
      description: "There was a problem rendering the 3D scene. See console for details.",
      variant: "destructive"
    });
    
    // Update state with error details
    this.setState(prev => ({
      errorInfo,
      retryCount: prev.retryCount + 1
    }));

    // Auto-retry after delay if not too many attempts
    if (this.state.retryCount < 3) {
      setTimeout(() => {
        console.log(`Auto-retry attempt ${this.state.retryCount + 1}...`);
        this.setState({ hasError: false });
      }, 2000);
    }
  }

  render() {
    if (this.state.hasError) {
      // Capture the error in devtools/console but don't render a fallback
      // This surfaces the error but doesn't show a mesh fallback that might confuse users
      console.error(this.state.error);
      return null;
    }

    // Clone the children with a dynamic key for retry forcing if needed
    return React.cloneElement(this.props.children as React.ReactElement, {
      key: `scene-${this.state.retryCount}`
    });
  }
}
