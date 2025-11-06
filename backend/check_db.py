#!/usr/bin/env python3
"""Script para verificar y crear tablas en la base de datos"""

from app.database import engine
from sqlalchemy import text
import sys

def check_tables():
    """Verifica qué tablas existen en la base de datos"""
    try:
        with engine.connect() as conn:
            result = conn.execute(text("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'"))
            tables = [row[0] for row in result]
            
            if tables:
                print("✅ Tablas encontradas en la base de datos:")
                for table in sorted(tables):
                    print(f"  - {table}")
            else:
                print("❌ No se encontraron tablas en la base de datos 'Asistencia'")
                print("\n📝 Para crear las tablas, ejecuta el archivo database/schema.sql en tu cliente PostgreSQL")
                
            return len(tables) > 0
            
    except Exception as e:
        print(f"❌ Error de conexión a la base de datos: {e}")
        return False

def create_tables():
    """Crea las tablas usando SQLAlchemy"""
    try:
        from app.models import Base
        
        print("🔄 Creando tablas...")
        Base.metadata.create_all(bind=engine)
        print("✅ Tablas creadas exitosamente")
        return True
        
    except Exception as e:
        print(f"❌ Error creando tablas: {e}")
        return False

if __name__ == "__main__":
    print("🔍 Verificando base de datos...")
    
    # Verificar tablas existentes
    tables_exist = check_tables()
    
    if not tables_exist:
        print("\n🛠️  ¿Deseas crear las tablas ahora? (s/n): ", end="")
        response = input().lower().strip()
        
        if response in ['s', 'si', 'y', 'yes']:
            create_tables()
            check_tables()  # Verificar nuevamente
        else:
            print("\n📋 Para crear las tablas manualmente, ejecuta:")
            print("   1. Abre tu cliente PostgreSQL (pgAdmin, etc.)")
            print("   2. Conecta a la base de datos 'Asistencia'")
            print("   3. Ejecuta el contenido del archivo database/schema.sql")
