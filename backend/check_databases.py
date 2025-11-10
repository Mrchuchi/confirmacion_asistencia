"""
Script para verificar el estado de las bases de datos local y Railway
"""
import os
from sqlalchemy import create_engine, text, inspect
from dotenv import load_dotenv

load_dotenv()

def check_database_status():
    """Verificar estado de ambas bases de datos"""
    
    print("🔍 VERIFICACIÓN DE BASES DE DATOS")
    print("=" * 50)
    
    # URLs de base de datos
    local_url = os.getenv("DATABASE_URL", "postgresql://username:password@localhost:5432/Asistencia")
    railway_url = (
        os.getenv("DATABASE_URL_RAILWAY") or 
        os.getenv("RAILWAY_DATABASE_URL") or 
        os.getenv("DATABASE_URL")
    )
    
    print(f"🔗 Local URL: {local_url[:60]}...")
    print(f"🚀 Railway URL: {railway_url[:60]}..." if railway_url else "❌ No encontrada")
    print()
    
    # Verificar base de datos local
    print("📊 BASE DE DATOS LOCAL")
    print("-" * 30)
    try:
        local_engine = create_engine(local_url)
        with local_engine.connect() as conn:
            print("✅ Conexión exitosa")
            
            # Verificar tablas y registros
            inspector = inspect(local_engine)
            tables = inspector.get_table_names()
            print(f"📋 Tablas encontradas: {tables}")
            
            for table in ["invitados", "acompanantes", "asistencias_log", "usuarios"]:
                if table in tables:
                    try:
                        result = conn.execute(text(f"SELECT COUNT(*) FROM {table}"))
                        count = result.scalar()
                        print(f"   📦 {table}: {count} registros")
                    except Exception as e:
                        print(f"   ⚠️ {table}: Error - {e}")
                else:
                    print(f"   ❌ {table}: No existe")
            
    except Exception as e:
        print(f"❌ Error conectando a base local: {e}")
    
    print()
    
    # Verificar base de datos Railway
    print("🚀 BASE DE DATOS RAILWAY")
    print("-" * 30)
    
    if not railway_url:
        print("❌ URL de Railway no configurada")
        print("💡 Configura DATABASE_URL en tu proyecto de Railway")
        return
    
    try:
        railway_engine = create_engine(railway_url)
        with railway_engine.connect() as conn:
            print("✅ Conexión exitosa")
            
            # Verificar tablas y registros
            inspector = inspect(railway_engine)
            tables = inspector.get_table_names()
            print(f"📋 Tablas encontradas: {tables}")
            
            if not tables:
                print("⚠️ No hay tablas creadas en Railway")
                print("💡 Ejecuta las migraciones primero: alembic upgrade head")
                return
            
            for table in ["invitados", "acompanantes", "asistencias_log", "usuarios"]:
                if table in tables:
                    try:
                        result = conn.execute(text(f"SELECT COUNT(*) FROM {table}"))
                        count = result.scalar()
                        print(f"   📦 {table}: {count} registros")
                    except Exception as e:
                        print(f"   ⚠️ {table}: Error - {e}")
                else:
                    print(f"   ❌ {table}: No existe")
            
    except Exception as e:
        print(f"❌ Error conectando a Railway: {e}")
        print("💡 Verifica que DATABASE_URL esté correctamente configurado en Railway")

if __name__ == "__main__":
    check_database_status()
