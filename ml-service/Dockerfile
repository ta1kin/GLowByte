FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    g++ \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application
COPY . .

# Ensure models directory exists and copy models if they exist
RUN mkdir -p /app/models
# Models will be available via volume mount from docker-compose

# Expose port
EXPOSE 8000

# Set PYTHONPATH to include src directory
ENV PYTHONPATH=/app

# Run application
CMD ["uvicorn", "src.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]

