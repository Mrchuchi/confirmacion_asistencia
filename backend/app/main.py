from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .config import settings
from .routers import asistencia, import_router, auth, usuarios
import re

# Crear la aplicación FastAPI
app = FastAPI(
    title="Sistema de Confirmación de Asistencia",
    description="API para gestionar confirmación de asistencia a eventos",
    version="1.0.0",
    debug=settings.debug
)

# Función para validar orígenes Railway
def is_railway_origin(origin: str) -> bool:
    """Verificar si el origen es de Railway"""
    railway_patterns = [
        r"^https?://[^\.]+\.up\.railway\.app$",
        r"^https?://[^\.]+\.railway\.app$"
    ]
    
    for pattern in railway_patterns:
        if re.match(pattern, origin):
            return True
    return False

# Lista de orígenes permitidos
allowed_origins = settings.cors_origins.copy()

# En desarrollo, permitir todos los orígenes Railway
if settings.debug:
    allowed_origins.append("*")  # Temporal para desarrollo

# Configurar CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allow_headers=[
        "Accept",
        "Accept-Language", 
        "Content-Language",
        "Content-Type",
        "Authorization",
        "X-Requested-With",
        "X-CSRFToken"
    ],
    expose_headers=["*"],
    max_age=3600,
)

# Incluir routers
app.include_router(auth.router, prefix="/api/v1")
app.include_router(usuarios.router, prefix="/api/v1")
app.include_router(asistencia.router)
app.include_router(import_router.router, prefix="/import", tags=["import"])

# Health check endpoint
@app.get("/health")
async def health_check():
    """Endpoint para verificar el estado de la API"""
    return {
        "status": "healthy",
        "message": "Sistema de Confirmación de Asistencia API",
        "version": "1.0.0",
        "debug": settings.debug
    }

# Root endpoint
@app.get("/")
async def root():
    """Endpoint raíz"""
    return {
        "message": "Sistema de Confirmación de Asistencia API",
        "version": "1.0.0",
        "endpoints": {
            "health": "/health",
            "docs": "/docs",
            "auth": "/api/v1/auth",
            "search": "/api/v1/search",
            "import": "/import"
        }
    }


@app.get("/")
async def root():
    """Endpoint de salud de la API"""
    return {
        "message": "Sistema de Confirmación de Asistencia API",
        "status": "running",
        "version": "1.0.0"
    }


@app.get("/health")
async def health_check():
    """Endpoint de verificación de salud"""
    return {"status": "healthy"}
