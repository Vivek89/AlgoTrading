# Stage 1: Builder
FROM python:3.12-slim as builder

WORKDIR /tmp

# Install uv
RUN pip install uv

# Copy pyproject.toml and UV lock file
COPY pyproject.toml uv.lock* /tmp/

# Stage 2: Runtime
FROM python:3.12-slim

WORKDIR /code

# Install system dependencies (gcc and libpq for Postgres)
RUN apt-get update && apt-get install -y \
    gcc \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Install uv
RUN pip install uv

# Copy pyproject.toml and lock file from builder
COPY --from=builder /tmp/pyproject.toml /tmp/uv.lock* /code/

# Install dependencies with uv
RUN cd /code && uv sync --frozen --all-extras --no-venv

# Copy application code
COPY . /code

# Set python path
ENV PYTHONPATH=/code

# Default command (can be overridden by docker-compose)
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
