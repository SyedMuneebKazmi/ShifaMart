# ─── ShifaMart+ AI Agent (Python / FastAPI) ──────────────────────────────────
FROM python:3.11-slim

# System deps needed by spaCy / scikit-learn / LightGBM
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    g++ \
    libgomp1 \
    wget \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# ── Install Python dependencies ──────────────────────────────────────────────
COPY requirements.txt .

# Install a trimmed set of dependencies (skip dev/notebook-only packages)
RUN pip install --no-cache-dir \
    pandas \
    numpy \
    scikit-learn \
    xgboost \
    lightgbm \
    "spacy>=3.7" \
    nltk \
    fastapi \
    "uvicorn[standard]" \
    pydantic \
    joblib \
    python-dotenv

# Download the spaCy English model (small, ~12 MB)
RUN python -m spacy download en_core_web_sm

# Download required NLTK data
RUN python -c "import nltk; nltk.download('punkt', quiet=True); nltk.download('stopwords', quiet=True); nltk.download('wordnet', quiet=True); nltk.download('punkt_tab', quiet=True)"

# ── Copy application source ───────────────────────────────────────────────────
COPY . .

# ── Pre-trained model files are expected to be in ./models/ ──────────────────
# They are either baked into the image (copy from local ./models)
# or mounted as a volume at runtime (see docker-compose.yml).
# To bake them in, uncomment:
# COPY models/ ./models/

# ── Data CSV files (read-only) ────────────────────────────────────────────────
# These large CSVs live in the parent repo directory.
# In Docker we expect them to be mounted as a volume (see docker-compose.yml).
# Alternatively, copy the ones you need:
# COPY dataset.csv combined_dataset.csv symptom_Description.csv symptom_precaution.csv Symptom-severity.csv ./

EXPOSE 8000

HEALTHCHECK --interval=60s --timeout=10s --start-period=120s --retries=3 \
  CMD wget -qO- http://localhost:8000/api/health || exit 1

# Run the FastAPI server
CMD ["python", "mern_api.py"]
