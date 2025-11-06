from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .config import settings
from .routers import asistencia, import_router, auth, usuarios

# Crear la aplicación FastAPI
app = FastAPI(
    title="Sistema de Confirmación de Asistencia",
    description="API para gestionar confirmación de asistencia a eventos",
    version="1.0.0",
    debug=settings.debug
)

# Configurar CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
    max_age=3600,
)

# Incluir routers
app.include_router(auth.router, prefix="/api/v1")
app.include_router(usuarios.router, prefix="/api/v1")
app.include_router(asistencia.router)
app.include_router(import_router.router, prefix="/import", tags=["import"])


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
