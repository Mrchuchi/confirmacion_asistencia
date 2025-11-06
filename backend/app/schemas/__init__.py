from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime


# Schemas base para Acompañante
class AcompananteBase(BaseModel):
    nombre: str = Field(..., min_length=1, max_length=255)
    cedula: str = Field(..., min_length=1, max_length=20)
    edad: Optional[int] = Field(None, ge=0, le=120)
    parentesco: Optional[str] = Field(None, max_length=100)
    eps: Optional[str] = Field(None, max_length=255)


class AcompananteCreate(AcompananteBase):
    invitado_id: int


class Acompanante(AcompananteBase):
    id: int
    invitado_id: int
    estado_asistencia: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# Schemas base para Invitado
class InvitadoBase(BaseModel):
    nombre: str = Field(..., min_length=1, max_length=255)
    cedula: str = Field(..., min_length=1, max_length=20)
    campana_area: Optional[str] = Field(None, max_length=255)
    eps: Optional[str] = Field(None, max_length=255)
    sede: Optional[str] = Field(None, max_length=255)


class InvitadoCreate(InvitadoBase):
    pass


class Invitado(InvitadoBase):
    id: int
    estado_asistencia: bool
    created_at: datetime
    updated_at: datetime
    acompanantes: List[Acompanante] = []

    class Config:
        from_attributes = True


# Schema para respuesta de búsqueda
class SearchResponse(BaseModel):
    invitado: Invitado
    total_personas: int
    asistencia_confirmada: bool


# Schema para confirmación de asistencia
class ConfirmarAsistenciaRequest(BaseModel):
    invitado_id: int
    acompanantes_ids: Optional[List[int]] = Field(default_factory=list)


class ConfirmarAsistenciaResponse(BaseModel):
    success: bool
    message: str
    personas_confirmadas: int


# Schema para log de asistencia
class AsistenciaLogBase(BaseModel):
    persona_id: int
    tipo: str = Field(..., pattern="^(principal|acompanante)$")


class AsistenciaLogCreate(AsistenciaLogBase):
    pass


class AsistenciaLog(AsistenciaLogBase):
    id: int
    timestamp: datetime

    class Config:
        from_attributes = True
