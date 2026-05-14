"""
Configuration settings for ShifaMart+ AI Agent
"""
import os
from pathlib import Path

# Base paths
BASE_DIR = Path(__file__).parent.parent
DATA_DIR = BASE_DIR
MODEL_DIR = Path(__file__).parent / "models"
MODEL_DIR.mkdir(exist_ok=True)

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

