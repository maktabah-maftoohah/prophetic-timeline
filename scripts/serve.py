import http.server
import socketserver
import argparse
import sys
import os
import webbrowser
from pathlib import Path
import threading
import time

def run(port=8000, open_browser=True):
    # Always serve from the repository root directory
    root_dir = Path(__file__).resolve().parent.parent
    os.chdir(root_dir)

    handler = http.server.SimpleHTTPRequestHandler
    handler.extensions_map.update({
        '.js': 'application/javascript',
        '.json': 'application/json',
        '.webmanifest': 'application/manifest+json',
        '.css': 'text/css',
        '.html': 'text/html'
    })

    socketserver.TCPServer.allow_reuse_address = True

    # Try requested port or fallback to next available port if 8000 is occupied
    actual_port = port
    max_tries = 10
    httpd = None
    for offset in range(max_tries):
        try:
            actual_port = port + offset
            httpd = socketserver.TCPServer(("", actual_port), handler)
            break
        except OSError:
            continue

    if httpd is None:
        print(f"Error: Could not bind to any port in range {port}-{port+max_tries-1}")
        sys.exit(1)

    url = f"http://localhost:{actual_port}/"
    print(f"\n==================================================")
    print(f"  Prophetic Timeline & Calendar (Maktabah Maftoohah)")
    print(f"  Serving locally at: {url}")
    print(f"  Press Ctrl+C to stop the server.")
    print(f"==================================================\n")

    if open_browser:
        def _open():
            time.sleep(0.5)
            try:
                webbrowser.open(url)
            except Exception as e:
                print(f"Notice: Could not automatically open browser ({e}). Please visit {url}")
        threading.Thread(target=_open, daemon=True).start()

    with httpd:
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nServer stopped.")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Serve Prophetic Timeline locally")
    parser.add_argument("--port", type=int, default=8000)
    parser.add_argument("--no-browser", action="store_true", help="Do not open browser automatically")
    args = parser.parse_args()
    run(port=args.port, open_browser=not args.no_browser)
