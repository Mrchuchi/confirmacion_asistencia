import os
from typing import List
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    database_url: str = "postgresql://username:password@localhost:5432/Asistencia"
    debug: bool = True
    
    # Orígenes CORS dinámicos que incluyen desarrollo y producción
    cors_origins: List[str] = [
        "http://localhost:3000",           # React dev
        "http://localhost:5173",           # Vite dev
        "http://127.0.0.1:3000",          # Local alternativo
        "http://127.0.0.1:5173",          # Local alternativo
        "https://localhost:3000",          # HTTPS local
        "https://localhost:5173",          # HTTPS local
    ]
    
    # Variables de entorno para producción
    frontend_url: str = ""               # URL del frontend en Railway
    backend_url: str = ""                # URL del backend en Railway
    
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        
        # Agregar URLs de producción si están disponibles
        if self.frontend_url:
            self.cors_origins.append(self.frontend_url)
        
        if self.backend_url:
            self.cors_origins.append(self.backend_url)
        
        # Permitir cualquier subdominio de Railway en desarrollo
        railway_domains = [
            "*.up.railway.app",
            "*.railway.app"
        ]
        
        # En producción, permitir todos los orígenes Railway si debug está activo
        if self.debug:
            # Esto es temporal para desarrollo - en producción específica las URLs exactas
            import re
            railway_pattern = r"https?://[^\.]+\.up\.railway\.app"
            self.cors_origins.extend([
                "https://*.up.railway.app",
                "https://*.railway.app"
            ])
    
    class Config:
        env_file = ".env"


settings = Settings()
