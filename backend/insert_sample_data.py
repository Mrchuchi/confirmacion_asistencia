#!/usr/bin/env python3
"""Script para insertar datos de ejemplo en la base de datos"""

from app.database import engine
from sqlalchemy import text
import sys

def insert_sample_data():
    """Inserta datos de ejemplo en las tablas"""
    try:
        with engine.connect() as conn:
            # Insertar invitados
            print("📝 Insertando invitados de ejemplo...")
            invitados_sql = """
            INSERT INTO invitados (nombre, cedula) VALUES 
                ('Juan Pérez', '12345678'),
                ('María García', '87654321'),
                ('Carlos López', '11223344'),
                ('Ana Martínez', '55667788')
            ON CONFLICT (cedula) DO NOTHING;
            """
            conn.execute(text(invitados_sql))
            
            # Insertar acompañantes
            print("● Insertando acompañantes de ejemplo...")
            acompanantes_sql = """
            INSERT INTO acompanantes (invitado_id, nombre, cedula) VALUES 
                (1, 'Carmen Pérez', '12345679'),
                (1, 'Pedro Pérez', '12345680'),
                (2, 'Luis García', '87654322'),
                (3, 'Rosa López', '11223345')
            ON CONFLICT (cedula) DO NOTHING;
            """
            conn.execute(text(acompanantes_sql))
            
            # Confirmar cambios
            conn.commit()
            
            # Verificar datos insertados
            print("\n✅ Verificando datos insertados:")
            
            # Contar invitados
            result = conn.execute(text("SELECT COUNT(*) FROM invitados"))
            invitados_count = result.scalar()
            print(f"  📊 Invitados: {invitados_count}")
            
            # Contar acompañantes
            result = conn.execute(text("SELECT COUNT(*) FROM acompanantes"))
            acompanantes_count = result.scalar()
            print(f"  📊 Acompañantes: {acompanantes_count}")
            
            # Mostrar algunos ejemplos
            print("\n🔍 Ejemplos de datos:")
            result = conn.execute(text("""
                SELECT i.nombre, i.cedula, 
                       COALESCE(COUNT(a.id), 0) as acompanantes
                FROM invitados i
                LEFT JOIN acompanantes a ON i.id = a.invitado_id
                GROUP BY i.id, i.nombre, i.cedula
                ORDER BY i.nombre
            """))
            
            for row in result:
                print(f"  👤 {row[0]} (CI: {row[1]}) - {row[2]} acompañante(s)")
            
            return True
            
    except Exception as e:
        print(f"❌ Error insertando datos: {e}")
        return False

if __name__ == "__main__":
    print("🔄 Insertando datos de ejemplo en la base de datos...")
    
    success = insert_sample_data()
    
    if success:
        print("\n🎉 ¡Datos de ejemplo insertados exitosamente!")
        print("\n🚀 Ahora puedes probar el sistema:")
        print("  • Backend: http://localhost:8000")
        print("  • API Docs: http://localhost:8000/docs")
        print("  • Prueba buscar: 'Juan', '12345678', 'María García'")
    else:
        print("\n❌ Error al insertar datos de ejemplo")
