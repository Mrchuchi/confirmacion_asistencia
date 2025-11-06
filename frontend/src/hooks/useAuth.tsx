import { useState, useEffect, createContext, useContext } from 'react';
import type { ReactNode } from 'react';
import { AsistenciaService } from '../services/api';
import { showErrorAlert, showToast } from '../utils/sweetAlert';
import LoadingScreen from '../components/LoadingScreen';

interface User {
  id: number;
  username: string;
  nombre_completo: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
  error: string | null;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Cargar token del localStorage al iniciar
  useEffect(() => {
    const savedToken = localStorage.getItem('auth_token');
    if (savedToken) {
      setToken(savedToken);
      verifyToken(savedToken);
    } else {
      setIsInitialized(true);
    }
  }, []);

  const verifyToken = async (authToken: string) => {
    try {
      const userInfo = await AsistenciaService.verifyToken(authToken);
      setUser(userInfo);
      setToken(authToken);
    } catch {
      // Token inválido, limpiar localStorage
      localStorage.removeItem('auth_token');
      setToken(null);
      setUser(null);
    } finally {
      setIsInitialized(true);
    }
  };

  const login = async (username: string, password: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await AsistenciaService.login(username, password);
      const { access_token } = response;
      
      // Guardar token
      localStorage.setItem('auth_token', access_token);
      setToken(access_token);
      
      // Obtener información del usuario
      const userInfo = await AsistenciaService.getCurrentUser(access_token);
      setUser(userInfo);
      
      showToast(`¡Bienvenido, ${userInfo.nombre_completo}!`, 'success');
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error de autenticación';
      setError(errorMessage);
      showErrorAlert(
        'Error de inicio de sesión',
        errorMessage
      );
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('auth_token');
    setToken(null);
    setUser(null);
    setError(null);
    
    showToast('Sesión cerrada correctamente', 'success');
  };

  const value: AuthContextType = {
    user,
    token,
    login,
    logout,
    isLoading,
    error,
    isAuthenticated: !!user && !!token
  };

  // No renderizar hasta que se verifique el token inicial
  if (!isInitialized) {
    return <LoadingScreen />;
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
