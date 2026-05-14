"""
Compute F1 (and related) scores for disease and severity models, write to disk.

Default uses a stratified subsample (max_samples_per_disease) so evaluation
finishes in reasonable time on large CSVs; override with --full-dataset.

Outputs (same directory as this file):
  - evaluation_f_scores.txt
  - evaluation_f_scores.json
"""
from __future__ import annotations

import argparse
import json
import sys
from datetime import datetime, timezone
from pathlib import Path

import numpy as np
from sklearn.ensemble import GradientBoostingClassifier
from sklearn.metrics import (
    accuracy_score,
    f1_score,
    precision_score,
    recall_score,
)
from sklearn.model_selection import train_test_split

from config import MODEL_DIR, RANDOM_STATE, TEST_SIZE
from data_preprocessing import DataPreprocessor
from disease_predictor import DiseasePredictionModel
from severity_model import SeverityDetectionModel


def _multiclass_metrics(y_true: np.ndarray, y_pred: np.ndarray) -> dict:
    return {
        "accuracy": float(accuracy_score(y_true, y_pred)),
        "f1_micro": float(f1_score(y_true, y_pred, average="micro", zero_division=0)),
        "f1_macro": float(f1_score(y_true, y_pred, average="macro", zero_division=0)),
        "f1_weighted": float(
            f1_score(y_true, y_pred, average="weighted", zero_division=0)
        ),
        "precision_macro": float(
            precision_score(y_true, y_pred, average="macro", zero_division=0)
        ),
        "recall_macro": float(
            recall_score(y_true, y_pred, average="macro", zero_division=0)
        ),
        "precision_weighted": float(
            precision_score(y_true, y_pred, average="weighted", zero_division=0)
        ),
        "recall_weighted": float(
            recall_score(y_true, y_pred, average="weighted", zero_division=0)
        ),
    }


def evaluate_disease_models(
    max_samples_per_disease: int | None,
) -> tuple[dict, DataPreprocessor]:
    model = DiseasePredictionModel()
    df = model.preprocessor.load_main_dataset()
    model.preprocessor.load_auxiliary_data()
    X, y = model.preprocessor.prepare_training_data(
        df,
        max_samples_per_disease=max_samples_per_disease,
        min_samples_per_disease=2,
    )

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=TEST_SIZE, random_state=RANDOM_STATE, stratify=y
    )

    n_classes = len(np.unique(y))
    model.build_models(n_classes)
    print("Fitting ensemble (Random Forest + XGBoost)...")
    model.ensemble_model.fit(X_train, y_train)
    model.is_trained = True

    rf = model.ensemble_model.named_estimators_["rf"]
    xgb_est = model.ensemble_model.named_estimators_["xgb"]

    out = {
        "random_forest": _multiclass_metrics(y_test, rf.predict(X_test)),
        "xgboost": _multiclass_metrics(y_test, xgb_est.predict(X_test)),
        "ensemble": _multiclass_metrics(y_test, model.ensemble_model.predict(X_test)),
    }
    return out, model.preprocessor


def evaluate_severity_model(symptom_list: list[str]) -> dict:
    sev = SeverityDetectionModel()
    sev.load_symptom_weights()
    X, y_labels = sev.build_training_data(symptom_list)
    y_enc = sev.label_encoder.fit_transform(y_labels)
    X_train, X_test, y_train, y_test = train_test_split(
        X, y_enc, test_size=0.2, random_state=RANDOM_STATE, stratify=y_enc
    )
    sev.ml_model = GradientBoostingClassifier(
        n_estimators=100,
        max_depth=5,
        learning_rate=0.1,
        random_state=RANDOM_STATE,
    )
    print("Fitting severity GradientBoostingClassifier...")
    sev.ml_model.fit(X_train, y_train)
    y_pred = sev.ml_model.predict(X_test)
    base = _multiclass_metrics(y_test, y_pred)
    base["target_names"] = list(sev.label_encoder.classes_)
    return base


def main() -> int:
    parser = argparse.ArgumentParser(description="Evaluate F1 scores and write files.")
    parser.add_argument(
        "--full-dataset",
        action="store_true",
        help="Use all rows (no per-disease cap); can be slow and memory-heavy.",
    )
    parser.add_argument(
        "--max-per-disease",
        type=int,
        default=50,
        help="Max training rows per disease when not using --full-dataset (default: 50).",
    )
    args = parser.parse_args()
    max_per = None if args.full_dataset else args.max_per_disease

    here = Path(__file__).resolve().parent
    out_txt = here / "evaluation_f_scores.txt"
    out_json = here / "evaluation_f_scores.json"

    report = {
        "generated_at_utc": datetime.now(timezone.utc).isoformat(),
        "random_state": RANDOM_STATE,
        "test_size": TEST_SIZE,
        "max_samples_per_disease": max_per,
        "full_dataset": bool(args.full_dataset),
        "model_dir": str(MODEL_DIR),
    }

    disease_metrics, preprocessor = evaluate_disease_models(max_per)
    report["disease_prediction"] = disease_metrics

    report["severity_detection"] = evaluate_severity_model(preprocessor.symptom_list)

    with open(out_json, "w", encoding="utf-8") as f:
        json.dump(report, f, indent=2)

    lines = [
        "ShifaMart+ AI — model F-scores (and related metrics)",
        f"Generated (UTC): {report['generated_at_utc']}",
        f"train_test_split: test_size={TEST_SIZE}, random_state={RANDOM_STATE}",
        f"Dataset sampling: max_samples_per_disease={max_per}",
        "",
        "=== Disease prediction (multi-class; test set) ===",
        "",
    ]
    for name, m in disease_metrics.items():
        lines.append(f"--- {name} ---")
        lines.append(f"  Accuracy:     {m['accuracy']:.6f}")
        lines.append(f"  F1 (micro):   {m['f1_micro']:.6f}   # same as accuracy for exact-match")
        lines.append(f"  F1 (macro):   {m['f1_macro']:.6f}")
        lines.append(f"  F1 (weighted):{m['f1_weighted']:.6f}")
        lines.append(f"  Precision (macro):   {m['precision_macro']:.6f}")
        lines.append(f"  Recall (macro):      {m['recall_macro']:.6f}")
        lines.append(f"  Precision (weighted):{m['precision_weighted']:.6f}")
        lines.append(f"  Recall (weighted):   {m['recall_weighted']:.6f}")
        lines.append("")

    s = report["severity_detection"]
    lines.extend(
        [
            "=== Severity detection (synthetic training data; test set) ===",
            f"  Classes: {', '.join(s['target_names'])}",
            f"  Accuracy:      {s['accuracy']:.6f}",
            f"  F1 (micro):    {s['f1_micro']:.6f}",
            f"  F1 (macro):    {s['f1_macro']:.6f}",
            f"  F1 (weighted): {s['f1_weighted']:.6f}",
            "",
            f"JSON: {out_json}",
        ]
    )

    text = "\n".join(lines) + "\n"
    out_txt.write_text(text, encoding="utf-8")
    print(text)
    print(f"Wrote {out_txt}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
