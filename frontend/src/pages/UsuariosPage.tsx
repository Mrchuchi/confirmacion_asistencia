import React, { useState, useEffect } from 'react';
import { showConfirmAlert, showSuccessAlert, showErrorAlert } from '../utils/sweetAlert';
import './UsuariosPage.css';

interface Usuario {
  id: number;
  username: string;
  nombre_completo: string;
  created_at: string;
  updated_at: string;
}

export const UsuariosPage: React.FC = () => {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<Usuario | null>(null);
  const [busqueda, setBusqueda] = useState('');
  const [formData, setFormData] = useState({
    username: '',
    nombre_completo: '',
    password: ''
  });

  useEffect(() => {
    loadUsuarios();
  }, []);

  const loadUsuarios = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8000/api/v1/usuarios/', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setUsuarios(data);
      }
    } catch {
      await showErrorAlert('Error', 'No se pudieron cargar los usuarios');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (user?: Usuario) => {
    if (user) {
      setEditingUser(user);
      setFormData({
        username: user.username,
        nombre_completo: user.nombre_completo,
        password: ''
      });
    } else {
      setEditingUser(null);
      setFormData({
        username: '',
        nombre_completo: '',
        password: ''
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingUser(null);
    setFormData({
      username: '',
      nombre_completo: '',
      password: ''
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.username || !formData.nombre_completo) {
      await showErrorAlert('Error', 'Por favor complete todos los campos requeridos');
      return;
    }

    if (!editingUser && !formData.password) {
      await showErrorAlert('Error', 'La contraseña es requerida para nuevos usuarios');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const url = editingUser
        ? `http://localhost:8000/api/v1/usuarios/${editingUser.id}`
        : 'http://localhost:8000/api/v1/usuarios/';

      const response = await fetch(url, {
        method: editingUser ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        await showSuccessAlert(
          'Éxito',
          editingUser ? 'Usuario actualizado correctamente' : 'Usuario creado correctamente'
        );
        handleCloseModal();
        await loadUsuarios();
      } else {
        const error = await response.json();
        throw new Error(error.detail || 'Error al guardar el usuario');
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error al guardar el usuario';
      await showErrorAlert('Error', message);
    }
  };

  const handleDelete = async (user: Usuario) => {
    const confirmed = await showConfirmAlert(
      '¿Eliminar usuario?',
      `¿Está seguro de eliminar al usuario "${user.nombre_completo}"? Esta acción no se puede deshacer.`,
      'Sí, eliminar',
      'Cancelar'
    );

    if (!confirmed) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:8000/api/v1/usuarios/${user.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok || response.status === 204) {
        await showSuccessAlert('Éxito', 'Usuario eliminado correctamente');
        await loadUsuarios();
      }
    } catch {
      await showErrorAlert('Error', 'No se pudo eliminar el usuario');
    }
  };

  const usuariosFiltrados = usuarios.filter((user) => {
    if (busqueda.trim()) {
      const termino = busqueda.toLowerCase();
      return (
        user.nombre_completo.toLowerCase().includes(termino) ||
        user.username.toLowerCase().includes(termino)
      );
    }
    return true;
  });

  return (
    <div className="usuarios-page">
      <div className="page-header">
        <h2>◉ Gestión de Usuarios</h2>
      </div>

      <div className="page-content">
        {/* Controles */}
        <div className="controls-section">
          <div className="search-control">
            <input
              type="text"
              placeholder="Buscar por nombre o usuario..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="search-input"
            />
          </div>

          <button className="add-button" onClick={() => handleOpenModal()}>
            + Nuevo Usuario
          </button>
        </div>

        {/* Tabla */}
        {loading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Cargando usuarios...</p>
          </div>
        ) : (
          <div className="usuarios-section">
            <div className="section-header">
              <h2>◉ Usuarios ({usuariosFiltrados.length})</h2>
              <button onClick={loadUsuarios} className="refresh-button">
                ↻ Actualizar
              </button>
            </div>

            {usuariosFiltrados.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">○</div>
                <h3>No se encontraron usuarios</h3>
                <p>{busqueda ? 'Intenta cambiar la búsqueda' : 'No hay usuarios registrados'}</p>
                {!busqueda && (
                  <button className="add-button-secondary" onClick={() => handleOpenModal()}>
                    + Crear Primer Usuario
                  </button>
                )}
              </div>
            ) : (
              <div className="table-container">
                <table className="usuarios-table">
                  <thead>
                    <tr>
                      <th>◉ Nombre Completo</th>
                      <th>⚊ Usuario</th>
                      <th>● Fecha Creación</th>
                      <th>✓ Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {usuariosFiltrados.map((user) => (
                      <tr key={user.id} className="usuario-row">
                        <td className="name-cell">
                          <div className="name-container">
                            <span className="name">{user.nombre_completo}</span>
                          </div>
                        </td>

                        <td className="username-cell">
                          <span className="username-badge">@{user.username}</span>
                        </td>

                        <td className="date-cell">
                          {new Date(user.created_at).toLocaleDateString('es-ES', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </td>

                        <td className="actions-cell">
                          <div className="action-buttons">
                            <button
                              className="action-btn edit-btn"
                              onClick={() => handleOpenModal(user)}
                              title="Editar usuario"
                            >
                              ✎
                            </button>
                            <button
                              className="action-btn delete-btn"
                              onClick={() => handleDelete(user)}
                              title="Eliminar usuario"
                            >
                              X
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingUser ? 'Editar Usuario' : 'Nuevo Usuario'}</h2>
              <button className="modal-close" onClick={handleCloseModal}>✕</button>
            </div>

            <form onSubmit={handleSubmit} className="usuario-form">
              <div className="form-group">
                <label htmlFor="username">Nombre de Usuario *</label>
                <input
                  type="text"
                  id="username"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  placeholder="Ingrese el nombre de usuario"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="nombre_completo">Nombre Completo *</label>
                <input
                  type="text"
                  id="nombre_completo"
                  value={formData.nombre_completo}
                  onChange={(e) => setFormData({ ...formData, nombre_completo: e.target.value })}
                  placeholder="Ingrese el nombre completo"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="password">
                  Contraseña {editingUser ? '(dejar en blanco para no cambiar)' : '*'}
                </label>
                <input
                  type="password"
                  id="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Ingrese la contraseña"
                  required={!editingUser}
                />
              </div>

              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={handleCloseModal}>
                  Cancelar
                </button>
                <button type="submit" className="btn-submit">
                  {editingUser ? 'Actualizar' : 'Crear'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
