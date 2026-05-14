"""
Configuration settings for ShifaMart+ AI Agent
"""
import os
from pathlib import Path

_PACKAGE_DIR = Path(__file__).resolve().parent


def _resolve_data_dir() -> Path:
    """
    Directory containing dataset CSVs.

    Resolution order:
    1) AI_AGENT_DATA_DIR env (absolute or relative path)
    2) Same folder as this package (typical Docker layout: CSVs copied into /app)
    3) Parent folder (monorepo checkout: CSVs next to fyp_shifamart_ai_agent/)
    4) Package dir as fallback
    """
    override = os.environ.get("AI_AGENT_DATA_DIR", "").strip()
    if override:
        return Path(override).expanduser().resolve()
    if (_PACKAGE_DIR / "dataset.csv").exists() or (_PACKAGE_DIR / "combined_dataset.csv").exists():
        return _PACKAGE_DIR
    parent = _PACKAGE_DIR.parent
    if (parent / "dataset.csv").exists() or (parent / "combined_dataset.csv").exists():
        return parent
    return _PACKAGE_DIR


# CSV / auxiliary data (descriptions, precautions, severity weights)
BASE_DIR = _resolve_data_dir()
DATA_DIR = BASE_DIR
# Saved joblibs always live next to the Python package (e.g. /app/models in Docker)
MODEL_DIR = _PACKAGE_DIR / "models"
MODEL_DIR.mkdir(parents=True, exist_ok=True)

# Dataset paths
ORIGINAL_DATASET_PATH = DATA_DIR / "dataset.csv"
COMBINED_DATASET_PATH = DATA_DIR / "combined_dataset.csv"
AUGMENTED_DATASET_PATH = DATA_DIR / "Final_Augmented_dataset_Diseases_and_Symptoms.csv"

# Use combined dataset if it exists, otherwise use original
DATASET_PATH = COMBINED_DATASET_PATH if COMBINED_DATASET_PATH.exists() else ORIGINAL_DATASET_PATH
SYMPTOM_DESCRIPTION_PATH = DATA_DIR / "symptom_Description.csv"
SYMPTOM_PRECAUTION_PATH = DATA_DIR / "symptom_precaution.csv"
SYMPTOM_SEVERITY_PATH = DATA_DIR / "Symptom-severity.csv"

# Model settings
RANDOM_STATE = 42
TEST_SIZE = 0.2
TOP_K_DISEASES = 5  # Top K predictions to return

# Severity thresholds
SEVERITY_THRESHOLDS = {
    "MILD": (0, 3),
    "MODERATE": (3, 5),
    "SEVERE": (5, 7),
    "EMERGENCY": (7, 10)
}

