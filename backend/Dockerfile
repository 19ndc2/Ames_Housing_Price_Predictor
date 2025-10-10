FROM python:3.11-slim

WORKDIR /app

# Install dependencies
RUN apt-get update && \
    apt-get install -y \
    build-essential \
    cmake \
    libopenblas-dev \
    libomp-dev \
    python3-dev \
    python3-pip \
    git && \
    rm -rf /var/lib/apt/lists/*

# Install PyTorch from source
RUN pip install --upgrade pip && \
    pip install torch flask flask_cors scikit-learn==1.5.2 gunicorn pandas numpy joblib

# Copy application files
COPY . .

EXPOSE 8080

CMD ["gunicorn", "-b", "0.0.0.0:8080", "wsgi:app"]