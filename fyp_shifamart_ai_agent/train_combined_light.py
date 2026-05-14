"""
Train the disease model on combined_dataset.csv (many more diseases & symptoms).

This expands vocabulary (e.g. toothache, ear_pain) beyond the small dataset.csv build.
Output files match DiseasePredictionModel.save() so mern_api.py loads unchanged.

Run from this directory:
    python train_combined_light.py

Requires: fyp/combined_dataset.csv (already used when present per config.DATASET_PATH)
"""
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score
from sklearn.model_selection import train_test_split

from config import DATASET_PATH, MODEL_DIR, RANDOM_STATE, TEST_SIZE
from data_preprocessing import DataPreprocessor
from disease_predictor import DiseasePredictionModel

# Tunables: higher min_samples = fewer rare diseases; lower max_samples = faster train
MIN_SAMPLES_PER_DISEASE = 10
MAX_SAMPLES_PER_DISEASE = 40


def main():
    print("=" * 60)
    print("COMBINED DATASET TRAINING (Random Forest)")
    print("=" * 60)
    print(f"Dataset: {DATASET_PATH}")
    print(f"Min samples / disease: {MIN_SAMPLES_PER_DISEASE}")
    print(f"Max samples / disease: {MAX_SAMPLES_PER_DISEASE}")
    print()

    preprocessor = DataPreprocessor()
    df = preprocessor.load_main_dataset()
    preprocessor.load_auxiliary_data()

    X, y = preprocessor.prepare_training_data(
        df,
        max_samples_per_disease=MAX_SAMPLES_PER_DISEASE,
        min_samples_per_disease=MIN_SAMPLES_PER_DISEASE,
    )

    print(f"\nMatrix: X={X.shape}, classes={len(np.unique(y))}")
    print(f"Symptom vocabulary: {len(preprocessor.symptom_list)}")
    print(f"Sample symptoms: {sorted([s for s in preprocessor.symptom_list if 'tooth' in s or 'ear' in s])[:12]}")

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=TEST_SIZE, random_state=RANDOM_STATE, stratify=y
    )

    model = RandomForestClassifier(
        n_estimators=120,
        max_depth=22,
        min_samples_split=4,
        min_samples_leaf=1,
        random_state=RANDOM_STATE,
        n_jobs=-1,
        class_weight="balanced_subsample",
        verbose=1,
    )

    print("\nTraining Random Forest...")
    model.fit(X_train, y_train)

    y_pred = model.predict(X_test)
    acc = accuracy_score(y_test, y_pred)
    print(f"\nTest accuracy: {acc:.4f} ({acc * 100:.2f}%)")

    MODEL_DIR.mkdir(parents=True, exist_ok=True)

    pred_model = DiseasePredictionModel()
    pred_model.preprocessor = preprocessor
    pred_model.rf_model = model
    pred_model.ensemble_model = model
    pred_model.is_trained = True
    pred_model.save()

    # Quick sanity check
    preds = pred_model.predict(["toothache"], top_k=3)
    print("\nSanity check predict(['toothache']) top-3:")
    for p in preds:
        print(f"  - {p['disease']}: {p.get('confidence_percent', p.get('probability'))}")

    print("\nDone. Restart API (stop any process on port 8000 first):")
    print("    python mern_api.py")
    print("\nDo NOT run train_fast.py after this — it will overwrite these models with the 41-disease build.")
    print("=" * 60)


if __name__ == "__main__":
    main()
