"""
FAST Training - Uses only Random Forest (skips XGBoost) for quick iteration.

Trains on dataset.csv ONLY (~41 diseases, ~131 symptoms) and OVERWRITES
fyp_shifamart_ai_agent/models/*. That is great for a small, high test-accuracy
demo, but it REMOVES symptoms that exist only in combined_dataset.csv
(e.g. toothache / dental-related rows).

For natural phrases like "tooth pain" / "teeth pain" / many more diseases,
use instead:
    python train_combined_light.py

Do not run train_fast.py after train_combined_light.py unless you intentionally
want to revert to the smaller model.
"""
import sys
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score
import joblib

from config import DATASET_PATH, COMBINED_DATASET_PATH, MODEL_DIR, RANDOM_STATE, TEST_SIZE, DATA_DIR
from data_preprocessing import DataPreprocessor

print("="*60)
print("FAST TRAINING (Random Forest Only)")
print("="*60)
print("\n  *** NOTE: This replaces models/ with the SMALL dataset (dataset.csv).")
print("  *** For tooth pain / expanded symptoms run:  python train_combined_light.py\n")

# Use original smaller dataset for fast training
ORIGINAL_DATASET = DATA_DIR / "dataset.csv"
print(f"\nUsing original dataset: {ORIGINAL_DATASET}")

# Load and preprocess
print("\n[1/3] Loading data...")
preprocessor = DataPreprocessor()

# Load the original smaller dataset directly
df = pd.read_csv(ORIGINAL_DATASET)
# Strip UTF-8 BOM / whitespace so "Disease" column matches (Windows CSV often has \ufeffDisease)
df.columns = df.columns.astype(str).str.replace("\ufeff", "", regex=False).str.strip()
symptom_cols = [c for c in df.columns if str(c).startswith("Symptom")]
for col in symptom_cols:
    df[col] = df[col].fillna("").astype(str).str.strip().str.lower().str.replace(" ", "_")
if "Disease" in df.columns:
    df["Disease"] = df["Disease"].astype(str).str.strip()
print(f"Loaded {len(df)} rows from original dataset")

preprocessor.load_auxiliary_data()

# Smaller sample for fast training
X, y = preprocessor.prepare_training_data(df, max_samples_per_disease=50, min_samples_per_disease=5)

print(f"\n[2/3] Data ready:")
print(f"   Samples: {X.shape[0]}")
print(f"   Features: {X.shape[1]}")
print(f"   Diseases: {len(np.unique(y))}")

# Split
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=TEST_SIZE, random_state=RANDOM_STATE, stratify=y
)

print(f"\n[3/3] Training Random Forest...")
model = RandomForestClassifier(
    n_estimators=100,
    max_depth=15,
    min_samples_split=5,
    min_samples_leaf=2,
    random_state=RANDOM_STATE,
    n_jobs=-1,  # Use all cores for speed
    class_weight='balanced',
    verbose=1   # Show progress
)

model.fit(X_train, y_train)

# Evaluate
y_pred = model.predict(X_test)
accuracy = accuracy_score(y_test, y_pred)
print(f"\nTest Accuracy: {accuracy:.4f} ({accuracy*100:.2f}%)")

# Save model and preprocessor
MODEL_DIR.mkdir(parents=True, exist_ok=True)
joblib.dump(model, MODEL_DIR / "rf_model_fast.joblib")
joblib.dump(preprocessor, MODEL_DIR / "preprocessor.joblib")

# Also save as the main model for compatibility
from disease_predictor import DiseasePredictionModel
pred_model = DiseasePredictionModel()
pred_model.preprocessor = preprocessor
pred_model.rf_model = model
pred_model.ensemble_model = model  # Use RF as the "ensemble"
pred_model.is_trained = True
pred_model.save()

print("\n" + "="*60)
print("FAST TRAINING COMPLETE!")
print("="*60)
print(f"Diseases: {len(preprocessor.disease_list)}")
print(f"Sample diseases: {preprocessor.disease_list[:10]}")
print("\nRestart API (after stopping any server on port 8000):")
print("    python mern_api.py")
print("Or use another port:")
print("    PowerShell:  $env:PORT=8001; python mern_api.py")

