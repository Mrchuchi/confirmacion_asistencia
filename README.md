# 📄 Documentación de Entrega – Sistema de Confirmación de Asistencia

**Cliente / Área solicitante:** Andes BPO  
**Líder del proyecto:** Felipe Arango  
**Desarrollador:** Víctor Manuel Velásquez  
**Fecha de entrega:** 10/11/2025  
**Versión del sistema:** v1.0.0  
**Estado:** ✅ Finalizado  

---

## 🧩 1. Resumen Ejecutivo
> Sistema completo para gestionar confirmación de asistencia a eventos empresariales, permitiendo búsqueda inteligente de invitados, gestión de acompañantes y confirmación de asistencia en tiempo real. Desarrollado con PostgreSQL, FastAPI (Python) y React (TypeScript), ofrece una interfaz moderna y escalable preparada para futuras integraciones con dashboard en tiempo real.

---

## 🚀 Características Principales

- **Búsqueda inteligente**: Buscar invitados por cédula o nombre
- **Gestión de acompañantes**: Manejo completo de invitados principales y sus acompañantes
- **Confirmación de asistencia**: Proceso simple e intuitivo
- **Importación masiva**: Carga de invitados y acompañantes desde Excel
- **Log de asistencias**: Registro completo con timestamps
- **Interfaz moderna**: UI responsiva y atractiva
- **Arquitectura escalable**: Preparado para dashboard en tiempo real

---

## 🛠️ 2. Información Técnica

### Tecnologías utilizadas
- **Frontend:** React 18, TypeScript, Vite
- **Backend:** Python 3.8+, FastAPI, SQLAlchemy
- **Base de Datos:** PostgreSQL 12+
- **Infraestructura:** Railway (base de datos y backend), Vercel/Netlify (frontend)
- **Otras:** Axios (HTTP client), SweetAlert2 (notificaciones), Alembic (migraciones)

### Repositorios
| Entorno | URL |
|--------|-----|
| Código fuente | `https://github.com/Mrchuchi/confirmacion_asistencia` |
| Producción (Backend) | Railway deployment |
| Producción (Frontend) | Vercel/Netlify deployment |

---

## 📚 3. Documentación Entregada

✅ **[✔] Código fuente comentado**  
- Funciones clave documentadas con docstrings (Python) y JSDoc (TypeScript).
- Estándar de estilo: PEP 8 (Python), ESLint (TypeScript).
- Organización en capas: models, schemas, routers, services (backend) / components, hooks, services (frontend).

✅ **[✔] Manual de usuario**  
- Ubicación: `/documentation/guia_importacion_excel.md`
- Incluye: flujos de importación, formato de Excel, validaciones.

✅ **[✔] README principal**  
- Instrucciones para: clonar, instalar, ejecutar local, configuración de base de datos.
- Endpoints API documentados.

✅ **[✔] Guía de despliegue**  
- Entornos soportados: `local`, `producción` (Railway)
- Pasos detallados + variables de entorno requeridas.
- Scripts de migración de datos incluidos.

✅ **[✔] Arquitectura del sistema**  
- Arquitectura en capas (Backend): models, schemas, routers, services
- Componentes React con hooks personalizados (Frontend)
- APIs REST documentadas con FastAPI auto-docs (`/docs`)

✅ **[✔] Pruebas**  
- Validación de endpoints API
- Pruebas de integración con base de datos
- Validación de importación Excel

✅ **[✔] Runbook / Operaciones**  
- Scripts de mantenimiento: `check_db.py`, `fix_database.py`, `migrate_to_railway.py`
- Gestión de usuarios: `create_admin.py`, `setup_auth.py`
- Inicialización de datos: `insert_sample_data.py`

✅ **[✔] Inventario de activos**  
| Recurso | Detalle | Responsable | Estado |
|--------|---------|-------------|--------|
| Base de datos Railway | PostgreSQL 12+ | Infraestructura | Activo |
| Backend Railway | FastAPI deployment | DevOps | Activo |
| Frontend deployment | React + TypeScript | DevOps | Activo |
| Repositorio GitHub | `Mrchuchi/confirmacion_asistencia` | Desarrollo | Activo |

---

## 📝 4. Pendientes / Observaciones
- [x] Sistema funcional en producción
- [x] Importación masiva de invitados desde Excel
- [x] Gestión de acompañantes con validación de duplicados
- [x] Dashboard de estadísticas en tiempo real
- [ ] Capacitación de usuarios finales (pendiente programar)
- [ ] Manual de operaciones detallado para administradores

⚠️ *Nota:* La importación de Excel requiere formato específico con hojas "Invitados" y "Acompañantes" (ver documentación).

---

## 📌 5. Contactos de Soporte
| Rol | Nombre | 
|-----|--------|
| Líder del Proyecto | Felipe Arango |
| Desarrollador | Víctor Manuel Velásquez |
| Soporte Técnico | Equipo Andes BPO |

---

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
- [ ] Exportación de datos a Excel/PDF
- [ ] Notificaciones push
- [ ] Modo offline con sincronización
- [ ] API para integraciones externas
- [ ] Mejoras en importación Excel (validación avanzada)

---

> 📎 **Archivos adjuntos en entrega final:**  
> - `codigo_fuente/` (Repositorio GitHub)
> - `docs/`  
>   ├── `guia_importacion_excel.md`  
>   ├── `README.md` (este archivo)  
>   └── `schema.sql` (esquema de base de datos)
> - `scripts/`  
>   ├── Scripts de migración y mantenimiento  
>   └── Scripts de inicialización

---

**Desarrollado con ❤️ para una gestión eficiente de eventos | Andes BPO**
