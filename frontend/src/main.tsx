import React, { Component, type ReactNode } from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles/globals.css';

class ErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean }> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-gray-950 via-purple-950 to-black text-white flex items-center justify-center p-8">
          <div className="text-center max-w-md">
            <h1 className="text-3xl font-bold mb-4">¡Ups! Algo salió mal</h1>
            <p className="text-gray-400 mb-6">Ocurrió un error inesperado. Recarga la página para continuar.</p>
            <button
              onClick={() => window.location.reload()}
              className="px-8 py-3 bg-gradient-to-r from-cyan-600 to-purple-600 rounded-2xl text-lg font-semibold shadow-lg hover:opacity-90"
            >
              Recargar
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);