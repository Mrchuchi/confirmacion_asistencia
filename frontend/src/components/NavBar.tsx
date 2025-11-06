import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/authContext';
import { showConfirmAlert } from '../utils/sweetAlert';
import './NavBar.css';

export const NavBar: React.FC = () => {
  const location = useLocation();
  const { user, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-brand">
          <Link to="/" className="brand-link" onClick={closeMobileMenu}>
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
        
        {/* Hamburger menu button - visible only on mobile */}
        <button 
          className="mobile-menu-toggle"
          onClick={toggleMobileMenu}
          aria-label="Toggle menu"
        >
          <span className="hamburger-line"></span>
          <span className="hamburger-line"></span>
          <span className="hamburger-line"></span>
        </button>
        
        <div className={`navbar-menu ${isMobileMenuOpen ? 'mobile-menu-open' : ''}`}>
          <Link 
            to="/confirmacion" 
            className={`navbar-item ${isActive('/confirmacion') || isActive('/') ? 'active' : ''}`}
            onClick={closeMobileMenu}
          >
            <span className="navbar-icon">✓</span>
            Confirmación
          </Link>
          
          <Link 
            to="/lista-invitados" 
            className={`navbar-item ${isActive('/lista-invitados') ? 'active' : ''}`}
            onClick={closeMobileMenu}
          >
            <span className="navbar-icon">⚊</span>
            Lista de Invitados
          </Link>

          <Link 
            to="/usuarios" 
            className={`navbar-item ${isActive('/usuarios') ? 'active' : ''}`}
            onClick={closeMobileMenu}
          >
            <span className="navbar-icon">◉</span>
            Usuarios
          </Link>

          {/* Botón de cerrar sesión en móvil */}
          <div className="navbar-item mobile-logout">
            <button 
              onClick={() => {
                closeMobileMenu();
                handleLogout();
              }}
              className="mobile-logout-button"
            >
              <span className="navbar-icon">⏻</span>
              Cerrar Sesión
            </button>
          </div>
        </div>

        <div className="navbar-user">
          <span className="user-info">
            <span className="user-icon">⚹</span>
            <span className="user-name-mobile">{user?.nombre_completo}</span>
          </span>
          <button 
            onClick={handleLogout}
            className="logout-button"
            title="Cerrar sesión"
          >
            <span className="logout-icon">⏻</span>
            <span className="logout-text-mobile">Cerrar sesión</span>
          </button>
        </div>
      </div>
      
      {/* Mobile menu overlay */}
      {isMobileMenuOpen && (
        <div className="mobile-menu-overlay" onClick={closeMobileMenu}></div>
      )}
    </nav>
  );
};
