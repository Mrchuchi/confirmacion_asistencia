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
        invitados_saltados = 0
        acompanantes_creados = 0
        acompanantes_saltados = 0
        
        for _, row in df_invitados.iterrows():
            # Validar que la cédula no sea nula, vacía o 'nan'
            cedula_value = str(row['cedula']).strip()
            if not cedula_value or cedula_value.lower() == 'nan' or pd.isna(row['cedula']):
                logger.warning(f"Saltando invitado con cédula inválida: {row['cedula']} - Nombre: {row.get('nombre', 'N/A')}")
                invitados_saltados += 1
                continue
                
            # Limpiar cédula: quitar .0 si es un número decimal
            if cedula_value.endswith('.0'):
                cedula_value = cedula_value[:-2]
            
            # Verificar si el invitado ya existe
            existing_invitado = db.query(Invitado).filter(
                Invitado.cedula == cedula_value
            ).first()
            
            if not existing_invitado:
                invitado = Invitado(
                    nombre=str(row['nombre']),
                    cedula=cedula_value,
                    campana_area=str(row['campana_area']) if pd.notna(row.get('campana_area')) else None,
                    eps=str(row['eps']) if pd.notna(row.get('eps')) else None,
                    sede=str(row['sede']) if pd.notna(row.get('sede')) else None,
                    estado_asistencia=False
                )
                db.add(invitado)
                invitados_creados += 1
        
        # Leer hoja de acompañantes si existe
        sheet_names = excel_file.sheet_names
        logger.info(f"Hojas encontradas en el Excel: {sheet_names}")
        
        # Buscar hoja de acompañantes (aceptar variaciones comunes)
        acompanantes_sheet = None
        for sheet in sheet_names:
            if sheet.lower().strip() in ['acompanantes', 'acompañantes', 'acompanante', 'acompañante']:
                acompanantes_sheet = sheet
                break
        
        if acompanantes_sheet:
            df_acompanantes = pd.read_excel(io.BytesIO(contents), sheet_name=acompanantes_sheet)
            logger.info(f"Procesando hoja '{acompanantes_sheet}' con {len(df_acompanantes)} filas")
            
            logger.info(f"Columnas encontradas en 'Acompanantes': {list(df_acompanantes.columns)}")
            
            # Validar columnas requeridas para acompañantes
            required_cols_acompanantes = ['cedula', 'nombre', 'edad', 'parentesco', 'eps_acompanante', 'cedula_invitado_principal']
            missing_cols = [col for col in required_cols_acompanantes if col not in df_acompanantes.columns]
            if missing_cols:
                logger.warning(f"Columnas faltantes en 'Acompanantes': {missing_cols}")
                logger.info(f"Columnas disponibles: {list(df_acompanantes.columns)}")
                raise HTTPException(
                    status_code=400,
                    detail=f"Faltan columnas en la hoja 'Acompanantes': {missing_cols}. Columnas disponibles: {list(df_acompanantes.columns)}"
                )
            
            # Commit los invitados primero para obtener sus IDs
            db.commit()
            logger.info(f"Invitados commited. Procesando {len(df_acompanantes)} acompañantes...")
            
            for index, row in df_acompanantes.iterrows():
                logger.debug(f"Procesando fila {index}: {dict(row)}")
                
                # Validar que la cédula no sea nula, vacía o 'nan'
                cedula_value = str(row['cedula']).strip()
                if not cedula_value or cedula_value.lower() == 'nan' or pd.isna(row['cedula']):
                    logger.warning(f"Saltando acompañante fila {index} con cédula inválida: {row['cedula']} - Nombre: {row.get('nombre', 'N/A')}")
                    acompanantes_saltados += 1
                    continue
                
                # Limpiar cédula del acompañante: quitar .0 si es un número decimal
                if cedula_value.endswith('.0'):
                    cedula_value = cedula_value[:-2]
                
                # Validar cédula del invitado principal
                cedula_principal = str(row['cedula_invitado_principal']).strip()
                if not cedula_principal or cedula_principal.lower() == 'nan' or pd.isna(row['cedula_invitado_principal']):
                    logger.warning(f"Saltando acompañante fila {index} con cédula de invitado principal inválida: {row['cedula_invitado_principal']} - Nombre acompañante: {row.get('nombre', 'N/A')}")
                    acompanantes_saltados += 1
                    continue
                
                # Limpiar cédula del invitado principal: quitar .0 si es un número decimal
                if cedula_principal.endswith('.0'):
                    cedula_principal = cedula_principal[:-2]
                
                # Buscar el invitado principal
                invitado_principal = db.query(Invitado).filter(
                    Invitado.cedula == cedula_principal
                ).first()
                
                if not invitado_principal:
                    logger.warning(f"No se encontró invitado principal con cédula {cedula_principal} para acompañante {row.get('nombre', 'N/A')}")
                    acompanantes_saltados += 1
                    continue
                
                # Verificar si el acompañante ya existe
                existing_acompanante = db.query(Acompanante).filter(
                    Acompanante.cedula == cedula_value
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
                        cedula=cedula_value,
                        edad=edad,
                        parentesco=str(row['parentesco']) if pd.notna(row.get('parentesco')) else None,
                        eps=str(row['eps_acompanante']) if pd.notna(row.get('eps_acompanante')) else None,
                        invitado_id=invitado_principal.id,
                        estado_asistencia=False
                    )
                    db.add(acompanante)
                    acompanantes_creados += 1
                    logger.debug(f"Acompañante creado: {row['nombre']} (cedula: {cedula_value})")
                else:
                    logger.debug(f"Acompañante ya existe: {row['nombre']} (cedula: {cedula_value})")
                    acompanantes_saltados += 1
        
        # Commit final
        db.commit()
        
        logger.info(f"Importación completada: {invitados_creados} invitados creados, {invitados_saltados} invitados saltados, {acompanantes_creados} acompañantes creados, {acompanantes_saltados} acompañantes saltados")
        
        return {
            "message": "Importación completada exitosamente",
            "invitados_creados": invitados_creados,
            "invitados_saltados": invitados_saltados,
            "acompanantes_creados": acompanantes_creados,
            "acompanantes_saltados": acompanantes_saltados,
            "hojas_procesadas": [sheet for sheet in sheet_names if sheet.lower().strip() in ['invitados', 'invitados'] + [acompanantes_sheet.lower().strip() if acompanantes_sheet else '']]
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
