from app.main import app as application

# Vercel serverless handler — this exposes the FastAPI ASGI app
app = application
