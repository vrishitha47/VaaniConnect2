# Use Python 3.10 slim image for a balance of size and compatibility
FROM python:3.10-slim

# Set working directory
WORKDIR /app

# Install system dependencies
# libsndfile1 is required for soundfile/audioread
RUN apt-get update && apt-get install -y \
    libsndfile1 \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements file
COPY requirements-production.txt .

# Install Python dependencies
# Using --no-cache-dir to reduce image size
RUN pip install --no-cache-dir -r requirements-production.txt

# Copy the rest of the application code
COPY . .

# Create directory for audio outputs
RUN mkdir -p audio_outputs

# Set environment variables
ENV PYTHONUNBUFFERED=1
ENV PORT=5000

# Expose the port
EXPOSE 5000

# Run with Gunicorn
# Timeout set to 600s because ML models can be slow to load/inference
# Workers set to 1 to avoid excessive memory usage with large models
CMD ["gunicorn", "--bind", "0.0.0.0:5000", "--workers", "1", "--timeout", "600", "app:app"]
