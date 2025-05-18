import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error };
  }
  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
    
    // Store diagnostic information in localStorage for debugging
    try {
      localStorage.setItem('app_error_message', error.message);
      localStorage.setItem('app_error_stack', error.stack || 'No stack trace');
      localStorage.setItem('app_error_time', new Date().toISOString());
      
      // Store environment information
      const customWindow = window as Window & { ENV?: Record<string, string> };
      localStorage.setItem('app_env_available', customWindow.ENV ? 'true' : 'false');
      
      // Check if Firebase is initialized
      const firebaseInitialized = localStorage.getItem('firebase_init_status') === 'success';
      localStorage.setItem('firebase_available_at_error', firebaseInitialized ? 'true' : 'false');
    } catch (storageError) {
      console.error('Failed to store error information:', storageError);
    }
  }
  public render() {
    if (this.state.hasError) {
      // Check if we're deployed on Vercel
      const isVercel = window.location.hostname.includes('vercel.app');
      
      // Get environment information
      const customWindow = window as Window & { ENV?: Record<string, string>; ENV_INITIALIZED?: boolean };
      const envInitialized = customWindow.ENV_INITIALIZED === true;
      const firebaseInitialized = localStorage.getItem('firebase_init_status') === 'success';
      
      return this.props.fallback || (
        <div className="flex h-screen w-full flex-col items-center justify-center p-4 text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Something went wrong</h1>
          <p className="text-gray-600 mb-4">
            The application encountered an error and could not continue.
          </p>
          {this.state.error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-3 mb-4 max-w-md">
              <p className="text-sm text-red-800 font-mono whitespace-pre-wrap break-words">
                {this.state.error.message}
              </p>
            </div>
          )}
          
          {/* Diagnostic information */}
          <div className="bg-blue-50 border border-blue-200 rounded-md p-3 mb-4 max-w-md text-left">
            <h3 className="font-medium text-blue-800 mb-2">Diagnostic Information</h3>
            <ul className="text-xs text-blue-700 space-y-1">
              <li>Vercel: {isVercel ? '✅' : '❌'}</li>
              <li>Environment: {envInitialized ? '✅' : '❌'}</li>
              <li>Firebase: {firebaseInitialized ? '✅' : '❌'}</li>
              <li>Domain: {window.location.hostname}</li>
            </ul>
          </div>
          
          <div className="space-x-3">
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-healing-600 text-white rounded-md hover:bg-healing-700 transition"
            >
              Reload Page
            </button>
            
            <a 
              href="/env-check.html" 
              target="_blank"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
            >
              Diagnostic Tools
            </a>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
