FROM python:3.10-slim

# Set working directory
WORKDIR /app

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    HOST=0.0.0.0 \
    PORT=8004

# Install system dependencies for image processing and CUDA support
RUN apt-get update && apt-get install -y \
    libgl1-mesa-glx \
    libglib2.0-0 \
    libsm6 \
    libxext6 \
    libxrender-dev \
    libgomp1 \
    libgcc-s1 \
    git \
    wget \
    curl \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Create models directory
RUN mkdir -p /app/models

# Upgrade pip first
RUN pip install --no-cache-dir --upgrade pip

# Install PyTorch first (required for xformers)
RUN pip install --no-cache-dir torch>=2.0.0 torchvision>=0.15.0

# Install core dependencies without xformers first
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Now try to install xformers (optional - if it fails, continue)
RUN pip install --no-cache-dir xformers>=0.0.22 || echo "xformers installation failed, continuing without it"

# Copy application code
COPY app/ ./app/

# Expose the port the app runs on
EXPOSE ${PORT}

# Command to run the application
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8004"]