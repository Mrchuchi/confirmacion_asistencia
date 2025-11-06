import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './components/AuthProvider';
import { useAuth } from './hooks/authContext';
import { NavBar } from './components/NavBar';
import { ConfirmacionPage } from './pages/ConfirmacionPage';
import { ListaInvitadosPage } from './pages/ListaInvitadosPage';
import { UsuariosPage } from './pages/UsuariosPage';
import { LoginPage } from './components/LoginPage';
import './App.css';

// Componente que maneja las rutas protegidas
function AppRoutes() {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  return (
    <div className="app">
      <NavBar />

      <main className="app-main">
        <Routes>
          <Route path="/" element={<Navigate to="/confirmacion" replace />} />
          <Route path="/confirmacion" element={<ConfirmacionPage />} />
          <Route path="/lista-invitados" element={<ListaInvitadosPage />} />
          <Route path="/usuarios" element={<UsuariosPage />} />
        </Routes>
      </main>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}

export default App;
