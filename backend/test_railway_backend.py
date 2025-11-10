"""
Script para verificar que el backend en Railway funciona correctamente
"""
import requests
import json

def test_railway_backend():
    """Probar endpoints del backend en Railway"""
    
    print("🚀 VERIFICANDO BACKEND EN RAILWAY")
    print("=" * 50)
    
    # URL base - ajusta esto con tu URL real de Railway
    base_url = input("🔗 Ingresa la URL de tu backend en Railway (ej: https://tu-app.up.railway.app): ").strip()
    
    if not base_url:
        print("❌ URL requerida")
        return
    
    if base_url.endswith('/'):
        base_url = base_url[:-1]
    
    # Pruebas de endpoints
    tests = [
        {
            "name": "Root endpoint",
            "url": f"{base_url}/",
            "method": "GET"
        },
        {
            "name": "Health check",
            "url": f"{base_url}/health",
            "method": "GET"
        },
        {
            "name": "Auth test",
            "url": f"{base_url}/api/v1/auth/test",
            "method": "GET"
        },
        {
            "name": "Login OPTIONS (CORS test)",
            "url": f"{base_url}/api/v1/auth/login",
            "method": "OPTIONS"
        },
        {
            "name": "API docs",
            "url": f"{base_url}/docs",
            "method": "GET"
        }
    ]
    
    successful_tests = 0
    total_tests = len(tests)
    
    for test in tests:
        print(f"\n🧪 Probando: {test['name']}")
        print(f"   📍 {test['method']} {test['url']}")
        
        try:
            if test['method'] == 'GET':
                response = requests.get(test['url'], timeout=10)
            elif test['method'] == 'OPTIONS':
                response = requests.options(test['url'], timeout=10)
            
            print(f"   📊 Status: {response.status_code}")
            
            if response.status_code < 400:
                print(f"   ✅ SUCCESS")
                successful_tests += 1
                
                # Mostrar respuesta si es JSON
                try:
                    if 'application/json' in response.headers.get('content-type', ''):
                        data = response.json()
                        print(f"   📄 Respuesta: {json.dumps(data, indent=2)[:200]}...")
                except:
                    pass
            else:
                print(f"   ❌ FAILED: {response.status_code}")
                print(f"   📄 Error: {response.text[:200]}...")
        
        except requests.exceptions.ConnectionError:
            print(f"   ❌ CONNECTION ERROR: No se pudo conectar al servidor")
        except requests.exceptions.Timeout:
            print(f"   ⏰ TIMEOUT: El servidor tardó demasiado en responder")
        except Exception as e:
            print(f"   ❌ ERROR: {e}")
    
    # Resumen
    print("\n" + "=" * 50)
    print("📊 RESUMEN DE PRUEBAS")
    print("=" * 50)
    print(f"✅ Exitosas: {successful_tests}")
    print(f"❌ Fallidas: {total_tests - successful_tests}")
    print(f"📊 Total: {total_tests}")
    
    success_rate = (successful_tests / total_tests) * 100
    print(f"📈 Tasa de éxito: {success_rate:.1f}%")
    
    if success_rate >= 80:
        print("\n🎉 ¡Backend funcionando correctamente!")
    elif success_rate >= 60:
        print("\n⚠️ Backend funcionando parcialmente, revisa los errores")
    else:
        print("\n❌ Backend con problemas, necesita revisión")
    
    # Prueba específica de CORS
    print("\n🌐 PRUEBA ESPECÍFICA DE CORS")
    print("-" * 30)
    
    try:
        response = requests.options(
            f"{base_url}/api/v1/auth/login",
            headers={
                'Origin': 'https://tu-frontend.up.railway.app',
                'Access-Control-Request-Method': 'POST',
                'Access-Control-Request-Headers': 'Content-Type'
            },
            timeout=10
        )
        
        print(f"📊 Status: {response.status_code}")
        print(f"🔍 Headers CORS:")
        
        cors_headers = [
            'Access-Control-Allow-Origin',
            'Access-Control-Allow-Methods', 
            'Access-Control-Allow-Headers',
            'Access-Control-Allow-Credentials'
        ]
        
        for header in cors_headers:
            value = response.headers.get(header, 'No presente')
            print(f"   {header}: {value}")
        
        if response.status_code < 400:
            print("✅ CORS configurado correctamente")
        else:
            print("❌ Problemas con configuración CORS")
    
    except Exception as e:
        print(f"❌ Error probando CORS: {e}")

if __name__ == "__main__":
    test_railway_backend()
