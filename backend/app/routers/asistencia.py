from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import Optional
from ..database import get_db
from ..services.asistencia_service import AsistenciaService
from ..schemas import SearchResponse, ConfirmarAsistenciaRequest, ConfirmarAsistenciaResponse

router = APIRouter(prefix="/api/v1", tags=["asistencia"])


@router.get("/search", response_model=Optional[SearchResponse])
async def search_invitado(
    query: str = Query(..., min_length=1, description="Cédula o nombre del invitado"),
    db: Session = Depends(get_db)
):
    """
    Busca un invitado por cédula o nombre.
    Retorna el invitado con sus acompañantes si se encuentra.
    """
    service = AsistenciaService(db)
    result = service.search_invitado(query)
    
    if not result:
        raise HTTPException(
            status_code=404,
            detail="No se encontró ningún invitado con los criterios especificados"
        )
    
    return result


@router.post("/confirmar_asistencia", response_model=ConfirmarAsistenciaResponse)
async def confirmar_asistencia(
    request: ConfirmarAsistenciaRequest,
    db: Session = Depends(get_db)
):
    """
    Confirma la asistencia del invitado y opcionalmente de sus acompañantes.
    Actualiza el estado en la base de datos y crea logs de asistencia.
    """
    service = AsistenciaService(db)
    result = service.confirmar_asistencia(request)
    
    if not result.success:
        raise HTTPException(status_code=400, detail=result.message)
    
    return result


@router.post("/agregar-invitado-rapido")
async def agregar_invitado_rapido(
    nombre: str,
    cedula: str,
    db: Session = Depends(get_db)
):
    """
    Agrega un invitado nuevo al momento (para casos no previstos)
    """
    from ..models import Invitado
    
    # Verificar si ya existe
    existing = db.query(Invitado).filter(Invitado.cedula == cedula).first()
    if existing:
        raise HTTPException(
            status_code=400, 
            detail="Ya existe un invitado con esta cédula"
        )
    
    # Crear nuevo invitado
    nuevo_invitado = Invitado(
        nombre=nombre,
        cedula=cedula,
        estado_asistencia=True  # Se agrega ya confirmado
    )
    
    db.add(nuevo_invitado)
    db.commit()
    db.refresh(nuevo_invitado)
    
    # Crear log de asistencia
    from ..models import AsistenciaLog
    log = AsistenciaLog(
        persona_id=nuevo_invitado.id,
        tipo="principal"
    )
    db.add(log)
    db.commit()
    
    return {
        "success": True,
        "message": f"Invitado {nombre} agregado y confirmado exitosamente",
        "invitado": {
            "id": nuevo_invitado.id,
            "nombre": nuevo_invitado.nombre,
            "cedula": nuevo_invitado.cedula
        }
    }


@router.post("/agregar-acompanante-extra")
async def agregar_acompanante_extra(
    invitado_id: int,
    nombre_acompanante: str,
    cedula_acompanante: str,
    db: Session = Depends(get_db)
):
    """
    Agrega un acompañante extra a un invitado existente
    """
    from ..models import Invitado, Acompanante, AsistenciaLog
    
    # Verificar que el invitado existe
    invitado = db.query(Invitado).filter(Invitado.id == invitado_id).first()
    if not invitado:
        raise HTTPException(
            status_code=404,
            detail="Invitado no encontrado"
        )
    
    # Verificar si ya existe un acompañante con esta cédula
    existing_acompanante = db.query(Acompanante).filter(
        Acompanante.cedula == cedula_acompanante
    ).first()
    
    if existing_acompanante:
        raise HTTPException(
            status_code=400,
            detail="Ya existe un acompañante con esta cédula"
        )
    
    # Crear nuevo acompañante
    nuevo_acompanante = Acompanante(
        nombre=nombre_acompanante,
        cedula=cedula_acompanante,
        invitado_id=invitado_id,
        estado_asistencia=True  # Se agrega ya confirmado
    )
    
    db.add(nuevo_acompanante)
    db.commit()
    db.refresh(nuevo_acompanante)
    
    # Crear log de asistencia
    log = AsistenciaLog(
        persona_id=nuevo_acompanante.id,
        tipo="acompanante"
    )
    db.add(log)
    db.commit()
    
    return {
        "success": True,
        "message": f"Acompañante {nombre_acompanante} agregado y confirmado exitosamente",
        "acompanante": {
            "id": nuevo_acompanante.id,
            "nombre": nuevo_acompanante.nombre,
            "invitado_id": invitado_id
        }
    }


@router.get("/stats")
async def get_stats(db: Session = Depends(get_db)):
    """
    Obtiene estadísticas de asistencia para dashboard (funcionalidad futura).
    """
    service = AsistenciaService(db)
    return service.get_asistencias_stats()


@router.get("/invitados")
async def get_all_invitados(db: Session = Depends(get_db)):
    """
    Obtiene la lista completa de invitados con sus acompañantes.
    """
    service = AsistenciaService(db)
    invitados = service.get_all_invitados()
    return invitados


@router.delete("/invitados/eliminar-todos/")
async def eliminar_todos_invitados(db: Session = Depends(get_db)):
    """
    Elimina todos los invitados y sus acompañantes de la base de datos.
    Esta acción es irreversible.
    """
    try:
        # Importar modelos correctamente
        from ..models import Invitado, Acompanante, AsistenciaLog
        
        # Obtener el número de registros antes de eliminar
        total_invitados = db.query(Invitado).count()
        total_acompanantes = db.query(Acompanante).count()
        total_logs = db.query(AsistenciaLog).count()
        
        # Eliminar todos los logs de asistencia primero
        logs_deleted = db.query(AsistenciaLog).delete()
        
        # Eliminar todos los acompañantes explícitamente
        acompanantes_deleted = db.query(Acompanante).delete()
        
        # Eliminar todos los invitados
        invitados_deleted = db.query(Invitado).delete()
        
        # Confirmar los cambios
        db.commit()
        
        return {
            "success": True,
            "message": f"Eliminados exitosamente: {invitados_deleted} invitados, {acompanantes_deleted} acompañantes, {logs_deleted} logs",
            "deleted": {
                "invitados": invitados_deleted,
                "acompanantes": acompanantes_deleted,
                "logs": logs_deleted
            }
        }
    except Exception as e:
        db.rollback()
        import traceback
        error_details = traceback.format_exc()
        print(f"Error detallado: {error_details}")
        raise HTTPException(
            status_code=500,
            detail=f"Error al eliminar los invitados: {str(e)}"
        )
