# --------- Stage 1: Build Frontend ---------
FROM node:20 AS frontend-build
WORKDIR /app/frontend
COPY frontend/package.json frontend/package-lock.json ./
RUN npm install
COPY frontend/ .

# --------- Stage 2: Backend ---------
FROM python:3.11-slim AS backend
WORKDIR /app/backend

# Create virtual environment
RUN python -m venv /app/venv
ENV PATH="/app/venv/bin:$PATH"

COPY backend/requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt && pip install uvicorn
COPY backend/ .

# --------- Stage 3: Final ---------
FROM python:3.11-slim
WORKDIR /app



# Copy backend
COPY --from=backend /app/backend ./backend
COPY --from=backend /app/venv /app/venv

# Copy entire frontend for dev mode
COPY --from=frontend-build /app/frontend /app/frontend

# Install node for frontend serving
RUN apt-get update && apt-get install -y nodejs npm && rm -rf /var/lib/apt/lists/*

# Install supervisor to run both services
RUN pip install supervisor
COPY --from=frontend-build /app/frontend/next.config.ts ./frontend/next.config.ts

# Supervisor config
COPY supervisord.conf ./supervisord.conf

EXPOSE 3000 8080

CMD ["supervisord", "-c", "/app/supervisord.conf"] 