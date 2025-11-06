#!/usr/bin/env python3
"""Script para corregir valores NULL en estado_asistencia"""

from app.database import engine
from sqlalchemy import text
import sys

def fix_null_estados():
    """Corrige los valores NULL en estado_asistencia"""
    try:
        with engine.connect() as conn:
            print("🔧 Corrigiendo valores NULL en estado_asistencia...")
            
            # Actualizar invitados
            result = conn.execute(text("""
                UPDATE invitados 
                SET estado_asistencia = FALSE 
                WHERE estado_asistencia IS NULL
            """))
            invitados_updated = result.rowcount
            
            # Actualizar acompañantes
            result = conn.execute(text("""
                UPDATE acompanantes 
                SET estado_asistencia = FALSE 
                WHERE estado_asistencia IS NULL
            """))
            acompanantes_updated = result.rowcount
            
            # Confirmar cambios
            conn.commit()
            
            print(f"✅ Actualizados {invitados_updated} invitados")
            print(f"✅ Actualizados {acompanantes_updated} acompañantes")
            
            # Verificar que no hay más valores NULL
            result = conn.execute(text("""
                SELECT COUNT(*) FROM invitados WHERE estado_asistencia IS NULL
            """))
            null_invitados = result.scalar()
            
            result = conn.execute(text("""
                SELECT COUNT(*) FROM acompanantes WHERE estado_asistencia IS NULL
            """))
            null_acompanantes = result.scalar()
            
            if null_invitados == 0 and null_acompanantes == 0:
                print("🎉 ¡Todos los valores NULL han sido corregidos!")
                return True
            else:
                print(f"⚠️  Quedan {null_invitados} invitados y {null_acompanantes} acompañantes con valores NULL")
                return False
                
    except Exception as e:
        print(f"❌ Error corrigiendo valores NULL: {e}")
        return False

if __name__ == "__main__":
    print("🔍 Verificando y corrigiendo base de datos...")
    
    success = fix_null_estados()
    
    if success:
        print("\n🚀 ¡Base de datos corregida! Ahora puedes probar la búsqueda nuevamente.")
    else:
        print("\n❌ Error al corregir la base de datos")
