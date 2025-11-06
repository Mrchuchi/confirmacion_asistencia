import React, { useState } from 'react';
import type { SearchResponse } from '../types';
import './SearchResults.css';

interface SearchResultsProps {
  searchResult: SearchResponse;
  onConfirmarAsistencia: (invitadoId: number, acompanantesIds: number[]) => void;
  isConfirming: boolean;
}

export const SearchResults: React.FC<SearchResultsProps> = ({
  searchResult,
  onConfirmarAsistencia,
  isConfirming
}) => {
  const [selectedAcompanantes, setSelectedAcompanantes] = useState<number[]>([]);
  const { invitado, total_personas, asistencia_confirmada } = searchResult;

  const handleAcompananteToggle = (acompananteId: number) => {
    setSelectedAcompanantes(prev => 
      prev.includes(acompananteId)
        ? prev.filter(id => id !== acompananteId)
        : [...prev, acompananteId]
    );
  };

  const handleConfirmar = () => {
    onConfirmarAsistencia(invitado.id, selectedAcompanantes);
  };

  const canConfirm = !invitado.estado_asistencia || selectedAcompanantes.length > 0;

  return (
    <div className="search-results-container">
      <div className="results-header">
        <h3>Información del Invitado</h3>
        <div className="status-badge">
          {asistencia_confirmada ? (
            <span className="status confirmed">✓ Asistencia Confirmada</span>
          ) : (
            <span className="status pending">⏱ Pendiente de Confirmación</span>
          )}
        </div>
      </div>

      {/* Información del invitado principal */}
      <div className="invitado-card">
        <div className="person-info">
          <div className="person-header">
            <h4>👤 Invitado Principal</h4>
            {invitado.estado_asistencia && (
              <span className="attendance-status confirmed">✓ Confirmado</span>
            )}
          </div>
          <div className="person-details">
            <p><strong>Nombre:</strong> {invitado.nombre}</p>
            <p><strong>Cédula:</strong> {invitado.cedula}</p>
            {invitado.campana_area && (
              <p><strong>Campaña/Área:</strong> {invitado.campana_area}</p>
            )}
            {invitado.eps && (
              <p><strong>EPS:</strong> {invitado.eps}</p>
            )}
            {invitado.sede && (
              <p><strong>Sede:</strong> {invitado.sede}</p>
            )}
          </div>
        </div>
      </div>

      {/* Lista de acompañantes */}
      {invitado.acompanantes.length > 0 && (
        <div className="acompanantes-section">
          <h4>👥 Acompañantes ({invitado.acompanantes.length})</h4>
          <div className="acompanantes-list">
            {invitado.acompanantes.map((acompanante) => (
              <div key={acompanante.id} className="acompanante-card">
                <div className="person-info">
                  <div className="person-details">
                    <p><strong>Nombre:</strong> {acompanante.nombre}</p>
                    <p><strong>Cédula:</strong> {acompanante.cedula}</p>
                    {acompanante.edad && (
                      <p><strong>Edad:</strong> {acompanante.edad} años</p>
                    )}
                    {acompanante.parentesco && (
                      <p><strong>Parentesco:</strong> {acompanante.parentesco}</p>
                    )}
                    {acompanante.eps && (
                      <p><strong>EPS:</strong> {acompanante.eps}</p>
                    )}
                  </div>
                  <div className="acompanante-actions">
                    {acompanante.estado_asistencia ? (
                      <span className="attendance-status confirmed">✓ Confirmado</span>
                    ) : (
                      <label className="checkbox-container">
                        <input
                          type="checkbox"
                          checked={selectedAcompanantes.includes(acompanante.id)}
                          onChange={() => handleAcompananteToggle(acompanante.id)}
                          disabled={isConfirming}
                        />
                        <span className="checkmark"></span>
                        Confirmar asistencia
                      </label>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Resumen */}
      <div className="summary-section">
        <div className="summary-card">
          <h4>📊 Resumen</h4>
          <div className="summary-stats">
            <div className="stat">
              <span className="stat-label">Total de personas:</span>
              <span className="stat-value">{total_personas}</span>
            </div>
            <div className="stat">
              <span className="stat-label">Pendientes de confirmar:</span>
              <span className="stat-value">
                {!invitado.estado_asistencia ? 1 : 0} + {selectedAcompanantes.length}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Botón de confirmación */}
      {canConfirm && (
        <div className="confirmation-section">
          <button
            onClick={handleConfirmar}
            disabled={isConfirming}
            className="confirm-button"
          >
            {isConfirming ? (
              <>⏳ Confirmando...</>
            ) : (
              <>✓ Confirmar Asistencia</>
            )}
          </button>
        </div>
      )}
    </div>
  );
};
