"""
Script para crear datos de prueba en la base de datos
"""
import os
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv
from datetime import datetime
import bcrypt

load_dotenv()

def create_sample_data():
    """Crear datos de prueba en la base de datos"""
    
    print("📊 CREANDO DATOS DE PRUEBA")
    print("=" * 50)
    
    # Usar base de datos local para crear datos
    database_url = os.getenv("DATABASE_URL", "postgresql://username:password@localhost:5432/Asistencia")
    
    print(f"🔗 Conectando a: {database_url[:60]}...")
    
    try:
        engine = create_engine(database_url)
        
        with engine.connect() as conn:
            print("✅ Conexión establecida")
            
            # Crear usuario administrador
            print("👤 Creando usuario administrador...")
            
            # Hash de la contraseña "admin123"
            password = "admin123"
            hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
            
            conn.execute(text("""
                INSERT INTO usuarios (username, hashed_password, nombre_completo, created_at, updated_at)
                VALUES ('admin', :hashed_password, 'Administrador del Sistema', NOW(), NOW())
                ON CONFLICT (username) DO UPDATE SET 
                    hashed_password = EXCLUDED.hashed_password,
                    updated_at = NOW()
            """), {"hashed_password": hashed_password})
            
            print("✅ Usuario admin creado (contraseña: admin123)")
            
            # Crear invitados de prueba
            print("👥 Creando invitados de prueba...")
            
            invitados_data = [
                {
                    "nombre": "Juan Carlos Pérez",
                    "cedula": "12345678",
                    "campana_area": "Ventas Región Norte",
                    "eps": "Sanitas",
                    "sede": "Sede Principal"
                },
                {
                    "nombre": "María Elena Rodríguez",
                    "cedula": "23456789",
                    "campana_area": "Soporte Técnico",
                    "eps": "Nueva EPS",
                    "sede": "Sede Norte"
                },
                {
                    "nombre": "Carlos Andrés Gómez",
                    "cedula": "34567890",
                    "campana_area": "Marketing Digital",
                    "eps": "Compensar",
                    "sede": "Sede Principal"
                },
                {
                    "nombre": "Ana Sofía Martínez",
                    "cedula": "45678901",
                    "campana_area": "Recursos Humanos",
                    "eps": "Sanitas",
                    "sede": "Sede Sur"
                },
                {
                    "nombre": "Luis Fernando Torres",
                    "cedula": "56789012",
                    "campana_area": "Contabilidad",
                    "eps": "Sura",
                    "sede": "Sede Principal"
                }
            ]
            
            for i, invitado in enumerate(invitados_data, 1):
                conn.execute(text("""
                    INSERT INTO invitados (id, nombre, cedula, campana_area, eps, sede, estado_asistencia, created_at, updated_at)
                    VALUES (:id, :nombre, :cedula, :campana_area, :eps, :sede, false, NOW(), NOW())
                    ON CONFLICT (id) DO UPDATE SET 
                        nombre = EXCLUDED.nombre,
                        cedula = EXCLUDED.cedula,
                        campana_area = EXCLUDED.campana_area,
                        eps = EXCLUDED.eps,
                        sede = EXCLUDED.sede,
                        updated_at = NOW()
                """), {**invitado, "id": i})
            
            print(f"✅ {len(invitados_data)} invitados creados")
            
            # Crear acompañantes de prueba
            print("👨‍👩‍👧‍👦 Creando acompañantes de prueba...")
            
            acompanantes_data = [
                {
                    "id": 1,
                    "nombre": "Carmen Pérez de Pérez",
                    "cedula": "87654321",
                    "edad": 45,
                    "parentesco": "Esposa",
                    "eps": "Sanitas",
                    "invitado_id": 1
                },
                {
                    "id": 2,
                    "nombre": "Sofía Pérez Torres",
                    "cedula": "98765432",
                    "edad": 16,
                    "parentesco": "Hija",
                    "eps": "Sanitas",
                    "invitado_id": 1
                },
                {
                    "id": 3,
                    "nombre": "Roberto Rodríguez Sánchez",
                    "cedula": "13579246",
                    "edad": 52,
                    "parentesco": "Esposo",
                    "eps": "Nueva EPS",
                    "invitado_id": 2
                },
                {
                    "id": 4,
                    "nombre": "Isabella Gómez Herrera",
                    "cedula": "24681357",
                    "edad": 28,
                    "parentesco": "Esposa",
                    "eps": "Compensar",
                    "invitado_id": 3
                }
            ]
            
            for acompanante in acompanantes_data:
                conn.execute(text("""
                    INSERT INTO acompanantes (id, nombre, cedula, edad, parentesco, eps, invitado_id, estado_asistencia, created_at, updated_at)
                    VALUES (:id, :nombre, :cedula, :edad, :parentesco, :eps, :invitado_id, false, NOW(), NOW())
                    ON CONFLICT (id) DO UPDATE SET 
                        nombre = EXCLUDED.nombre,
                        cedula = EXCLUDED.cedula,
                        edad = EXCLUDED.edad,
                        parentesco = EXCLUDED.parentesco,
                        eps = EXCLUDED.eps,
                        invitado_id = EXCLUDED.invitado_id,
                        updated_at = NOW()
                """), acompanante)
            
            print(f"✅ {len(acompanantes_data)} acompañantes creados")
            
            # Crear algunos logs de asistencia de prueba
            print("📋 Creando logs de asistencia de prueba...")
            
            logs_data = [
                {"id": 1, "persona_id": 1, "tipo": "principal"},
                {"id": 2, "persona_id": 1, "tipo": "acompanante"},
                {"id": 3, "persona_id": 2, "tipo": "principal"}
            ]
            
            for log in logs_data:
                conn.execute(text("""
                    INSERT INTO asistencias_log (id, persona_id, tipo, timestamp)
                    VALUES (:id, :persona_id, :tipo, NOW())
                    ON CONFLICT (id) DO UPDATE SET 
                        persona_id = EXCLUDED.persona_id,
                        tipo = EXCLUDED.tipo,
                        timestamp = NOW()
                """), log)
            
            print(f"✅ {len(logs_data)} logs de asistencia creados")
            
            # Confirmar cambios
            conn.commit()
            
            print("\n🎉 DATOS DE PRUEBA CREADOS EXITOSAMENTE!")
            print("=" * 50)
            
            # Mostrar resumen
            print("📊 RESUMEN:")
            print(f"   👤 Usuarios: 1 (admin/admin123)")
            print(f"   👥 Invitados: {len(invitados_data)}")
            print(f"   👨‍👩‍👧‍👦 Acompañantes: {len(acompanantes_data)}")
            print(f"   📋 Logs: {len(logs_data)}")
            
            print("\n💡 PRÓXIMOS PASOS:")
            print("1. Verificar datos: python check_databases.py")
            print("2. Migrar a Railway: python migrate_to_railway.py")
            
            return True
            
    except Exception as e:
        print(f"❌ Error creando datos de prueba: {e}")
        return False

if __name__ == "__main__":
    create_sample_data()
