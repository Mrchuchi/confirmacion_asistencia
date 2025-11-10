import axios from 'axios';
import type { SearchResponse, ConfirmarAsistenciaRequest, ConfirmarAsistenciaResponse, AsistenciaStats, Invitado, Usuario } from '../types';

// Configuración base de axios
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para manejo de errores
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error);
    return Promise.reject(error);
  }
);

export class AsistenciaService {
  /**
   * Busca un invitado por cédula o nombre
   */
  static async searchInvitado(query: string): Promise<SearchResponse> {
    try {
      const response = await apiClient.get<SearchResponse>('/api/v1/search', {
        params: { query: query.trim() }
      });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        throw new Error('No se encontró ningún invitado con los criterios especificados');
      }
      throw new Error('Error al buscar invitado. Por favor, inténtelo nuevamente.');
    }
  }

  /**
   * Confirma la asistencia del invitado y sus acompañantes
   */
  static async confirmarAsistencia(request: ConfirmarAsistenciaRequest): Promise<ConfirmarAsistenciaResponse> {
    try {
      const response = await apiClient.post<ConfirmarAsistenciaResponse>('/api/v1/confirmar_asistencia', request);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.data?.detail) {
        throw new Error(error.response.data.detail);
      }
      throw new Error('Error al confirmar asistencia. Por favor, inténtelo nuevamente.');
    }
  }

  /**
   * Obtiene estadísticas de asistencia
   */
  static async getStats(): Promise<AsistenciaStats> {
    try {
      const response = await apiClient.get<AsistenciaStats>('/api/v1/stats');
      return response.data;
    } catch {
      throw new Error('Error al obtener estadísticas.');
    }
  }

  /**
   * Obtiene la lista completa de invitados
   */
  static async getAllInvitados(): Promise<Invitado[]> {
    try {
      const response = await apiClient.get('/api/v1/invitados');
      return response.data;
    } catch (error) {
      console.error('Error getting invitados:', error);
      throw new Error('Error al obtener la lista de invitados.');
    }
  }

  /**
   * Importa invitados desde un archivo Excel
   */
  static async importExcel(file: File): Promise<{ message: string; invitados_creados: number; acompanantes_creados: number }> {
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await apiClient.post('/import/import-excel', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.data?.detail) {
        throw new Error(error.response.data.detail);
      }
      throw new Error('Error al importar el archivo Excel.');
    }
  }

  /**
   * Descarga la plantilla Excel para importación
   */
  static async downloadTemplate(): Promise<Blob> {
    try {
      const response = await apiClient.get('/import/export-template', {
        responseType: 'blob',
      });
      return response.data;
    } catch {
      throw new Error('Error al descargar la plantilla.');
    }
  }

  /**
   * Agrega un invitado nuevo al momento
   */
  static async agregarInvitadoRapido(data: {
    nombre: string;
    cedula: string;
  }): Promise<{ success: boolean; message: string; invitado: { id: number; nombre: string; cedula: string } }> {
    try {
      const response = await apiClient.post('/api/v1/agregar-invitado-rapido', null, {
        params: data
      });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.data?.detail) {
        throw new Error(error.response.data.detail);
      }
      throw new Error('Error al agregar el invitado.');
    }
  }

  /**
   * Agrega un acompañante extra a un invitado existente
   */
  static async agregarAcompananteExtra(data: {
    invitadoId: number;
    nombre: string;
    cedula: string;
    edad?: number;
    parentesco?: string;
    eps?: string;
  }): Promise<{ success: boolean; message: string; acompanante: { id: number; nombre: string; invitado_id: number } }> {
    try {
      const response = await apiClient.post('/api/v1/agregar-acompanante-extra', null, {
        params: {
          invitado_id: data.invitadoId,
          nombre_acompanante: data.nombre,
          cedula_acompanante: data.cedula,
          edad_acompanante: data.edad,
          parentesco_acompanante: data.parentesco,
          eps_acompanante: data.eps
        }
      });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.data?.detail) {
        throw new Error(error.response.data.detail);
      }
      throw new Error('Error al agregar el acompañante.');
    }
  }

  /**
   * Verifica el estado de la API
   */
  static async healthCheck(): Promise<{ status: string }> {
    try {
      const response = await apiClient.get('/health');
      return response.data;
    } catch {
      throw new Error('No se puede conectar con el servidor.');
    }
  }

  /**
   * Iniciar sesión
   */
  static async login(username: string, password: string): Promise<{ access_token: string; token_type: string }> {
    try {
      const response = await apiClient.post('/api/v1/auth/login', {
        username,
        password
      });
      return response.data;
    } catch (error: unknown) {
      const axiosError = error as { response?: { status?: number } };
      if (axiosError.response?.status === 401) {
        throw new Error('Usuario o contraseña incorrectos');
      }
      throw new Error('Error al iniciar sesión. Intenta nuevamente.');
    }
  }

  /**
   * Obtener información del usuario actual
   */
  static async getCurrentUser(token: string): Promise<{ id: number; username: string; nombre_completo: string }> {
    try {
      const response = await apiClient.get('/api/v1/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error: unknown) {
      const axiosError = error as { response?: { status?: number } };
      if (axiosError.response?.status === 401) {
        throw new Error('Token inválido');
      }
      throw new Error('Error al obtener información del usuario');
    }
  }

  /**
   * Verificar token
   */
  static async verifyToken(token: string): Promise<{ id: number; username: string; nombre_completo: string }> {
    try {
      const response = await apiClient.post('/api/v1/auth/verify', {}, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      return response.data.user;
    } catch (error: unknown) {
      const axiosError = error as { response?: { status?: number } };
      if (axiosError.response?.status === 401) {
        throw new Error('Token inválido');
      }
      throw new Error('Error al verificar token');
    }
  }

  /**
   * Obtener lista de usuarios
   */
  static async getUsuarios(token: string): Promise<Usuario[]> {
    try {
      const response = await apiClient.get('/api/v1/usuarios/', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error: unknown) {
      const axiosError = error as { response?: { status?: number } };
      if (axiosError.response?.status === 401) {
        throw new Error('No tienes permisos para ver usuarios');
      }
      throw new Error('Error al obtener usuarios');
    }
  }

  /**
   * Crear nuevo usuario
   */
  static async createUsuario(token: string, usuario: { username: string; password: string; nombre_completo: string }): Promise<Usuario> {
    try {
      const response = await apiClient.post('/api/v1/usuarios/', usuario, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error: unknown) {
      const axiosError = error as { response?: { status?: number, data?: { detail?: string } } };
      if (axiosError.response?.status === 400) {
        throw new Error(axiosError.response.data?.detail || 'Error al crear usuario');
      }
      if (axiosError.response?.status === 401) {
        throw new Error('No tienes permisos para crear usuarios');
      }
      throw new Error('Error al crear usuario');
    }
  }

  /**
   * Actualizar usuario
   */
  static async updateUsuario(token: string, id: number, usuario: { username?: string; password?: string; nombre_completo?: string }): Promise<Usuario> {
    try {
      const response = await apiClient.put(`/api/v1/usuarios/${id}`, usuario, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error: unknown) {
      const axiosError = error as { response?: { status?: number, data?: { detail?: string } } };
      if (axiosError.response?.status === 400) {
        throw new Error(axiosError.response.data?.detail || 'Error al actualizar usuario');
      }
      if (axiosError.response?.status === 401) {
        throw new Error('No tienes permisos para actualizar usuarios');
      }
      if (axiosError.response?.status === 404) {
        throw new Error('Usuario no encontrado');
      }
      throw new Error('Error al actualizar usuario');
    }
  }

  /**
   * Eliminar usuario
   */
  static async deleteUsuario(token: string, id: number): Promise<void> {
    try {
      await apiClient.delete(`/api/v1/usuarios/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
    } catch (error: unknown) {
      const axiosError = error as { response?: { status?: number, data?: { detail?: string } } };
      if (axiosError.response?.status === 400) {
        throw new Error(axiosError.response.data?.detail || 'Error al eliminar usuario');
      }
      if (axiosError.response?.status === 401) {
        throw new Error('No tienes permisos para eliminar usuarios');
      }
      if (axiosError.response?.status === 404) {
        throw new Error('Usuario no encontrado');
      }
      throw new Error('Error al eliminar usuario');
    }
  }
}

export default AsistenciaService;
