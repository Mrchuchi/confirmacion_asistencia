import { useState, useCallback } from 'react';
import { AsistenciaService } from '../services/api';
import type { SearchResponse, ConfirmarAsistenciaRequest, ConfirmarAsistenciaResponse } from '../types';

interface UseAsistenciaState {
  searchResult: SearchResponse | null;
  isLoading: boolean;
  error: string | null;
  isConfirming: boolean;
}

export const useAsistencia = () => {
  const [state, setState] = useState<UseAsistenciaState>({
    searchResult: null,
    isLoading: false,
    error: null,
    isConfirming: false,
  });

  const searchInvitado = useCallback(async (query: string) => {
    if (!query.trim()) {
      setState(prev => ({ ...prev, error: 'Por favor ingrese una cédula o nombre' }));
      return;
    }

    setState(prev => ({ ...prev, isLoading: true, error: null, searchResult: null }));

    try {
      const result = await AsistenciaService.searchInvitado(query);
      setState(prev => ({ ...prev, searchResult: result, isLoading: false }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Error desconocido',
        isLoading: false,
        searchResult: null
      }));
    }
  }, []);

  const confirmarAsistencia = useCallback(async (request: ConfirmarAsistenciaRequest): Promise<ConfirmarAsistenciaResponse | null> => {
    setState(prev => ({ ...prev, isConfirming: true, error: null }));

    try {
      const result = await AsistenciaService.confirmarAsistencia(request);
      setState(prev => ({ ...prev, isConfirming: false }));
      return result;
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Error desconocido',
        isConfirming: false
      }));
      return null;
    }
  }, []);

  const clearSearch = useCallback(() => {
    setState({
      searchResult: null,
      isLoading: false,
      error: null,
      isConfirming: false,
    });
  }, []);

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  return {
    ...state,
    searchInvitado,
    confirmarAsistencia,
    clearSearch,
    clearError,
  };
};
