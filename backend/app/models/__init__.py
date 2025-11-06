from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from ..database import Base


class Invitado(Base):
    __tablename__ = "invitados"

    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String(255), nullable=False, index=True)
    cedula = Column(String(20), unique=True, nullable=False, index=True)
    campana_area = Column(String(255), nullable=True, index=True)
    eps = Column(String(255), nullable=True, index=True)
    sede = Column(String(255), nullable=True, index=True)
    estado_asistencia = Column(Boolean, default=False, nullable=False, server_default='false')
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relación con acompañantes
    acompanantes = relationship("Acompanante", back_populates="invitado", cascade="all, delete-orphan")


class Acompanante(Base):
    __tablename__ = "acompanantes"

    id = Column(Integer, primary_key=True, index=True)
    invitado_id = Column(Integer, ForeignKey("invitados.id"), nullable=False)
    nombre = Column(String(255), nullable=False, index=True)
    cedula = Column(String(20), unique=True, nullable=False, index=True)
    edad = Column(Integer, nullable=True)
    parentesco = Column(String(100), nullable=True, index=True)
    eps = Column(String(255), nullable=True, index=True)
    estado_asistencia = Column(Boolean, default=False, nullable=False, server_default='false')
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relación con invitado
    invitado = relationship("Invitado", back_populates="acompanantes")


class AsistenciaLog(Base):
    __tablename__ = "asistencias_log"

    id = Column(Integer, primary_key=True, index=True)
    persona_id = Column(Integer, nullable=False, index=True)
    tipo = Column(String(20), nullable=False, index=True)  # 'principal' o 'acompanante'
    timestamp = Column(DateTime(timezone=True), server_default=func.now(), index=True)


class Usuario(Base):
    __tablename__ = "usuarios"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, nullable=False, index=True)
    hashed_password = Column(String(255), nullable=False)
    nombre_completo = Column(String(255), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
