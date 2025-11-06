import React from 'react';
import '../styles/LoadingScreen.css';

const LoadingScreen: React.FC = () => {
  return (
    <div className="loading-container">
      <div className="loading-background" />
      <div className="loading-card">
        <div className="loading-icon">●</div>
        <h2 className="loading-title">Cargando Sistema</h2>
        <p className="loading-subtitle">Verificando credenciales...</p>
        <div className="loading-progress-container">
          <div className="loading-progress-bar" />
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen;