import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  errorLog: string;
}

export class OMNIXErrorTracker extends Component<Props, State> {
  public state: State = {
    hasError: false,
    errorLog: ''
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, errorLog: error.message };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('--- OMNIX SYSTEM ERROR DETECTED ---');
    console.error('Error:', error);
    console.error('Component Stack:', errorInfo.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '20px', backgroundColor: '#0f0f1a', color: '#ff0055', fontFamily: 'monospace', border: '2px solid #ff0055', borderRadius: '8px', margin: '20px' }}>
          <h2>🚨 OMNIX Core System Warning</h2>
          <p>A UI component failed to load securely.</p>
          <pre style={{ backgroundColor: '#000', padding: '10px', color: '#00ffcc' }}>{this.state.errorLog}</pre>
          <button onClick={() => window.location.reload()} style={{ backgroundColor: '#ff0055', color: '#fff', border: 'none', padding: '10px 20px', cursor: 'pointer', fontWeight: 'bold' }}>
            Restart Component Engine
          </button>
        </div>
      );
    }

    return this.children;
  }
}

export default OMNIXErrorTracker;
