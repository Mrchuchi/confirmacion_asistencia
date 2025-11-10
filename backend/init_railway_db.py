"""
Script para crear la estructura de base de datos en Railway
"""
import os
from sqlalchemy import create_engine, text
from dotenv import load_dotenv

load_dotenv()

def init_railway_database():
    """Inicializar estructura de base de datos en Railway"""
    
    print("🏗️ INICIALIZACIÓN DE BASE DE DATOS EN RAILWAY")
    print("=" * 50)
    
    # Obtener URL de Railway
    railway_url = (
        os.getenv("DATABASE_URL_RAILWAY") or 
        os.getenv("RAILWAY_DATABASE_URL") or 
        os.getenv("DATABASE_URL")
    )
    
    if not railway_url:
        print("❌ No se encontró la URL de Railway")
        print("💡 Asegúrate de tener DATABASE_URL configurado en Railway")
        return False
    
    print(f"🔗 Conectando a: {railway_url[:60]}...")
    
    try:
        # Crear engine
        engine = create_engine(railway_url)
        
        # Verificar conexión
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
            print("✅ Conexión establecida exitosamente")
        
        print("🏗️ Creando estructura de base de datos...")
        
        # Importar modelos y crear tablas
        from app.database import Base
        from app import models  # Esto registra todos los modelos
        
        # Crear todas las tablas
        Base.metadata.create_all(bind=engine)
        
        print("✅ Estructura de base de datos creada")
        
        # Verificar que las tablas se crearon
        from sqlalchemy import inspect
        inspector = inspect(engine)
        tables = inspector.get_table_names()
        
        print(f"📋 Tablas creadas: {tables}")
        
        # Verificar tablas específicas que esperamos
        expected_tables = ["invitados", "acompanantes", "asistencias_log", "usuarios"]
        for table in expected_tables:
            if table in tables:
                print(f"   ✅ {table}")
            else:
                print(f"   ❌ {table} - No creada")
        
        print("\n🎉 Inicialización completada exitosamente!")
        print("💡 Ahora puedes ejecutar el script de migración de datos")
        
        return True
        
    except Exception as e:
        print(f"❌ Error durante la inicialización: {e}")
        return False

if __name__ == "__main__":
    success = init_railway_database()
    if success:
        print("\n📌 PRÓXIMOS PASOS:")
        print("1. Ejecutar: python migrate_to_railway.py")
        print("2. Verificar con: python check_databases.py")
    else:
        print("\n💡 SOLUCIÓN DE PROBLEMAS:")
        print("1. Verifica que DATABASE_URL esté configurado en Railway")
        print("2. Asegúrate de que la base de datos esté disponible")
        print("3. Verifica las credenciales de conexión")
