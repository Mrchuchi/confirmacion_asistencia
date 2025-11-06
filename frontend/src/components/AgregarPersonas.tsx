import React, { useState } from 'react';
import { AsistenciaService } from '../services/api';
import { showErrorAlert } from '../utils/sweetAlert';
import './AgregarPersonas.css';

interface AgregarPersonasProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (message: string) => void;
  modo: 'invitado' | 'acompanante';
  invitadoId?: number;
  invitadoNombre?: string;
}

export const AgregarPersonas: React.FC<AgregarPersonasProps> = ({
  isOpen,
  onClose,
  onSuccess,
  modo,
  invitadoId,
  invitadoNombre
}) => {
  const [formData, setFormData] = useState({
    nombre: '',
    cedula: '',
    campana_area: '',
    eps: '',
    sede: '',
    edad: '',
    parentesco: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      if (modo === 'invitado') {
        const result = await AsistenciaService.agregarInvitadoRapido({
          nombre: formData.nombre,
          cedula: formData.cedula
        });
        onSuccess(result.message);
      } else if (modo === 'acompanante' && invitadoId) {
        const result = await AsistenciaService.agregarAcompananteExtra({
          invitadoId,
          nombre: formData.nombre,
          cedula: formData.cedula,
          edad: formData.edad ? parseInt(formData.edad) : undefined,
          parentesco: formData.parentesco || undefined,
          eps: formData.eps || undefined
        });
        onSuccess(result.message);
      }
      
      // Limpiar formulario y cerrar
      setFormData({ 
        nombre: '', 
        cedula: '', 
        campana_area: '', 
        eps: '', 
        sede: '', 
        edad: '', 
        parentesco: '' 
      });
      onClose();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al agregar persona';
      setError(errorMessage);
      showErrorAlert(
        'Error al agregar persona',
        errorMessage
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleClose = () => {
    setFormData({ 
      nombre: '', 
      cedula: '', 
      campana_area: '', 
      eps: '', 
      sede: '', 
      edad: '', 
      parentesco: '' 
    });
    setError(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h3 className="text-responsive">
            {modo === 'invitado' 
              ? '+ Agregar Invitado Nuevo' 
              : `+ Agregar Acompañante Extra a ${invitadoNombre}`
            }
          </h3>
          <button
            onClick={handleClose}
            className="modal-close"
            disabled={isLoading}
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="agregar-form">
          <div className="form-group">
            <label htmlFor="nombre">
              <span className="required">*</span> Nombre Completo:
            </label>
            <input
              type="text"
              id="nombre"
              name="nombre"
              value={formData.nombre}
              onChange={handleInputChange}
              required
              placeholder="Ingresa el nombre completo"
              disabled={isLoading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="cedula">
              <span className="required">*</span> Cédula:
            </label>
            <input
              type="text"
              id="cedula"
              name="cedula"
              value={formData.cedula}
              onChange={handleInputChange}
              required
              placeholder="Número de cédula"
              disabled={isLoading}
            />
          </div>

          {modo === 'invitado' && (
            <>
              <div className="form-group">
                <label htmlFor="campana_area">Campaña/Área:</label>
                <input
                  type="text"
                  id="campana_area"
                  name="campana_area"
                  value={formData.campana_area}
                  onChange={handleInputChange}
                  placeholder="Área o campaña"
                  disabled={isLoading}
                />
              </div>

              <div className="form-group">
                <label htmlFor="eps">EPS:</label>
                <input
                  type="text"
                  id="eps"
                  name="eps"
                  value={formData.eps}
                  onChange={handleInputChange}
                  placeholder="Ej: Sanitas, Nueva EPS, Compensar, etc."
                  disabled={isLoading}
                />
              </div>

              <div className="form-group">
                <label htmlFor="sede">Sede:</label>
                <input
                  type="text"
                  id="sede"
                  name="sede"
                  value={formData.sede}
                  onChange={handleInputChange}
                  placeholder="Ej: Sede Principal, Sede Norte, etc."
                  disabled={isLoading}
                />
              </div>
            </>
          )}

          {modo === 'acompanante' && (
            <>
              <div className="form-group">
                <label htmlFor="edad">Edad:</label>
                <input
                  type="number"
                  id="edad"
                  name="edad"
                  value={formData.edad}
                  onChange={handleInputChange}
                  placeholder="Edad en años"
                  min="0"
                  max="120"
                  disabled={isLoading}
                />
              </div>

              <div className="form-group">
                <label htmlFor="parentesco">Parentesco:</label>
                <input
                  type="text"
                  id="parentesco"
                  name="parentesco"
                  value={formData.parentesco}
                  onChange={handleInputChange}
                  placeholder="Ej: Esposo/a, Hijo/a, Hermano/a, etc."
                  disabled={isLoading}
                />
              </div>

              <div className="form-group">
                <label htmlFor="eps">EPS:</label>
                <input
                  type="text"
                  id="eps"
                  name="eps"
                  value={formData.eps}
                  onChange={handleInputChange}
                  placeholder="Ej: Sanitas, Nueva EPS, Compensar, etc."
                  disabled={isLoading}
                />
              </div>
            </>
          )}

          {error && (
            <div className="error-message">
              <span className="error-icon">❌</span>
              {error}
            </div>
          )}

          <div className="form-actions">
            <button
              type="button"
              onClick={handleClose}
              className="btn-cancel"
              disabled={isLoading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="btn-submit"
              disabled={isLoading || !formData.nombre || !formData.cedula}
            >
              {isLoading ? (
                <>
                  <span className="spinner"></span>
                  {modo === 'invitado' ? 'Agregando Invitado...' : 'Agregando Acompañante...'}
                </>
              ) : (
                <>
                  <span className="btn-icon">
                    {modo === 'invitado' ? '👤' : '👥'}
                  </span>
                  {modo === 'invitado' ? 'Agregar Invitado' : 'Agregar Acompañante'}
                </>
              )}
            </button>
          </div>
        </form>

        <div className="modal-info">
          <p>
            <strong>ℹ️ Información:</strong>
            {modo === 'invitado' 
              ? ' La persona será agregada a la lista y marcada como confirmada automáticamente.'
              : ' El acompañante será agregado al invitado y marcado como confirmado automáticamente.'
            }
          </p>
        </div>
      </div>
    </div>
  );
};
