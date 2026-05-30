"""
backend/index.py — Uvicorn entry point
=======================================
Imports the enterprise app factory from src/main.py.
Run with: python index.py  OR  uvicorn index:app --reload
"""
import os
import sys

# Fix Windows cp1252 encoding — allows unicode chars in log output
os.environ.setdefault("PYTHONIOENCODING", "utf-8")
if sys.stdout.encoding and sys.stdout.encoding.lower() != "utf-8":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
        sys.stderr.reconfigure(encoding="utf-8")
    except Exception:
        pass

PORT = 8000

def _free_port(port: int) -> None:
    """Kill any process holding the given port before binding."""
    import subprocess, platform
    if platform.system() == "Windows":
        try:
            result = subprocess.run(
                ["netstat", "-ano"],
                capture_output=True, text=True
            )
            for line in result.stdout.splitlines():
                if f":{port}" in line and "LISTENING" in line:
                    parts = line.split()
                    pid = int(parts[-1])
                    if pid != os.getpid():
                        subprocess.run(["taskkill", "/F", "/PID", str(pid)],
                                       capture_output=True)
                        print(f"Freed port {port} (killed PID {pid})")
        except Exception as e:
            print(f"Warning: could not auto-free port {port}: {e}")

print("Starting index.py...")
from src.main import create_app
print("Imported create_app, creating app...")
app = create_app()
print("App created successfully.")

if __name__ == "__main__":
    _free_port(PORT)
    print("Running uvicorn...")
    import uvicorn
    uvicorn.run("index:app", host="127.0.0.1", port=PORT)
