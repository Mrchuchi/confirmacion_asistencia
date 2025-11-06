import { useState, useEffect } from 'react';
import { AsistenciaService } from '../services/api';
import { ErrorMessage } from '../components/ErrorMessage';
import { ImportExcel } from '../components/ImportExcel';
import type { AsistenciaStats, Invitado } from '../types';
import './ListaInvitadosPage.css';

export const ListaInvitadosPage = () => {
  const [invitados, setInvitados] = useState<Invitado[]>([]);
  const [stats, setStats] = useState<AsistenciaStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filtro, setFiltro] = useState<'todos' | 'confirmados' | 'pendientes'>('todos');
  const [busqueda, setBusqueda] = useState('');
  const [paginaActual, setPaginaActual] = useState(1);
  const itemsPorPagina = 5;

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Cargar estadísticas y invitados en paralelo
      const [statsData, invitadosData] = await Promise.all([
        AsistenciaService.getStats(),
        AsistenciaService.getAllInvitados()
      ]);
      
      setStats(statsData);
      setInvitados(invitadosData);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar datos');
    } finally {
      setIsLoading(false);
    }
  };

  const invitadosFiltrados = invitados.filter(invitado => {
    // Filtro por estado
    if (filtro === 'confirmados' && !invitado.estado_asistencia) return false;
    if (filtro === 'pendientes' && invitado.estado_asistencia) return false;
    
    // Filtro por búsqueda
    if (busqueda.trim()) {
      const termino = busqueda.toLowerCase();
      return (
        invitado.nombre.toLowerCase().includes(termino) ||
        invitado.cedula.includes(termino)
      );
    }
    
    return true;
  });

  // Lógica de paginación
  const totalPaginas = Math.ceil(invitadosFiltrados.length / itemsPorPagina);
  const indiceInicio = (paginaActual - 1) * itemsPorPagina;
  const indiceFin = indiceInicio + itemsPorPagina;
  const invitadosPaginados = invitadosFiltrados.slice(indiceInicio, indiceFin);

  const cambiarPagina = (nuevaPagina: number) => {
    setPaginaActual(nuevaPagina);
  };

  const irPaginaAnterior = () => {
    if (paginaActual > 1) {
      setPaginaActual(paginaActual - 1);
    }
  };

  const irPaginaSiguiente = () => {
    if (paginaActual < totalPaginas) {
      setPaginaActual(paginaActual + 1);
    }
  };

  // Reset página cuando cambian los filtros
  useEffect(() => {
    setPaginaActual(1);
  }, [filtro, busqueda]);

  const clearError = () => setError(null);

  return (
    <div className="lista-invitados-page">
      <div className="page-header">
        <h2>⚊ Lista de Invitados</h2>
      </div>

      <div className="page-content">
        {error && (
          <ErrorMessage 
            message={error} 
            onClose={clearError}
          />
        )}

        {/* Estadísticas */}
        {stats && (
          <div className="stats-section">
            <h2>● Estadísticas del Evento</h2>
            
            {/* Resumen General */}
            <div className="stats-summary">
              <div className="summary-card total">
                <div className="summary-icon">◉</div>
                <div className="summary-content">
                  <div className="summary-number">{stats.total_personas}</div>
                  <div className="summary-label">Total Registradas</div>
                </div>
              </div>
              
              <div className="summary-card confirmed">
                <div className="summary-icon">✓</div>
                <div className="summary-content">
                  <div className="summary-number">{stats.personas_confirmadas}</div>
                  <div className="summary-label">Confirmadas</div>
                </div>
              </div>
              
              <div className="summary-card pending">
                <div className="summary-icon">○</div>
                <div className="summary-content">
                  <div className="summary-number">{stats.total_personas - stats.personas_confirmadas}</div>
                  <div className="summary-label">Pendientes</div>
                </div>
              </div>
              
              <div className="summary-card percentage">
                <div className="summary-icon">%</div>
                <div className="summary-content">
                  <div className="summary-number">
                    {stats.total_personas > 0 ? Math.round((stats.personas_confirmadas / stats.total_personas) * 100) : 0}%
                  </div>
                  <div className="summary-label">Confirmación</div>
                </div>
              </div>
            </div>

            {/* Desglose Detallado */}
            <div className="stats-detail">
              <div className="detail-section">
                <h3>◉ Invitados Principales</h3>
                <div className="detail-grid">
                  <div className="detail-card">
                    <div className="detail-number">{stats.total_invitados}</div>
                    <div className="detail-label">Total</div>
                  </div>
                  <div className="detail-card confirmed">
                    <div className="detail-number">{stats.invitados_confirmados}</div>
                    <div className="detail-label">Confirmados</div>
                  </div>
                  <div className="detail-card pending">
                    <div className="detail-number">{stats.total_invitados - stats.invitados_confirmados}</div>
                    <div className="detail-label">Pendientes</div>
                  </div>
                  <div className="detail-card percentage">
                    <div className="detail-number">
                      {stats.total_invitados > 0 ? Math.round((stats.invitados_confirmados / stats.total_invitados) * 100) : 0}%
                    </div>
                    <div className="detail-label">Confirmación</div>
                  </div>
                </div>
              </div>

              <div className="detail-section">
                <h3>● Acompañantes</h3>
                <div className="detail-grid">
                  <div className="detail-card">
                    <div className="detail-number">{stats.total_acompanantes}</div>
                    <div className="detail-label">Total</div>
                  </div>
                  <div className="detail-card confirmed">
                    <div className="detail-number">{stats.acompanantes_confirmados}</div>
                    <div className="detail-label">Confirmados</div>
                  </div>
                  <div className="detail-card pending">
                    <div className="detail-number">{stats.total_acompanantes - stats.acompanantes_confirmados}</div>
                    <div className="detail-label">Pendientes</div>
                  </div>
                  <div className="detail-card percentage">
                    <div className="detail-number">
                      {stats.total_acompanantes > 0 ? Math.round((stats.acompanantes_confirmados / stats.total_acompanantes) * 100) : 0}%
                    </div>
                    <div className="detail-label">Confirmación</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Importación de Excel */}
        <ImportExcel onImportComplete={cargarDatos} />

        {/* Controles de filtro y búsqueda */}
        <div className="controls-section">
          <div className="search-control">
            <input
              type="text"
              placeholder="Buscar por nombre o cédula..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="search-input"
            />
          </div>
          
          <div className="filter-controls">
            <button
              onClick={() => setFiltro('todos')}
              className={`filter-button ${filtro === 'todos' ? 'active' : ''}`}
            >
              Todos
            </button>
            <button
              onClick={() => setFiltro('confirmados')}
              className={`filter-button ${filtro === 'confirmados' ? 'active' : ''}`}
            >
              Confirmados
            </button>
            <button
              onClick={() => setFiltro('pendientes')}
              className={`filter-button ${filtro === 'pendientes' ? 'active' : ''}`}
            >
              Pendientes
            </button>
          </div>
        </div>

        {/* Lista de invitados */}
        {isLoading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Cargando lista de invitados...</p>
          </div>
        ) : (
          <div className="invitados-section">
            <div className="section-header">
              <h2>◉ Invitados ({invitadosFiltrados.length})</h2>
              <button onClick={cargarDatos} className="refresh-button">
                ↻ Actualizar
              </button>
            </div>
            
            {invitadosPaginados.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">○</div>
                <h3>No se encontraron invitados</h3>
                <p>Intenta cambiar los filtros de búsqueda</p>
              </div>
            ) : (
              <div className="table-container">
                <table className="invitados-table">
                  <thead>
                    <tr>
                      <th>◉ Invitado Principal</th>
                      <th>⚊ Cédula</th>
                      <th>● Acompañantes</th>
                      <th>✓ Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invitadosPaginados.map((invitado) => (
                      <tr key={invitado.id} className="invitado-row">
                        <td className="invitado-name-cell">
                          <div className="name-container">
                            <span className="name">{invitado.nombre}</span>
                          </div>
                        </td>
                        
                        <td className="cedula-cell">
                          <span className="cedula-badge">{invitado.cedula}</span>
                        </td>
                        
                        <td className="acompanantes-cell">
                          {invitado.acompanantes.length > 0 ? (
                            <div className="acompanantes-container">
                              <div className="acompanantes-count">
                                {invitado.acompanantes.length} acompañante{invitado.acompanantes.length !== 1 ? 's' : ''}
                              </div>
                              <div className="acompanantes-preview">
                                {invitado.acompanantes.map((acomp) => (
                                  <div key={acomp.id} className="acompanante-preview">
                                    <span className="acompanante-name">{acomp.nombre}</span>
                                    <span className={`acompanante-status ${acomp.estado_asistencia ? 'confirmed' : 'pending'}`}>
                                      {acomp.estado_asistencia ? '✓' : '○'}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ) : (
                            <span className="no-acompanantes">Sin acompañantes</span>
                          )}
                        </td>
                        
                        <td className="estado-cell">
                          <span className={`estado-badge ${invitado.estado_asistencia ? 'confirmado' : 'pendiente'}`}>
                            {invitado.estado_asistencia ? '✓ Confirmado' : '○ Pendiente'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                
                {/* Paginación */}
                {invitadosFiltrados.length > 0 && totalPaginas > 1 && (
                  <div className="pagination-container">
                    <div className="pagination-info">
                      Mostrando {indiceInicio + 1}-{Math.min(indiceFin, invitadosFiltrados.length)} de {invitadosFiltrados.length} invitados
                    </div>
                    
                    <div className="pagination-controls">
                      <button
                        onClick={irPaginaAnterior}
                        disabled={paginaActual === 1}
                        className="pagination-btn"
                        title="Página anterior"
                      >
                        ←
                      </button>
                      
                      <div className="page-numbers">
                        {Array.from({ length: totalPaginas }, (_, index) => (
                          <button
                            key={index + 1}
                            onClick={() => cambiarPagina(index + 1)}
                            className={`pagination-btn ${paginaActual === index + 1 ? 'active' : ''}`}
                          >
                            {index + 1}
                          </button>
                        ))}
                      </div>
                      
                      <button
                        onClick={irPaginaSiguiente}
                        disabled={paginaActual === totalPaginas}
                        className="pagination-btn"
                        title="Página siguiente"
                      >
                        →
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
