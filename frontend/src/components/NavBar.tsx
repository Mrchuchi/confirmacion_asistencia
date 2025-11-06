import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/authContext';
import { showConfirmAlert } from '../utils/sweetAlert';
import './NavBar.css';

export const NavBar: React.FC = () => {
  const location = useLocation();
  const { user, logout } = useAuth();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const handleLogout = async () => {
    const confirmed = await showConfirmAlert(
      '¿Cerrar sesión?',
      'Tu sesión actual se cerrará y tendrás que iniciar sesión nuevamente.',
      'Sí, cerrar sesión',
      'Cancelar'
    );
    
    if (confirmed) {
      logout();
    }
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-brand">
          <Link to="/" className="brand-link">
            <div className="navbar-logos">
              <img 
                src="/images/logo_andesbpo_blanco.png" 
                alt="AndesBPO Logo" 
                className="navbar-andesbpo-logo"
              />
              <div className="navbar-separator-line"></div>
              <img 
                src="/images/tribal.png" 
                alt="Tribal Mask" 
                className="navbar-tribal-mask"
              />
            </div>
          </Link>
        </div>
        
        <div className="navbar-menu">
          <Link 
            to="/confirmacion" 
            className={`navbar-item ${isActive('/confirmacion') || isActive('/') ? 'active' : ''}`}
          >
            <span className="navbar-icon">✓</span>
            Confirmación
          </Link>
          
          <Link 
            to="/lista-invitados" 
            className={`navbar-item ${isActive('/lista-invitados') ? 'active' : ''}`}
          >
            <span className="navbar-icon">⚊</span>
            Lista de Invitados
          </Link>

          <Link 
            to="/usuarios" 
            className={`navbar-item ${isActive('/usuarios') ? 'active' : ''}`}
          >
            <span className="navbar-icon">◉</span>
            Usuarios
          </Link>
        </div>

        <div className="navbar-user">
          <span className="user-info">
            <span className="user-icon">⚹</span>
            {user?.nombre_completo}
          </span>
          <button 
            onClick={handleLogout}
            className="logout-button"
            title="Cerrar sesión"
          >
            <span className="logout-icon">⏻</span>
            Cerrar sesión
          </button>
        </div>
      </div>
    </nav>
  );
};
