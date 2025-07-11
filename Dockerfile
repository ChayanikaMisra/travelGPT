# --------- Stage 1: Build Frontend ---------
FROM node:20 AS frontend-build
WORKDIR /app/react_frontend
COPY react_frontend/package.json react_frontend/package-lock.json ./
RUN npm install
COPY react_frontend/ .

# --------- Stage 2: Backend ---------
FROM python:3.11-slim AS backend
WORKDIR /app/backend

# Copy requirements first for better caching
COPY backend/requirements.txt ./

# Create virtual environment and install dependencies in one layer
RUN python -m venv /app/venv && \
    . /app/venv/bin/activate && \
    pip install --no-cache-dir -r requirements.txt

COPY backend/ .

# --------- Stage 3: Final ---------
FROM python:3.11-slim
WORKDIR /app

# Create non-root user for security
RUN groupadd -r appuser && useradd -r -g appuser appuser

# Create virtual environment
RUN python -m venv /app/venv

# Copy backend
COPY --from=backend /app/backend ./backend
COPY --from=backend /app/venv /app/venv

# Copy entire frontend for dev mode
COPY --from=frontend-build /app/react_frontend /app/react_frontend

# Install node and supervisor in one layer
RUN apt-get update && apt-get install -y nodejs npm && \
    pip install supervisor && \
    rm -rf /var/lib/apt/lists/* && \
    chown -R appuser:appuser /app

# Switch to non-root user
USER appuser
ENV PATH="/app/venv/bin:$PATH"

# Supervisor config
COPY --chown=appuser:appuser supervisord.conf ./supervisord.conf

EXPOSE 3000 8080

CMD ["supervisord", "-c", "/app/supervisord.conf"] 