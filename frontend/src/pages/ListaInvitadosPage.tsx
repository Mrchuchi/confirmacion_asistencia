import { useState, useEffect } from 'react';
import { AsistenciaService } from '../services/api';
import { ErrorMessage } from '../components/ErrorMessage';
import { ImportExcel } from '../components/ImportExcel';
import { showConfirmAlert, showSuccessAlert, showErrorAlert } from '../utils/sweetAlert';
import type { AsistenciaStats, Invitado } from '../types';
import './ListaInvitadosPage.css';
import Swal from 'sweetalert2';

export const ListaInvitadosPage = () => {
  const [invitados, setInvitados] = useState<Invitado[]>([]);
  const [stats, setStats] = useState<AsistenciaStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filtro, setFiltro] = useState<'todos' | 'confirmados' | 'pendientes'>('todos');
  const [busqueda, setBusqueda] = useState('');
  const [paginaActual, setPaginaActual] = useState(1);
  const [itemsPorPagina, setItemsPorPagina] = useState(10);
  const [ordenarPor, setOrdenarPor] = useState<'nombre' | 'cedula' | 'estado'>('nombre');
  const [ordenAscendente, setOrdenAscendente] = useState(true);
  const [vistaMovil, setVistaMovil] = useState(false);

  useEffect(() => {
    cargarDatos();
  }, []);

  useEffect(() => {
    const checkMobile = () => {
      setVistaMovil(window.innerWidth <= 640);
    };
    
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
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
  }).sort((a, b) => {
    let valorA, valorB;
    
    switch (ordenarPor) {
      case 'cedula':
        valorA = a.cedula;
        valorB = b.cedula;
        break;
      case 'estado':
        valorA = a.estado_asistencia ? 1 : 0;
        valorB = b.estado_asistencia ? 1 : 0;
        break;
      case 'nombre':
      default:
        valorA = a.nombre.toLowerCase();
        valorB = b.nombre.toLowerCase();
        break;
    }
    
    if (valorA < valorB) return ordenAscendente ? -1 : 1;
    if (valorA > valorB) return ordenAscendente ? 1 : -1;
    return 0;
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

  const cambiarOrden = (campo: 'nombre' | 'cedula' | 'estado') => {
    if (ordenarPor === campo) {
      setOrdenAscendente(!ordenAscendente);
    } else {
      setOrdenarPor(campo);
      setOrdenAscendente(true);
    }
    setPaginaActual(1);
  };

  const cambiarItemsPorPagina = (nuevoValor: number) => {
    setItemsPorPagina(nuevoValor);
    setPaginaActual(1);
  };

  const eliminarTodosInvitados = async () => {
    const confirmed = await showConfirmAlert(
      '¿Eliminar todos los invitados?',
      'Esta acción eliminará permanentemente todos los invitados y sus acompañantes de la base de datos. Esta acción no se puede deshacer.',
      'Sí, eliminar todo',
      'Cancelar'
    );

    if (!confirmed) return;

    // Doble verificación con SweetAlert personalizado
    const { value: verification } = await Swal.fire({
      title: '⚠️ Confirmación Final',
      html: `
        <div style="text-align: left; margin: 20px 0;">
          <p style="margin-bottom: 15px; color: #374151; font-size: 16px;">
            Esta acción eliminará <strong>PERMANENTEMENTE</strong> todos los invitados y sus acompañantes de la base de datos.
          </p>
          <p style="margin-bottom: 20px; color: #6b7280; font-weight: 600;">
            ⚡ Esta acción NO se puede deshacer
          </p>
          <p style="margin-bottom: 10px; color: #374151; font-size: 14px;">
            Para continuar, escriba exactamente la palabra:
          </p>
          <div style="text-align: center; margin: 10px 0;">
            <span style="background: #e5e7eb; padding: 8px 16px; border-radius: 6px; font-family: monospace; font-weight: bold; color: #374151; font-size: 18px; border: 2px solid #9ca3af;">
              ELIMINAR
            </span>
          </div>
        </div>
      `,
      input: 'text',
      inputPlaceholder: 'Escriba "ELIMINAR" aquí...',
      inputAttributes: {
        style: 'text-align: center; font-size: 16px; font-weight: 600;'
      },
      showCancelButton: true,
      confirmButtonText: '🗑️ Confirmar Eliminación',
      cancelButtonText: '❌ Cancelar',
      confirmButtonColor: '#6b7280',
      cancelButtonColor: '#9ca3af',
      focusConfirm: false,
      allowOutsideClick: false,
      allowEscapeKey: false,
      inputValidator: (value) => {
        if (!value) {
          return 'Debe escribir algo para continuar'
        }
        if (value.trim().toUpperCase() !== 'ELIMINAR') {
          return 'Debe escribir exactamente "ELIMINAR" en mayúsculas'
        }
      },
      customClass: {
        container: 'swal-delete-confirmation',
        popup: 'swal-delete-popup',
        title: 'swal-delete-title',
        input: 'swal-delete-input'
      }
    });

    if (!verification || verification.trim().toUpperCase() !== 'ELIMINAR') {
      await showErrorAlert('Cancelado', 'La eliminación ha sido cancelada.');
      return;
    }

    try {
      setIsLoading(true);
      const token = localStorage.getItem('token');
      
      // Eliminar todos los invitados
      const response = await fetch('http://localhost:8000/api/v1/invitados/eliminar-todos/', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        await showSuccessAlert('Éxito', 'Todos los invitados han sido eliminados correctamente');
        await cargarDatos(); // Recargar los datos
      } else {
        throw new Error('Error al eliminar los invitados');
      }
    } catch {
      await showErrorAlert('Error', 'No se pudieron eliminar los invitados');
    } finally {
      setIsLoading(false);
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

          <div className="table-controls">
            <label htmlFor="items-por-pagina" className="control-label">Mostrar:</label>
            <select
              id="items-por-pagina"
              value={itemsPorPagina}
              onChange={(e) => cambiarItemsPorPagina(Number(e.target.value))}
              className="items-select"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
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
              <div className="header-buttons">
                <button onClick={cargarDatos} className="refresh-button">
                  ↻ Actualizar
                </button>
                <button onClick={eliminarTodosInvitados} className="delete-all-button" disabled={isLoading}>
                  🗑️ Eliminar Todo
                </button>
              </div>
            </div>
            
            {invitadosPaginados.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">○</div>
                <h3>No se encontraron invitados</h3>
                <p>Intenta cambiar los filtros de búsqueda</p>
              </div>
            ) : vistaMovil ? (
              <div className="tarjetas-container">
                {invitadosPaginados.map((invitado) => (
                  <div key={invitado.id} className="invitado-card">
                    <div className="card-header">
                      <h3 className="invitado-nombre">{invitado.nombre}</h3>
                      <button className="refresh-button mini" onClick={() => cargarDatos()}>
                        ↻
                      </button>
                    </div>
                    
                    <div className="card-content">
                      <div className="info-row">
                        <span className="info-label">Cédula:</span>
                        <span className="info-value">{invitado.cedula}</span>
                      </div>
                      
                      <div className="info-row">
                        <span className="info-label">Estado:</span>
                        <span className={`info-value estado ${invitado.estado_asistencia ? 'confirmado' : 'pendiente'}`}>
                          {invitado.estado_asistencia ? '✓ Confirmado' : '○ Pendiente'}
                        </span>
                      </div>
                      
                      <div className="acompanantes-info">
                        <span className="acompanantes-label">Acompañantes:</span>
                        {invitado.acompanantes.length > 0 ? (
                          <div className="acompanantes-list">
                            {invitado.acompanantes.map((acomp) => (
                              <div key={acomp.id} className="acompanante-item">
                                <span className="acompanante-nombre">{acomp.nombre}</span>
                                <span className={`acompanante-status ${acomp.estado_asistencia ? 'confirmado' : 'pending'}`}>
                                  {acomp.estado_asistencia ? '✓' : '○'}
                                </span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <span className="no-acompanantes">Sin acompañantes</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="table-container">
                {vistaMovil ? (
                  /* Vista de tarjetas para móviles */
                  <div className="invitados-cards">
                    {invitadosPaginados.map((invitado) => (
                      <div key={invitado.id} className="invitado-card">
                        <div className="card-header">
                          <div className="card-name">{invitado.nombre}</div>
                          <div className={`card-status ${invitado.estado_asistencia ? 'confirmado' : 'pendiente'}`}>
                            {invitado.estado_asistencia ? '✓ Confirmado' : '○ Pendiente'}
                          </div>
                        </div>
                        
                        <div className="card-body">
                          <div className="card-info">
                            <span className="info-label">Cédula:</span>
                            <span className="info-value cedula-badge">{invitado.cedula}</span>
                          </div>
                          
                          <div className="card-acompanantes">
                            <div className="acompanantes-header">
                              <span className="info-label">Acompañantes:</span>
                              <span className="acompanantes-count">
                                {invitado.acompanantes.length}
                              </span>
                            </div>
                            
                            {invitado.acompanantes.length > 0 && (
                              <div className="acompanantes-list">
                                {invitado.acompanantes.slice(0, 3).map((acomp) => (
                                  <div key={acomp.id} className="acompanante-item">
                                    <span className="acompanante-name">{acomp.nombre}</span>
                                    <span className={`acompanante-status ${acomp.estado_asistencia ? 'confirmed' : 'pending'}`}>
                                      {acomp.estado_asistencia ? '✓' : '○'}
                                    </span>
                                  </div>
                                ))}
                                {invitado.acompanantes.length > 3 && (
                                  <div className="more-acompanantes">
                                    +{invitado.acompanantes.length - 3} más
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  /* Vista de tabla para desktop/tablet */
                  <table className="invitados-table">
                    <thead>
                      <tr>
                        <th 
                          className={`sortable-header ${ordenarPor === 'nombre' ? 'active' : ''}`}
                          onClick={() => cambiarOrden('nombre')}
                        >
                          <span>◉ Invitado Principal</span>
                          <span className={`sort-indicator ${ordenarPor === 'nombre' ? (ordenAscendente ? 'asc' : 'desc') : ''}`}>
                            {ordenarPor === 'nombre' ? (ordenAscendente ? '↑' : '↓') : '↕'}
                          </span>
                        </th>
                        <th 
                          className={`sortable-header ${ordenarPor === 'cedula' ? 'active' : ''}`}
                          onClick={() => cambiarOrden('cedula')}
                        >
                          <span>⚊ Cédula</span>
                          <span className={`sort-indicator ${ordenarPor === 'cedula' ? (ordenAscendente ? 'asc' : 'desc') : ''}`}>
                            {ordenarPor === 'cedula' ? (ordenAscendente ? '↑' : '↓') : '↕'}
                          </span>
                        </th>
                        <th>● Acompañantes</th>
                        <th 
                          className={`sortable-header ${ordenarPor === 'estado' ? 'active' : ''}`}
                          onClick={() => cambiarOrden('estado')}
                        >
                          <span>✓ Estado</span>
                          <span className={`sort-indicator ${ordenarPor === 'estado' ? (ordenAscendente ? 'asc' : 'desc') : ''}`}>
                            {ordenarPor === 'estado' ? (ordenAscendente ? '↑' : '↓') : '↕'}
                          </span>
                        </th>
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
                )}
                
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
