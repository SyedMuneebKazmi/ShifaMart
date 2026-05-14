# ShifaMart+ AI Agent — FastAPI service
#
# BUILD CONTEXT: this directory (`fyp_shifamart_ai_agent/`) — matches Coolify when the service
# uses this folder as base directory (default).
#   docker build -t shifamart-ai .
#
# Required in this folder for the image: dataset.csv, symptom_Description.csv, symptom_precaution.csv,
# Symptom-severity.csv (optional: combined_dataset.csv for the expanded dataset).
#
# Optional env:
#   SKIP_AUTO_TRAIN=1  — fail if models/ is empty instead of training on first boot
#   AI_AGENT_DATA_DIR  — override directory for CSV datasets
#   PORT               — API port (default 8000), read by mern_api.py

FROM python:3.11-slim

RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    g++ \
    libgomp1 \
    wget \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY requirements.txt ./

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

RUN python -m spacy download en_core_web_sm

RUN python -c "import nltk; nltk.download('punkt', quiet=True); nltk.download('stopwords', quiet=True); nltk.download('wordnet', quiet=True); nltk.download('punkt_tab', quiet=True)"

COPY . .
RUN chmod +x /app/docker-entrypoint.sh

EXPOSE 8000

HEALTHCHECK --interval=60s --timeout=10s --start-period=300s --retries=3 \
  CMD wget -qO- http://127.0.0.1:8000/api/health || exit 1

ENTRYPOINT ["/app/docker-entrypoint.sh"]
CMD ["python", "mern_api.py"]
