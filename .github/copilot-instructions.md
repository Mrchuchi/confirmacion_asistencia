<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

# Sistema de Confirmación de Asistencia - Instrucciones para Copilot

Este es un proyecto de confirmación de asistencia para eventos con las siguientes características:

## Stack Tecnológico
- **Backend**: FastAPI (Python) con PostgreSQL
- **Frontend**: React + TypeScript con Vite
- **Base de Datos**: PostgreSQL con SQLAlchemy

## Arquitectura del Proyecto
- **Backend**: Organizado en capas (models, schemas, routers, services)
- **Frontend**: Componentes React con hooks personalizados y servicios API separados
- **Database**: Esquema PostgreSQL con triggers y índices optimizados

## Estándares de Código

### Python (Backend)
- Usar tipado estático con Type Hints
- Seguir PEP 8 para formateo
- Usar Pydantic para validación de datos
- Implementar manejo de errores apropiado
- Documentar endpoints con docstrings

### TypeScript (Frontend)
- Usar tipado estricto de TypeScript
- Implementar interfaces para todos los datos
- Usar React hooks para gestión de estado
- Separar lógica de negocio en servicios
- Implementar manejo de errores y estados de carga

### Base de Datos
- Usar naming conventions en snake_case
- Implementar índices para consultas frecuentes
- Usar foreign keys y constraints apropiadas
- Documentar cambios de esquema

## Patrones de Diseño
- Repository pattern para acceso a datos
- Service layer para lógica de negocio
- Custom hooks para lógica de estado en React
- Error boundaries para manejo de errores
- Separation of concerns en todas las capas

## Funcionalidades Core
1. Búsqueda de invitados por cédula o nombre
2. Visualización de invitado principal y acompañantes
3. Confirmación selectiva de asistencia
4. Log de asistencias con timestamps
5. Estados visuales claros en la interfaz

## Consideraciones Especiales
- El sistema está preparado para escalabilidad hacia dashboard en tiempo real
- Implementar validación tanto en backend como frontend
- Mantener consistencia en naming entre backend y frontend
- Priorizar UX/UI intuitiva para operadores del evento
- Asegurar performance en búsquedas de base de datos
