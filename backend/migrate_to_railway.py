"""
Script para migrar datos de base de datos local a Railway
"""
import os
import sys
from sqlalchemy import create_engine, text, inspect
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv
import json
from datetime import datetime

# Cargar variables de entorno
load_dotenv()

def get_database_urls():
    """Obtener URLs de bases de datos local y Railway"""
    local_url = os.getenv("DATABASE_URL", "postgresql://username:password@localhost:5432/Asistencia")
    
    # Railway puede usar diferentes nombres para la variable
    railway_url = (
        os.getenv("DATABASE_URL_RAILWAY") or 
        os.getenv("RAILWAY_DATABASE_URL") or 
        os.getenv("DATABASE_URL")  # En Railway, esta es la principal
    )
    
    print(f"🔗 Base de datos local: {local_url[:50]}...")
    print(f"🚀 Base de datos Railway: {railway_url[:50]}..." if railway_url else "❌ No encontrada")
    
    return local_url, railway_url

def check_connection(url, name):
    """Verificar conexión a base de datos"""
    try:
        engine = create_engine(url)
        with engine.connect() as conn:
            result = conn.execute(text("SELECT 1"))
            print(f"✅ Conexión exitosa a {name}")
            return engine
    except Exception as e:
        print(f"❌ Error conectando a {name}: {e}")
        return None

def check_table_exists(engine, table_name):
    """Verificar si una tabla existe"""
    inspector = inspect(engine)
    tables = inspector.get_table_names()
    return table_name in tables

def get_table_count(engine, table_name):
    """Obtener cantidad de registros en una tabla"""
    try:
        with engine.connect() as conn:
            result = conn.execute(text(f"SELECT COUNT(*) FROM {table_name}"))
            return result.scalar()
    except Exception as e:
        print(f"⚠️ Error contando registros en {table_name}: {e}")
        return 0

def create_tables_in_railway(railway_engine):
    """Crear estructura de tablas en Railway"""
    print("🏗️ Creando estructura de base de datos en Railway...")
    
    try:
        # Importar modelos para crear las tablas
        from app.database import Base
        from app import models
        
        # Crear todas las tablas
        Base.metadata.create_all(bind=railway_engine)
        print("✅ Estructura de tablas creada exitosamente")
        
        # Verificar que las tablas se crearon
        inspector = inspect(railway_engine)
        tables = inspector.get_table_names()
        print(f"📋 Tablas creadas: {tables}")
        
        return True
    except Exception as e:
        print(f"❌ Error creando tablas: {e}")
        return False

def migrate_table_data(local_engine, railway_engine, table_name, columns):
    """Migrar datos de una tabla específica"""
    print(f"📦 Migrando tabla: {table_name}")
    
    try:
        with local_engine.connect() as local_conn:
            with railway_engine.connect() as railway_conn:
                # Obtener datos de la tabla local
                select_query = f"SELECT {', '.join(columns)} FROM {table_name}"
                local_data = local_conn.execute(text(select_query)).fetchall()
                
                if not local_data:
                    print(f"ℹ️ No hay datos en {table_name}")
                    return 0
                
                print(f"📊 Encontrados {len(local_data)} registros en {table_name}")
                
                # Preparar query de inserción
                placeholders = ', '.join([f':{col}' for col in columns])
                insert_query = f"""
                    INSERT INTO {table_name} ({', '.join(columns)})
                    VALUES ({placeholders})
                    ON CONFLICT (id) DO UPDATE SET
                    {', '.join([f'{col} = EXCLUDED.{col}' for col in columns if col != 'id'])}
                """
                
                # Insertar datos
                migrated_count = 0
                for row in local_data:
                    try:
                        row_dict = row._asdict() if hasattr(row, '_asdict') else dict(row)
                        railway_conn.execute(text(insert_query), row_dict)
                        migrated_count += 1
                    except Exception as e:
                        print(f"⚠️ Error migrando registro: {e}")
                
                railway_conn.commit()
                print(f"✅ {migrated_count} registros migrados en {table_name}")
                return migrated_count
                
    except Exception as e:
        print(f"❌ Error migrando {table_name}: {e}")
        return 0

def main():
    """Función principal de migración"""
    print("🚀 Iniciando migración de datos a Railway...")
    print("=" * 50)
    
    # Obtener URLs
    local_url, railway_url = get_database_urls()
    
    if not railway_url:
        print("❌ No se encontró la URL de Railway. Verifica tus variables de entorno.")
        print("Asegúrate de tener DATABASE_URL configurado en Railway.")
        return
    
    # Verificar conexiones
    local_engine = check_connection(local_url, "Local")
    railway_engine = check_connection(railway_url, "Railway")
    
    if not local_engine or not railway_engine:
        print("❌ No se pudo establecer conexión a las bases de datos.")
        return
    
    # Crear estructura en Railway
    if not create_tables_in_railway(railway_engine):
        return
    
    # Definir tablas y sus columnas para migrar
    tables_to_migrate = [
        ("invitados", [
            "id", "nombre", "cedula", "campana_area", "eps", "sede", 
            "estado_asistencia", "created_at", "updated_at"
        ]),
        ("acompanantes", [
            "id", "nombre", "cedula", "edad", "parentesco", "eps", 
            "invitado_id", "estado_asistencia", "created_at", "updated_at"
        ]),
        ("asistencias_log", [
            "id", "persona_id", "tipo", "timestamp"
        ]),
        ("usuarios", [
            "id", "username", "hashed_password", "nombre_completo", 
            "created_at", "updated_at"
        ])
    ]
    
    # Migrar cada tabla
    total_migrated = 0
    print("\n📦 Iniciando migración de datos...")
    print("-" * 30)
    
    for table_name, columns in tables_to_migrate:
        # Verificar si la tabla existe en local
        if not check_table_exists(local_engine, table_name):
            print(f"⚠️ Tabla {table_name} no existe en base local")
            continue
        
        # Verificar si la tabla existe en Railway
        if not check_table_exists(railway_engine, table_name):
            print(f"⚠️ Tabla {table_name} no existe en Railway")
            continue
        
        # Mostrar estadísticas antes de migrar
        local_count = get_table_count(local_engine, table_name)
        railway_count = get_table_count(railway_engine, table_name)
        
        print(f"\n📊 {table_name}:")
        print(f"   Local: {local_count} registros")
        print(f"   Railway: {railway_count} registros")
        
        if local_count > 0:
            migrated = migrate_table_data(local_engine, railway_engine, table_name, columns)
            total_migrated += migrated
        else:
            print(f"   ⏭️ No hay datos para migrar")
    
    # Mostrar resumen final
    print("\n" + "=" * 50)
    print("📊 RESUMEN DE MIGRACIÓN")
    print("=" * 50)
    
    for table_name, _ in tables_to_migrate:
        if check_table_exists(railway_engine, table_name):
            railway_count = get_table_count(railway_engine, table_name)
            print(f"✅ {table_name}: {railway_count} registros")
    
    print(f"\n🎉 Migración completada! Total de registros migrados: {total_migrated}")
    print("🌐 Tu aplicación en Railway ahora debería tener todos los datos.")

if __name__ == "__main__":
    main()
