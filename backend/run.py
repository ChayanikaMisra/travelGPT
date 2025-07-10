import uvicorn
import os
import ssl
from main import app  # Import from backend/main.py

if __name__ == "__main__":
    cert_dir = os.path.join(os.path.dirname(__file__), 'certs')
    cert_path = os.path.join(cert_dir, 'cert.pem')
    key_path = os.path.join(cert_dir, 'key.pem')

    ssl_kwargs = {}
    if os.path.exists(cert_path) and os.path.exists(key_path):
        ssl_kwargs = {
            'ssl_certfile': cert_path,
            'ssl_keyfile': key_path,
        }
        print("🚀 Starting Travel Planner API with HTTPS...")
        print(f"📍 Server will be available at: https://localhost:8000")
    else:
        print("🚀 Starting Travel Planner API without SSL...")
        print(f"📍 Server will be available at: http://localhost:8000")

    uvicorn.run(
        app,
        host="0.0.0.0",
        port=8000,
        reload=True,
        **ssl_kwargs
    ) 