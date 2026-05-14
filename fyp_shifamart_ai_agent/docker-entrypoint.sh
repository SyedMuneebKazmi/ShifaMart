#!/bin/sh
set -e
cd /app

if [ ! -f dataset.csv ] && [ ! -f combined_dataset.csv ]; then
  echo "ERROR: No dataset.csv or combined_dataset.csv in /app."
  echo "Build this image from the monorepo root (see comments at top of Dockerfile)."
  exit 1
fi

if [ ! -f models/preprocessor.joblib ] || { [ ! -f models/ensemble_model.joblib ] && [ ! -f models/rf_model.joblib ]; }; then
  if [ "${SKIP_AUTO_TRAIN:-0}" = "1" ]; then
    echo "ERROR: Trained models missing under models/ and SKIP_AUTO_TRAIN=1."
    exit 1
  fi
  echo "No trained disease models in models/; running train_fast.py once (cold start)..."
  python train_fast.py
fi

exec "$@"
