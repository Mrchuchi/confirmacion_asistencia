# Sistema de Confirmación de Asistencia

Sistema completo para gestionar confirmación de asistencia a eventos, desarrollado con **PostgreSQL**, **FastAPI** (Python) y **React** (TypeScript).

## 🚀 Características

- **Búsqueda inteligente**: Buscar invitados por cédula o nombre
- **Gestión de acompañantes**: Manejo completo de invitados principales y sus acompañantes
- **Confirmación de asistencia**: Proceso simple e intuitivo
- **Log de asistencias**: Registro completo con timestamps
- **Interfaz moderna**: UI responsiva y atractiva
- **Arquitectura escalable**: Preparado para dashboard en tiempo real

## 📋 Requisitos Previos

- **Python 3.8+**
- **Node.js 18+**
- **PostgreSQL 12+**
- **npm** o **yarn**

## 🛠️ Instalación

### 1. Configuración de la Base de Datos

```sql
-- Crear la base de datos
CREATE DATABASE "Asistencia";

-- Ejecutar el script de esquema
\i database/schema.sql
```

### 2. Backend (FastAPI)

```bash
# Navegar al directorio backend
cd backend

# Crear entorno virtual
python -m venv venv

# Activar entorno virtual
# Windows
venv\Scripts\activate
# Linux/Mac
source venv/bin/activate

# Instalar dependencias
pip install -r requirements.txt

# Configurar variables de entorno
cp .env.example .env
# Editar .env con tu configuración de base de datos
```

### 3. Frontend (React + TypeScript)

```bash
# Navegar al directorio frontend
cd frontend

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env.local
# Editar .env.local si es necesario
```

## 🚦 Uso

### Iniciar el Backend

```bash
cd backend
python run.py
```

La API estará disponible en: `http://localhost:8000`
- Documentación automática: `http://localhost:8000/docs`
- Redoc: `http://localhost:8000/redoc`

### Iniciar el Frontend

```bash
cd frontend
npm run dev
```

La aplicación estará disponible en: `http://localhost:5173`

## 📚 API Endpoints

### GET `/api/v1/search?query=<busqueda>`
Busca un invitado por cédula o nombre.

**Parámetros:**
- `query`: Cédula o nombre del invitado

**Respuesta:**
```json
{
  "invitado": {
    "id": 1,
    "nombre": "Juan Pérez",
    "cedula": "12345678",
    "estado_asistencia": false,
    "acompanantes": [...]
  },
  "total_personas": 3,
  "asistencia_confirmada": false
}
```

### POST `/api/v1/confirmar_asistencia`
Confirma la asistencia del invitado y sus acompañantes.

**Body:**
```json
{
  "invitado_id": 1,
  "acompanantes_ids": [2, 3]
}
```

**Respuesta:**
```json
{
  "success": true,
  "message": "Asistencia confirmada para 3 persona(s)",
  "personas_confirmadas": 3
}
```

### GET `/api/v1/stats`
Obtiene estadísticas de asistencia.

## 🗄️ Estructura de Base de Datos

### Tabla `invitados`
- `id`: Identificador único
- `nombre`: Nombre del invitado
- `cedula`: Cédula (único)
- `estado_asistencia`: Boolean de confirmación
- `created_at`, `updated_at`: Timestamps

### Tabla `acompanantes`
- `id`: Identificador único
- `invitado_id`: FK a invitados
- `nombre`: Nombre del acompañante  
- `cedula`: Cédula (único)
- `estado_asistencia`: Boolean de confirmación
- `created_at`, `updated_at`: Timestamps

### Tabla `asistencias_log`
- `id`: Identificador único
- `persona_id`: ID de la persona
- `tipo`: 'principal' o 'acompanante'
- `timestamp`: Momento de confirmación

## 🏗️ Arquitectura del Proyecto

```
confirmacion_asistencia/
├── backend/                 # API FastAPI
│   ├── app/
│   │   ├── models/         # Modelos SQLAlchemy
│   │   ├── schemas/        # Schemas Pydantic
│   │   ├── routers/        # Endpoints API
│   │   ├── services/       # Lógica de negocio
│   │   ├── config.py       # Configuración
│   │   ├── database.py     # Conexión DB
│   │   └── main.py         # App principal
│   ├── requirements.txt
│   └── run.py
├── frontend/               # React + TypeScript
│   ├── src/
│   │   ├── components/     # Componentes React
│   │   ├── hooks/          # Custom hooks
│   │   ├── services/       # Servicios API
│   │   ├── types/          # Definiciones TypeScript
│   │   └── App.tsx
│   └── package.json
└── database/
    └── schema.sql          # Esquema PostgreSQL
```

## 🔧 Desarrollo

### Backend
- **FastAPI**: Framework web moderno y rápido
- **SQLAlchemy**: ORM para PostgreSQL  
- **Pydantic**: Validación de datos y serialización
- **Uvicorn**: Servidor ASGI

### Frontend
- **React 18**: Framework de UI
- **TypeScript**: Tipado estático
- **Vite**: Build tool y dev server
- **Axios**: Cliente HTTP
- **CSS Modules**: Estilos encapsulados

## 🎨 Características de UI/UX

- **Diseño responsivo**: Funciona en desktop y mobile
- **Feedback visual**: Estados de carga y mensajes claros
- **Búsqueda intuitiva**: Por cédula o nombre parcial
- **Confirmación selectiva**: Elegir qué acompañantes confirmar
- **Estados claros**: Indicadores visuales de asistencia

## 🔮 Roadmap Futuro

- [ ] Dashboard en tiempo real con WebSockets
- [ ] Reportes y estadísticas avanzadas
- [ ] Autenticación y autorización
- [ ] Exportación de datos
- [ ] Notificaciones push
- [ ] Modo offline con sincronización
- [ ] API para integraciones externas

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📝 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para detalles.

## 🆘 Soporte

Si tienes preguntas o problemas:

1. Revisa la documentación de la API en `/docs`
2. Verifica que PostgreSQL esté ejecutándose
3. Confirma que las variables de entorno estén configuradas
4. Revisa los logs del backend y frontend

---

**Desarrollado con ❤️ para una gestión eficiente de eventos**
