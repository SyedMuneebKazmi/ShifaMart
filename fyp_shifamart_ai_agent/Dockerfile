# ShifaMart+ AI Agent — FastAPI service
#
# HOW IT WORKS AFTER DEPLOYMENT
# - The container does NOT re-train on every request.
# - At startup it loads *.joblib from ./models/ (disease ensemble/RF, preprocessor, severity).
# - If ./models/ is empty (typical fresh clone), docker-entrypoint.sh runs train_fast.py ONCE,
#   then starts the API. For faster cold starts, commit trained models under models/ or mount a volume.
#
# BUILD (must use monorepo root as context so CSVs can be copied in):
#   docker build -f fyp_shifamart_ai_agent/Dockerfile -t shifamart-ai .
#
# Coolify / similar: set "Build Directory" / context to the repository root (where dataset.csv lives),
# and Dockerfile path to fyp_shifamart_ai_agent/Dockerfile.
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

COPY fyp_shifamart_ai_agent/requirements.txt .

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

COPY fyp_shifamart_ai_agent/ .
RUN chmod +x /app/docker-entrypoint.sh

# Core CSVs (combined_dataset.csv is optional; add a COPY line here if you ship it for larger models)
COPY dataset.csv symptom_Description.csv symptom_precaution.csv Symptom-severity.csv ./

EXPOSE 8000

HEALTHCHECK --interval=60s --timeout=10s --start-period=300s --retries=3 \
  CMD wget -qO- http://localhost:8000/api/health || exit 1

ENTRYPOINT ["/app/docker-entrypoint.sh"]
CMD ["python", "mern_api.py"]
