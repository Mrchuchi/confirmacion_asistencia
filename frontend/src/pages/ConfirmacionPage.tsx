import { useState, useEffect } from 'react';
import { SearchForm } from '../components/SearchForm';
import { SearchResults } from '../components/SearchResults';
import { ErrorMessage } from '../components/ErrorMessage';
import { SuccessMessage } from '../components/SuccessMessage';
import { AgregarPersonas } from '../components/AgregarPersonas';
import { useAsistencia } from '../hooks/useAsistencia';
import { showSuccessAlert, showErrorAlert } from '../utils/sweetAlert';
import './ConfirmacionPage.css';

export const ConfirmacionPage = () => {
  const {
    searchResult,
    isLoading,
    error,
    isConfirming,
    searchInvitado,
    confirmarAsistencia,
    clearSearch,
    clearError
  } = useAsistencia();

  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    modo: 'invitado' | 'acompanante';
    invitadoId?: number;
    invitadoNombre?: string;
  }>({
    isOpen: false,
    modo: 'invitado'
  });

  // Auto-limpiar mensaje de éxito después de 5 segundos
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  const handleSearch = (query: string) => {
    setSuccessMessage(null);
    searchInvitado(query);
  };

  const handleConfirmarAsistencia = async (invitadoId: number, acompanantesIds: number[]) => {
    const result = await confirmarAsistencia({
      invitado_id: invitadoId,
      acompanantes_ids: acompanantesIds
    });

    if (result && result.success) {
      setSuccessMessage(result.message);
      showSuccessAlert(
        '¡Asistencia confirmada!',
        result.message
      );
      
      // Refrescar los datos para mostrar el estado actualizado
      if (searchResult) {
        searchInvitado(searchResult.invitado.cedula);
      }
    } else if (error) {
      showErrorAlert(
        'Error en confirmación',
        error
      );
    }
  };

  const openModal = (modo: 'invitado' | 'acompanante', invitadoId?: number, invitadoNombre?: string) => {
    setModalState({
      isOpen: true,
      modo,
      invitadoId,
      invitadoNombre
    });
  };

  const closeModal = () => {
    setModalState({
      isOpen: false,
      modo: 'invitado'
    });
  };

  const handleModalSuccess = (message: string) => {
    setSuccessMessage(message);
    showSuccessAlert(
      '¡Persona agregada!',
      message
    );
    
    // Refrescar búsqueda si hay resultados activos
    if (searchResult) {
      searchInvitado(searchResult.invitado.cedula);
    }
  };

  const handleClear = () => {
    clearSearch();
    setSuccessMessage(null);
  };

  return (
    <div className="confirmacion-page">
      <div className="page-header">
        <h2 className="text-responsive">✓ Confirmación de Asistencia</h2>
      </div>

      <div className="page-content">
        {/* Mensajes */}
        {error && (
          <ErrorMessage 
            message={error} 
            onClose={clearError}
          />
        )}
        
        {successMessage && (
          <SuccessMessage 
            message={successMessage}
            onClose={() => setSuccessMessage(null)}
          />
        )}

        {/* Acciones rápidas arriba del contenedor */}
        <div className="quick-actions-top">
          <div className="quick-actions-buttons">
            <button
              onClick={() => openModal('invitado')}
              className="action-btn add-guest"
            >
              <span className="btn-icon">+</span>
              <span className="btn-text">Agregar Invitado Nuevo</span>
            </button>

            {searchResult && (
              <button
                onClick={() => openModal(
                  'acompanante', 
                  searchResult.invitado.id, 
                  searchResult.invitado.nombre
                )}
                className="action-btn add-companion"
              >
                <span className="btn-icon">+</span>
                <span className="btn-text">Agregar Acompañante Extra</span>
              </button>
            )}
          </div>
        </div>

        {/* Formulario de búsqueda */}
        <SearchForm 
          onSearch={handleSearch}
          isLoading={isLoading}
          onClear={handleClear}
        />

        {/* Resultados de búsqueda */}
        {searchResult && (
          <SearchResults
            searchResult={searchResult}
            onConfirmarAsistencia={handleConfirmarAsistencia}
            isConfirming={isConfirming}
          />
        )}

        {/* Estado de carga */}
        {isLoading && (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Buscando invitado...</p>
          </div>
        )}
      </div>

      {/* Modal para agregar personas */}
      <AgregarPersonas
        isOpen={modalState.isOpen}
        onClose={closeModal}
        onSuccess={handleModalSuccess}
        modo={modalState.modo}
        invitadoId={modalState.invitadoId}
        invitadoNombre={modalState.invitadoNombre}
      />
    </div>
  );
};
