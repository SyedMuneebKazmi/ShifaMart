"""
Improved Training - Higher accuracy with better parameters
"""
import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, classification_report
import joblib

from config import COMBINED_DATASET_PATH, MODEL_DIR, RANDOM_STATE, TEST_SIZE
from data_preprocessing import DataPreprocessor

print("="*60)
print("IMPROVED TRAINING (Higher Accuracy)")
print("="*60)

# Read in chunks and sample MORE per disease
print("\n[1/4] Reading dataset...")
chunk_size = 10000
chunks = []
disease_samples = {}

# Optimal samples for accuracy
MAX_SAMPLES_PER_DISEASE = 50  # Best accuracy from testing

for i, chunk in enumerate(pd.read_csv(COMBINED_DATASET_PATH, chunksize=chunk_size, low_memory=False)):
    for disease in chunk['Disease'].unique():
        disease_data = chunk[chunk['Disease'] == disease]
        current_count = disease_samples.get(disease, 0)
        needed = max(0, MAX_SAMPLES_PER_DISEASE - current_count)
        
        if needed > 0:
            sample = disease_data.head(needed)
            chunks.append(sample)
            disease_samples[disease] = current_count + len(sample)
    
    # Progress indicator
    if (i + 1) % 5 == 0:
        print(f"  Processed {(i+1)*chunk_size} rows...")

df = pd.concat(chunks, ignore_index=True)
print(f"\nTotal samples: {len(df)}")
print(f"Total diseases: {len(df['Disease'].unique())}")

# Prepare training data
print("\n[2/4] Preparing training data...")
preprocessor = DataPreprocessor()
preprocessor.load_auxiliary_data()
X, y = preprocessor.prepare_training_data(df, max_samples_per_disease=None, min_samples_per_disease=10)

print(f"   Samples: {X.shape[0]}")
print(f"   Features: {X.shape[1]}")
print(f"   Diseases: {len(np.unique(y))}")

# Train with BETTER parameters
print("\n[3/4] Training Improved Random Forest...")
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=TEST_SIZE, random_state=RANDOM_STATE, stratify=y
)

model = RandomForestClassifier(
    n_estimators=150,      # More trees for better accuracy
    max_depth=22,          # Deeper trees
    min_samples_split=3,
    min_samples_leaf=1,
    max_features='sqrt',
    random_state=RANDOM_STATE,
    n_jobs=1,              # Single thread for memory safety
    class_weight='balanced',
    verbose=1
)

model.fit(X_train, y_train)

# Evaluate
print("\n[4/4] Evaluating...")
y_pred = model.predict(X_test)
accuracy = accuracy_score(y_test, y_pred)
print(f"\nTest Accuracy: {accuracy:.4f} ({accuracy*100:.2f}%)")

# Top-5 accuracy (more realistic for disease prediction)
y_proba = model.predict_proba(X_test)
top5_correct = 0
for i, probs in enumerate(y_proba):
    top5_classes = np.argsort(probs)[-5:]
    if y_test[i] in top5_classes:
        top5_correct += 1
top5_accuracy = top5_correct / len(y_test)
print(f"Top-5 Accuracy: {top5_accuracy:.4f} ({top5_accuracy*100:.2f}%)")

# Save
MODEL_DIR.mkdir(parents=True, exist_ok=True)
joblib.dump(preprocessor, MODEL_DIR / "preprocessor.joblib")

from disease_predictor import DiseasePredictionModel
pred_model = DiseasePredictionModel()
pred_model.preprocessor = preprocessor
pred_model.rf_model = model
pred_model.ensemble_model = model
pred_model.is_trained = True
pred_model.save()

print("\n" + "="*60)
print("IMPROVED TRAINING COMPLETE!")
print("="*60)
print(f"Diseases: {len(preprocessor.disease_list)}")
print(f"Symptoms: {len(preprocessor.symptom_list)}")
print(f"Accuracy: {accuracy*100:.1f}% (Top-1), {top5_accuracy*100:.1f}% (Top-5)")
print(f"\nRestart API: python api_v2.py")

