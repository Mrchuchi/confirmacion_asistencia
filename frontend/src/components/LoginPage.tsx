import React, { useState } from 'react';
import { useAuth } from '../hooks/authContext';
import './LoginPage.css';

export const LoginPage: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const { login, isLoading, error } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (username && password) {
      try {
        await login(username, password);
      } catch (err) {
        // El error ya se maneja en el hook useAuth
        console.error('Error en login:', err);
      }
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <div className="login-logos">
            <div className="logo-section">
              <img 
                src="/images/logo_andesbpo.png" 
                alt="AndesBPO Logo" 
                className="andesbpo-logo"
              />
            </div>
            <div className="separator-line"></div>
            <div className="tribal-section">
              <img 
                src="/images/tribal.png" 
                alt="Tribal Mask" 
                className="tribal-mask"
              />
            </div>
          </div>
          <h2>Sistema de Confirmación de Asistencia</h2>
          <p>Ingresa con tus credenciales para acceder al sistema</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="username">Usuario:</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Ingresa tu usuario"
              required
              disabled={isLoading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Contraseña:</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Ingresa tu contraseña"
              required
              disabled={isLoading}
            />
          </div>

          {error && (
            <div className="error-message">
              <span className="error-icon">❌</span>
              {error}
            </div>
          )}

          <button
            type="submit"
            className="login-button"
            disabled={isLoading || !username || !password}
          >
            {isLoading ? (
              <>
                <span className="spinner"></span>
                Iniciando Sesión...
              </>
            ) : (
              <>
                🔐 Iniciar Sesión
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
