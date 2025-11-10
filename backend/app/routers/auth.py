from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from datetime import timedelta
from ..database import get_db
from ..schemas.auth import UserLogin, Token, User
from ..utils.auth import (
    authenticate_user, 
    create_access_token, 
    verify_token, 
    get_user_by_username,
    ACCESS_TOKEN_EXPIRE_HOURS
)

router = APIRouter(prefix="/auth", tags=["authentication"])
security = HTTPBearer()


@router.options("/login")
async def login_options():
    """Manejar peticiones OPTIONS para login"""
    return {"message": "OK"}


@router.get("/test")
async def auth_test():
    """Endpoint de prueba para verificar que auth funciona"""
    return {
        "message": "Auth router funcionando correctamente",
        "endpoints": ["/login", "/verify-token", "/me"]
    }


@router.post("/login", response_model=Token)
async def login(user_login: UserLogin, db: Session = Depends(get_db)):
    """Iniciar sesión"""
    user = authenticate_user(db, user_login.username, user_login.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Username o contraseña incorrectos",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(hours=ACCESS_TOKEN_EXPIRE_HOURS)
    access_token = create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer"
    }


@router.get("/me", response_model=User)
async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
):
    """Obtener información del usuario actual"""
    token_data = verify_token(credentials.credentials)
    if token_data is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token inválido",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    user = get_user_by_username(db, token_data.username)
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Usuario no encontrado"
        )
    
    return user


@router.post("/verify")
async def verify_auth_token(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
):
    """Verificar si el token es válido"""
    token_data = verify_token(credentials.credentials)
    if token_data is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token inválido"
        )
    
    user = get_user_by_username(db, token_data.username)
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Usuario no encontrado"
        )
    
    return {
        "valid": True,
        "user": {
            "id": user.id,
            "username": user.username,
            "nombre_completo": user.nombre_completo
        }
    }
