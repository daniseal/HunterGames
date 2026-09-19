#!/usr/bin/env python3
"""
====================================================================
HUNTER GAMES — UTILIDAD DE LIMPIEZA DE CACHÉ Y DIAGNÓSTICO (PYTHON)
====================================================================
Este script permite a los desarrolladores y usuarios:
1. Eliminar archivos temporales y directorios __pycache__
2. Purgar caché de desarrollo local
3. Iniciar un servidor HTTP local con cabeceras estrictas "No-Cache"
====================================================================
"""

import os
import sys
import shutil
import http.server
import socketserver
from pathlib import Path

# Compatibilidad UTF-8 en Windows
if hasattr(sys.stdout, 'reconfigure'):
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

PORT = 5501
DIRECTORY = Path(__file__).parent.resolve()

class NoCacheHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    """Manejador HTTP que deshabilita por completo la caché del navegador."""
    def end_headers(self):
        self.send_header('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0')
        self.send_header('Pragma', 'no-cache')
        self.send_header('Expires', '0')
        super().end_headers()

def clean_local_temp_files():
    """Elimina carpetas temporales de Python y cachés locales."""
    print("\n[HunterGames] Limpiando archivos temporales y caches locales...")
    cleaned = 0
    for root, dirs, files in os.walk(DIRECTORY):
        for d in dirs:
            if d in ('__pycache__', '.pytest_cache', '.mypy_cache'):
                full_path = os.path.join(root, d)
                try:
                    shutil.rmtree(full_path)
                    print(f"  [OK] Eliminado directorio de cache: {full_path}")
                    cleaned += 1
                except Exception as e:
                    print(f"  [X] No se pudo eliminar {full_path}: {e}")
        for f in files:
            if f.endswith(('.pyc', '.pyo', '.tmp')):
                full_file = os.path.join(root, f)
                try:
                    os.remove(full_file)
                    print(f"  [OK] Eliminado archivo temporal: {full_file}")
                    cleaned += 1
                except Exception as e:
                    print(f"  [X] No se pudo eliminar {full_file}: {e}")
    print(f"[HunterGames] Exito: Limpieza completada. {cleaned} elementos purgados.\n")

def run_dev_server():
    """Ejecuta un servidor local con recarga sin caché."""
    os.chdir(DIRECTORY)
    handler = NoCacheHTTPRequestHandler
    
    print("===============================================================")
    print(" SERVIDOR HUNTER GAMES CON CACHE DESACTIVADA")
    print("===============================================================")
    print(f" URL: http://localhost:{PORT}")
    print(f" Directorio: {DIRECTORY}")
    print(" Todas las respuestas HTTP incluyen 'Cache-Control: no-store'")
    print(" Presiona CTRL+C para detener el servidor")
    print("===============================================================\n")

    try:
        with socketserver.TCPServer(("", PORT), handler) as httpd:
            httpd.serve_forever()
    except KeyboardInterrupt:
        print("\n[HunterGames] Servidor detenido.")
    except OSError as e:
        if e.errno == 98 or "address already in use" in str(e).lower() or "solo se permite un uso" in str(e).lower():
            print(f"[HunterGames] Aviso: El puerto {PORT} ya esta en uso (probablemente por Live Server).")
            print("[HunterGames] Puedes acceder a tu sitio en tu Live Server habitual.")
        else:
            print(f"[HunterGames] Error al iniciar el servidor: {e}")

if __name__ == '__main__':
    clean_local_temp_files()
    
    if len(sys.argv) > 1 and sys.argv[1] == '--server':
        run_dev_server()
    else:
        print("Para iniciar el servidor de desarrollo sin cache, ejecuta:")
        print("   python limpiar_cache.py --server\n")
