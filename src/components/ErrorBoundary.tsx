import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<any, any> {
  public state: any;
  public props: any;

  constructor(props: any) {
    super(props);
    this.state = {
      hasError: false,
      error: null
    };
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="p-8 bg-destructive/10 border border-destructive/20 rounded-2xl text-center space-y-4">
          <h2 className="text-2xl font-black text-destructive uppercase tracking-tighter">ALGO SALIÓ MAL</h2>
          <p className="text-on-surface-variant text-sm font-medium">
            Ha ocurrido un error inesperado. Intenta recargar la página.
          </p>
          <pre className="text-[10px] bg-background p-4 rounded-lg overflow-auto max-h-40 text-left opacity-50">
            {this.state.error?.message}
          </pre>
          <button 
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-primary text-background font-black rounded-full text-xs uppercase tracking-widest"
          >
            RECARGAR
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
