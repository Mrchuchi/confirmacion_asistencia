-- Script para crear las tablas del sistema de confirmación de asistencia
-- PostgreSQL Database Schema

-- Crear la base de datos (ejecutar como superuser)
-- CREATE DATABASE "Asistencia";

-- Conectarse a la base de datos y ejecutar los siguientes comandos:

-- Tabla de invitados principales
CREATE TABLE IF NOT EXISTS invitados (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    cedula VARCHAR(20) UNIQUE NOT NULL,
    campana_area VARCHAR(255),
    eps VARCHAR(255),
    sede VARCHAR(255),
    estado_asistencia BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de acompañantes
CREATE TABLE IF NOT EXISTS acompanantes (
    id SERIAL PRIMARY KEY,
    invitado_id INTEGER NOT NULL,
    nombre VARCHAR(255) NOT NULL,
    cedula VARCHAR(20) UNIQUE NOT NULL,
    edad INTEGER,
    parentesco VARCHAR(100),
    eps VARCHAR(255),
    estado_asistencia BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (invitado_id) REFERENCES invitados(id) ON DELETE CASCADE
);

-- Tabla de log de asistencias
CREATE TABLE IF NOT EXISTS asistencias_log (
    id SERIAL PRIMARY KEY,
    persona_id INTEGER NOT NULL,
    tipo VARCHAR(20) NOT NULL CHECK (tipo IN ('principal', 'acompanante')),
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de usuarios para autenticación (sin roles)
CREATE TABLE IF NOT EXISTS usuarios (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    hashed_password VARCHAR(255) NOT NULL,
    nombre_completo VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para mejorar rendimiento de búsquedas
CREATE INDEX IF NOT EXISTS idx_invitados_cedula ON invitados(cedula);
CREATE INDEX IF NOT EXISTS idx_invitados_nombre ON invitados(nombre);
CREATE INDEX IF NOT EXISTS idx_invitados_campana_area ON invitados(campana_area);
CREATE INDEX IF NOT EXISTS idx_invitados_eps ON invitados(eps);
CREATE INDEX IF NOT EXISTS idx_invitados_sede ON invitados(sede);
CREATE INDEX IF NOT EXISTS idx_acompanantes_cedula ON acompanantes(cedula);
CREATE INDEX IF NOT EXISTS idx_acompanantes_nombre ON acompanantes(nombre);
CREATE INDEX IF NOT EXISTS idx_acompanantes_invitado_id ON acompanantes(invitado_id);
CREATE INDEX IF NOT EXISTS idx_acompanantes_parentesco ON acompanantes(parentesco);
CREATE INDEX IF NOT EXISTS idx_acompanantes_eps ON acompanantes(eps);
CREATE INDEX IF NOT EXISTS idx_asistencias_log_persona_id ON asistencias_log(persona_id);
CREATE INDEX IF NOT EXISTS idx_asistencias_log_tipo ON asistencias_log(tipo);
CREATE INDEX IF NOT EXISTS idx_asistencias_log_timestamp ON asistencias_log(timestamp);
CREATE INDEX IF NOT EXISTS idx_usuarios_username ON usuarios(username);

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para actualizar updated_at
CREATE TRIGGER update_invitados_updated_at 
    BEFORE UPDATE ON invitados 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_acompanantes_updated_at 
    BEFORE UPDATE ON acompanantes 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_usuarios_updated_at 
    BEFORE UPDATE ON usuarios 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Datos de ejemplo (opcional - remover en producción)
INSERT INTO invitados (nombre, cedula, campana_area, eps, sede) VALUES 
    ('Juan Pérez', '12345678', 'Marketing Digital', 'Sanitas', 'Sede Principal'),
    ('María García', '87654321', 'Recursos Humanos', 'Nueva EPS', 'Sede Norte'),
    ('Carlos López', '11223344', 'Ventas', 'Compensar', 'Sede Sur'),
    ('Ana Martínez', '55667788', 'Administración', 'Sura', 'Sede Principal')
ON CONFLICT (cedula) DO NOTHING;

INSERT INTO acompanantes (invitado_id, nombre, cedula, edad, parentesco, eps) VALUES 
    (1, 'Carmen Pérez', '12345679', 35, 'Esposa', 'Sanitas'),
    (1, 'Pedro Pérez', '12345680', 8, 'Hijo', 'Sanitas'),
    (2, 'Luis García', '87654322', 42, 'Esposo', 'Nueva EPS'),
    (3, 'Rosa López', '11223345', 28, 'Hermana', 'Compensar')
ON CONFLICT (cedula) DO NOTHING;

-- Usuario administrador por defecto (password: admin123)
INSERT INTO usuarios (username, hashed_password, nombre_completo) VALUES 
    ('admin', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/4.GNpAecBzesU3ubG', 'Administrador del Sistema')
ON CONFLICT (username) DO NOTHING;
