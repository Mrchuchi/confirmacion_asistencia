from fastapi import APIRouter, File, UploadFile, HTTPException, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Invitado, Acompanante
from app.schemas import InvitadoCreate, AcompananteCreate
import pandas as pd
import io
from typing import List
import logging

router = APIRouter()
logger = logging.getLogger(__name__)

@router.post("/import-excel")
async def import_excel(
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    """
    Importar invitados y acompañantes desde un archivo Excel.
    
    Formato esperado del Excel:
    - Hoja 1: Invitados (nombre, cedula, telefono, email)
    - Hoja 2: Acompañantes (nombre, cedula_invitado_principal)
    """
    
    if not file.filename.endswith(('.xlsx', '.xls')):
        raise HTTPException(
            status_code=400, 
            detail="El archivo debe ser un Excel (.xlsx o .xls)"
        )
    
    try:
        # Leer el archivo Excel
        contents = await file.read()
        excel_file = pd.ExcelFile(io.BytesIO(contents))
        
        # Verificar que existan las hojas necesarias
        if 'Invitados' not in excel_file.sheet_names:
            raise HTTPException(
                status_code=400, 
                detail="El archivo Excel debe contener una hoja llamada 'Invitados'"
            )
        
        # Leer hoja de invitados
        df_invitados = pd.read_excel(io.BytesIO(contents), sheet_name='Invitados')
        
        # Validar columnas requeridas para invitados
        required_cols_invitados = ['cedula', 'nombre', 'campana_area', 'eps', 'sede']
        missing_cols = [col for col in required_cols_invitados if col not in df_invitados.columns]
        if missing_cols:
            raise HTTPException(
                status_code=400,
                detail=f"Faltan columnas en la hoja 'Invitados': {missing_cols}"
            )
        
        # Procesar invitados
        invitados_creados = 0
        acompanantes_creados = 0
        
        for _, row in df_invitados.iterrows():
            # Verificar si el invitado ya existe
            existing_invitado = db.query(Invitado).filter(
                Invitado.cedula == str(row['cedula'])
            ).first()
            
            if not existing_invitado:
                invitado = Invitado(
                    nombre=str(row['nombre']),
                    cedula=str(row['cedula']),
                    campana_area=str(row['campana_area']) if pd.notna(row.get('campana_area')) else None,
                    eps=str(row['eps']) if pd.notna(row.get('eps')) else None,
                    sede=str(row['sede']) if pd.notna(row.get('sede')) else None,
                    estado_asistencia=False
                )
                db.add(invitado)
                invitados_creados += 1
        
        # Leer hoja de acompañantes si existe
        if 'Acompanantes' in excel_file.sheet_names:
            df_acompanantes = pd.read_excel(io.BytesIO(contents), sheet_name='Acompanantes')
            
            # Validar columnas requeridas para acompañantes
            required_cols_acompanantes = ['cedula', 'nombre', 'edad', 'parentesco', 'eps_acompanante', 'cedula_invitado_principal']
            missing_cols = [col for col in required_cols_acompanantes if col not in df_acompanantes.columns]
            if missing_cols:
                raise HTTPException(
                    status_code=400,
                    detail=f"Faltan columnas en la hoja 'Acompanantes': {missing_cols}"
                )
            
            # Commit los invitados primero para obtener sus IDs
            db.commit()
            
            for _, row in df_acompanantes.iterrows():
                # Buscar el invitado principal
                invitado_principal = db.query(Invitado).filter(
                    Invitado.cedula == str(row['cedula_invitado_principal'])
                ).first()
                
                if invitado_principal:
                    # Verificar si el acompañante ya existe
                    existing_acompanante = db.query(Acompanante).filter(
                        Acompanante.cedula == str(row['cedula'])
                    ).first()
                    
                    if not existing_acompanante:
                        # Convertir edad a entero si es posible
                        edad = None
                        if pd.notna(row.get('edad')):
                            try:
                                edad = int(row['edad'])
                            except (ValueError, TypeError):
                                edad = None
                        
                        acompanante = Acompanante(
                            nombre=str(row['nombre']),
                            cedula=str(row['cedula']),
                            edad=edad,
                            parentesco=str(row['parentesco']) if pd.notna(row.get('parentesco')) else None,
                            eps=str(row['eps_acompanante']) if pd.notna(row.get('eps_acompanante')) else None,
                            invitado_id=invitado_principal.id,
                            estado_asistencia=False
                        )
                        db.add(acompanante)
                        acompanantes_creados += 1
        
        # Commit final
        db.commit()
        
        return {
            "message": "Importación completada exitosamente",
            "invitados_creados": invitados_creados,
            "acompanantes_creados": acompanantes_creados
        }
        
    except pd.errors.EmptyDataError:
        raise HTTPException(
            status_code=400,
            detail="El archivo Excel está vacío"
        )
    except Exception as e:
        db.rollback()
        logger.error(f"Error durante la importación: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Error durante la importación: {str(e)}"
        )

@router.get("/export-template")
async def export_template():
    """
    Descargar plantilla Excel para importación de datos
    """
    # Crear un DataFrame de ejemplo para invitados
    df_invitados = pd.DataFrame({
        'cedula': ['12345678', '87654321', '11223344'],
        'nombre': ['Juan Pérez', 'María González', 'Carlos López'],
        'campana_area': ['Marketing Digital', 'Recursos Humanos', 'Ventas'],
        'eps': ['Sanitas', 'Nueva EPS', 'Compensar'],
        'sede': ['Sede Principal', 'Sede Norte', 'Sede Sur']
    })
    
    # Crear un DataFrame de ejemplo para acompañantes
    df_acompanantes = pd.DataFrame({
        'cedula': ['12345679', '87654322', '11223345'],
        'nombre': ['Ana Pérez', 'Carlos González', 'Rosa López'],
        'edad': [25, 30, 28],
        'parentesco': ['Esposa', 'Esposo', 'Hermana'],
        'eps_acompanante': ['Sanitas', 'Nueva EPS', 'Compensar'],
        'cedula_invitado_principal': ['12345678', '87654321', '11223344']
    })
    
    # Crear el archivo Excel en memoria
    output = io.BytesIO()
    with pd.ExcelWriter(output, engine='openpyxl') as writer:
        df_invitados.to_excel(writer, sheet_name='Invitados', index=False)
        df_acompanantes.to_excel(writer, sheet_name='Acompanantes', index=False)
    
    output.seek(0)
    
    from fastapi.responses import StreamingResponse
    
    return StreamingResponse(
        io.BytesIO(output.read()),
        media_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        headers={"Content-Disposition": "attachment; filename=plantilla_invitados.xlsx"}
    )
