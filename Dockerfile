# Stage 1: Builder
FROM python:3.12-slim as builder

WORKDIR /tmp

# Install poetry
RUN pip install poetry

# Copy only dependency files to cache them in docker layer
COPY pyproject.toml poetry.lock* /tmp/

# Generate requirements.txt from poetry (safer for production builds than running poetry inside)
RUN poetry export -f requirements.txt --output requirements.txt --without-hashes

# Stage 2: Runtime
FROM python:3.12-slim

WORKDIR /code

# Install system dependencies (gcc and libpq for Postgres)
RUN apt-get update && apt-get install -y \
    gcc \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements from builder stage
COPY --from=builder /tmp/requirements.txt /code/requirements.txt

# Install dependencies
RUN pip install --no-cache-dir --upgrade -r /code/requirements.txt

# Copy application code
COPY . /code

# Set python path
ENV PYTHONPATH=/code

# Default command (can be overridden by docker-compose)
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
