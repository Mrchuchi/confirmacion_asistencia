from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from ..database import get_db
from ..models import Usuario
from ..schemas.auth import User, UserCreate
from ..utils.auth import get_password_hash, get_user_by_username

router = APIRouter(prefix="/usuarios", tags=["usuarios"])


@router.get('/', response_model=List[User])
async def list_usuarios(db: Session = Depends(get_db)):
    """Obtener lista de todos los usuarios"""
    usuarios = db.query(Usuario).all()
    return usuarios


@router.get('/{usuario_id}', response_model=User)
async def get_usuario(usuario_id: int, db: Session = Depends(get_db)):
    """Obtener un usuario por ID"""
    usuario = db.query(Usuario).filter(Usuario.id == usuario_id).first()
    if not usuario:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuario no encontrado"
        )
    return usuario


@router.post('/', response_model=User, status_code=status.HTTP_201_CREATED)
async def create_usuario(user_data: UserCreate, db: Session = Depends(get_db)):
    """Crear un nuevo usuario"""
    # Verificar si el username ya existe
    existing_user = get_user_by_username(db, user_data.username)
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El nombre de usuario ya existe"
        )
    
    # Crear el nuevo usuario
    hashed_password = get_password_hash(user_data.password)
    nuevo_usuario = Usuario(
        username=user_data.username,
        hashed_password=hashed_password,
        nombre_completo=user_data.nombre_completo
    )
    
    db.add(nuevo_usuario)
    db.commit()
    db.refresh(nuevo_usuario)
    
    return nuevo_usuario


@router.put('/{usuario_id}', response_model=User)
async def update_usuario(
    usuario_id: int,
    user_data: UserCreate,
    db: Session = Depends(get_db)
):
    """Actualizar un usuario existente"""
    usuario = db.query(Usuario).filter(Usuario.id == usuario_id).first()
    if not usuario:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuario no encontrado"
        )
    
    # Verificar si el username ya existe (excepto para el mismo usuario)
    existing_user = get_user_by_username(db, user_data.username)
    if existing_user and existing_user.id != usuario_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El nombre de usuario ya existe"
        )
    
    # Actualizar datos
    usuario.username = user_data.username
    usuario.nombre_completo = user_data.nombre_completo
    if user_data.password:  # Solo actualizar si se proporciona una nueva contraseña
        usuario.hashed_password = get_password_hash(user_data.password)
    
    db.commit()
    db.refresh(usuario)
    
    return usuario


@router.delete('/{usuario_id}', status_code=status.HTTP_204_NO_CONTENT)
async def delete_usuario(usuario_id: int, db: Session = Depends(get_db)):
    """Eliminar un usuario"""
    usuario = db.query(Usuario).filter(Usuario.id == usuario_id).first()
    if not usuario:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuario no encontrado"
        )
    
    db.delete(usuario)
    db.commit()
    
    return None

