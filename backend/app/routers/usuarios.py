from fastapi import APIRouter, HTTPException, status
from typing import List

router = APIRouter()

@router.get('/usuarios/health', status_code=status.HTTP_200_OK)
async def usuarios_health():
    """Health check for usuarios router."""
    return {"status": "ok", "router": "usuarios"}

@router.get('/usuarios', response_model=List[dict])
async def list_usuarios():
    """Return an empty list placeholder for usuarios.
    Replace with actual implementation that queries the database/models.
    """
    return []

@router.get('/usuarios/{usuario_id}', response_model=dict)
async def get_usuario(usuario_id: int):
    """Placeholder get usuario by id.
    Raise 404 to indicate not found (placeholder behavior).
    """
    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail='Usuario not found')
