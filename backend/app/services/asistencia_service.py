from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import or_
from ..models import Invitado, Acompanante, AsistenciaLog
from ..schemas import (
    InvitadoCreate, AcompananteCreate, AsistenciaLogCreate,
    SearchResponse, ConfirmarAsistenciaRequest, ConfirmarAsistenciaResponse
)


class AsistenciaService:
    def __init__(self, db: Session):
        self.db = db

    def search_invitado(self, query: str) -> Optional[SearchResponse]:
        """
        Busca un invitado por cédula o nombre (búsqueda parcial)
        """
        # Limpiar la query
        query = query.strip()
        
        # Buscar en invitados por cédula exacta o nombre parcial
        invitado = self.db.query(Invitado).filter(
            or_(
                Invitado.cedula == query,
                Invitado.nombre.ilike(f"%{query}%")
            )
        ).first()
        
        # Si no se encuentra en invitados, buscar en acompañantes
        if not invitado:
            acompanante = self.db.query(Acompanante).filter(
                or_(
                    Acompanante.cedula == query,
                    Acompanante.nombre.ilike(f"%{query}%")
                )
            ).first()
            
            if acompanante:
                invitado = acompanante.invitado
        
        if not invitado:
            return None
        
        # Calcular totales
        total_personas = 1 + len(invitado.acompanantes)
        
        # Asegurar que estado_asistencia nunca sea None
        invitado_estado = bool(invitado.estado_asistencia) if invitado.estado_asistencia is not None else False
        
        # Verificar asistencia confirmada
        acompanantes_confirmados = all(
            bool(acomp.estado_asistencia) if acomp.estado_asistencia is not None else False
            for acomp in invitado.acompanantes
        ) if invitado.acompanantes else True
        
        asistencia_confirmada = invitado_estado and acompanantes_confirmados
        
        return SearchResponse(
            invitado=invitado,
            total_personas=total_personas,
            asistencia_confirmada=asistencia_confirmada
        )

    def confirmar_asistencia(self, request: ConfirmarAsistenciaRequest) -> ConfirmarAsistenciaResponse:
        """
        Confirma la asistencia del invitado y opcionalmente de sus acompañantes
        """
        try:
            # Buscar el invitado
            invitado = self.db.query(Invitado).filter(Invitado.id == request.invitado_id).first()
            if not invitado:
                return ConfirmarAsistenciaResponse(
                    success=False,
                    message="Invitado no encontrado",
                    personas_confirmadas=0
                )
            
            personas_confirmadas = 0
            
            # Confirmar asistencia del invitado principal si no está ya confirmada
            if not invitado.estado_asistencia:
                invitado.estado_asistencia = True
                personas_confirmadas += 1
                
                # Crear log de asistencia para invitado principal
                log_invitado = AsistenciaLog(
                    persona_id=invitado.id,
                    tipo="principal"
                )
                self.db.add(log_invitado)
            
            # Confirmar asistencia de acompañantes seleccionados
            if request.acompanantes_ids:
                acompanantes = self.db.query(Acompanante).filter(
                    Acompanante.id.in_(request.acompanantes_ids),
                    Acompanante.invitado_id == request.invitado_id
                ).all()
                
                for acompanante in acompanantes:
                    if not acompanante.estado_asistencia:
                        acompanante.estado_asistencia = True
                        personas_confirmadas += 1
                        
                        # Crear log de asistencia para acompañante
                        log_acompanante = AsistenciaLog(
                            persona_id=acompanante.id,
                            tipo="acompanante"
                        )
                        self.db.add(log_acompanante)
            
            # Guardar cambios
            self.db.commit()
            
            return ConfirmarAsistenciaResponse(
                success=True,
                message=f"Asistencia confirmada para {personas_confirmadas} persona(s)",
                personas_confirmadas=personas_confirmadas
            )
            
        except Exception as e:
            self.db.rollback()
            return ConfirmarAsistenciaResponse(
                success=False,
                message=f"Error al confirmar asistencia: {str(e)}",
                personas_confirmadas=0
            )

    def get_asistencias_stats(self) -> dict:
        """
        Obtiene estadísticas de asistencia para dashboard futuro
        """
        total_invitados = self.db.query(Invitado).count()
        invitados_confirmados = self.db.query(Invitado).filter(Invitado.estado_asistencia == True).count()
        
        total_acompanantes = self.db.query(Acompanante).count()
        acompanantes_confirmados = self.db.query(Acompanante).filter(Acompanante.estado_asistencia == True).count()
        
        return {
            "total_invitados": total_invitados,
            "invitados_confirmados": invitados_confirmados,
            "total_acompanantes": total_acompanantes,
            "acompanantes_confirmados": acompanantes_confirmados,
            "total_personas": total_invitados + total_acompanantes,
            "personas_confirmadas": invitados_confirmados + acompanantes_confirmados
        }

    def get_all_invitados(self) -> List[Invitado]:
        """
        Obtiene todos los invitados con sus acompañantes
        """
        try:
            invitados = self.db.query(Invitado).all()
            
            # Asegurar que los estados no sean None
            for invitado in invitados:
                if invitado.estado_asistencia is None:
                    invitado.estado_asistencia = False
                
                for acompanante in invitado.acompanantes:
                    if acompanante.estado_asistencia is None:
                        acompanante.estado_asistencia = False
            
            return invitados
        
        except Exception as e:
            print(f"Error obteniendo invitados: {e}")
            return []
