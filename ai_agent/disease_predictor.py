"""
Disease Prediction Model for ShifaMart+ AI Agent
Uses XGBoost and Random Forest for multi-class classification
"""
import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.ensemble import RandomForestClassifier, VotingClassifier
from sklearn.metrics import classification_report, accuracy_score, confusion_matrix
import xgboost as xgb
import joblib
from typing import List, Dict, Tuple
from pathlib import Path

from config import MODEL_DIR, RANDOM_STATE, TEST_SIZE, TOP_K_DISEASES
from data_preprocessing import DataPreprocessor
from duration_analyzer import duration_analyzer


class DiseasePredictionModel:
    """Disease prediction using ensemble of XGBoost and Random Forest"""
    
    def __init__(self):
        self.preprocessor = DataPreprocessor()
        self.rf_model = None
        self.xgb_model = None
        self.ensemble_model = None
        self.is_trained = False
        
    def build_models(self, n_classes: int):
        """Initialize the ML models"""
        
        # Random Forest - reduced complexity for memory efficiency
        self.rf_model = RandomForestClassifier(
            n_estimators=100,  # Reduced from 200
            max_depth=15,      # Reduced from 20
            min_samples_split=5,
            min_samples_leaf=2,
            random_state=RANDOM_STATE,
            n_jobs=1,          # Single thread to reduce memory
            class_weight='balanced'
        )
        
        # XGBoost - reduced complexity for memory efficiency
        self.xgb_model = xgb.XGBClassifier(
            n_estimators=100,  # Reduced from 200
            max_depth=6,       # Reduced from 10
            learning_rate=0.1,
            subsample=0.8,
            colsample_bytree=0.8,
            random_state=RANDOM_STATE,
            n_jobs=1,          # Single thread to reduce memory
            objective='multi:softprob',
            num_class=n_classes,
            eval_metric='mlogloss',
            tree_method='hist'  # More memory efficient
        )
        
        # Ensemble (Voting Classifier)
        self.ensemble_model = VotingClassifier(
            estimators=[
                ('rf', self.rf_model),
                ('xgb', self.xgb_model)
            ],
            voting='soft',  # Use probabilities for voting
            n_jobs=1        # Single thread to reduce memory
        )
        
        print("Models initialized successfully")
    
    def train(self, X: np.ndarray, y: np.ndarray, use_ensemble: bool = True):
        """Train the disease prediction model"""
        print("\n" + "="*50)
        print("TRAINING DISEASE PREDICTION MODEL")
        print("="*50)
        
        # Split data
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=TEST_SIZE, random_state=RANDOM_STATE, stratify=y
        )
        
        print(f"Training set: {len(X_train)} samples")
        print(f"Test set: {len(X_test)} samples")
        
        # Build models
        n_classes = len(np.unique(y))
        self.build_models(n_classes)
        
        if use_ensemble:
            # Train ensemble
            print("\nTraining ensemble model...")
            self.ensemble_model.fit(X_train, y_train)
            
            # Evaluate
            y_pred = self.ensemble_model.predict(X_test)
            accuracy = accuracy_score(y_test, y_pred)
            print(f"\nEnsemble Test Accuracy: {accuracy:.4f} ({accuracy*100:.2f}%)")
            
        else:
            # Train individual models
            print("\nTraining Random Forest...")
            self.rf_model.fit(X_train, y_train)
            rf_acc = accuracy_score(y_test, self.rf_model.predict(X_test))
            print(f"Random Forest Accuracy: {rf_acc:.4f}")
            
            print("\nTraining XGBoost...")
            self.xgb_model.fit(X_train, y_train)
            xgb_acc = accuracy_score(y_test, self.xgb_model.predict(X_test))
            print(f"XGBoost Accuracy: {xgb_acc:.4f}")
        
        self.is_trained = True
        
        # Detailed evaluation
        print("\n" + "="*50)
        print("CLASSIFICATION REPORT")
        print("="*50)
        y_pred = self.ensemble_model.predict(X_test) if use_ensemble else self.rf_model.predict(X_test)
        
        # Get disease names for report
        disease_names = self.preprocessor.label_encoder.classes_
        print(classification_report(y_test, y_pred, target_names=disease_names, zero_division=0))
        
        return accuracy
    
    def cross_validate(self, X: np.ndarray, y: np.ndarray, cv: int = 5):
        """Perform cross-validation"""
        print(f"\nPerforming {cv}-fold cross-validation...")
        
        # Cross-validate Random Forest
        rf_scores = cross_val_score(self.rf_model, X, y, cv=cv, scoring='accuracy')
        print(f"Random Forest CV Scores: {rf_scores}")
        print(f"Random Forest Mean: {rf_scores.mean():.4f} (+/- {rf_scores.std()*2:.4f})")
        
        return rf_scores.mean()
    
    # Rule-based disease pattern boosters (to correct model limitations)
    # Format: {frozenset of symptoms: [(disease_name, boost_amount), ...]}
    SYMPTOM_DISEASE_RULES = {
        # ===== COMMON COLD / FLU - Very common symptom combinations =====
        frozenset(['high_fever', 'cough', 'headache']): [('Common Cold', 0.4), ('Typhoid', 0.15)],
        frozenset(['fever', 'cough', 'headache']): [('Common Cold', 0.35)],
        frozenset(['high_fever', 'cough']): [('Common Cold', 0.3), ('Pneumonia', 0.1)],
        frozenset(['cough', 'runny_nose', 'high_fever']): [('Common Cold', 0.4)],
        frozenset(['cough', 'chills', 'fatigue']): [('Common Cold', 0.3)],
        frozenset(['high_fever', 'headache']): [('Typhoid', 0.2), ('Common Cold', 0.15)],
        frozenset(['fever', 'headache']): [('Common Cold', 0.2)],
        frozenset(['cough', 'headache']): [('Common Cold', 0.2)],
        
        # ===== Diabetes patterns =====
        frozenset(['fatigue', 'excessive_hunger']): [('Diabetes', 0.3)],
        frozenset(['fatigue', 'excessive_hunger', 'dehydration']): [('Diabetes', 0.4)],
        frozenset(['polyuria', 'excessive_hunger']): [('Diabetes', 0.35)],
        frozenset(['fatigue', 'weight_loss', 'excessive_hunger']): [('Diabetes', 0.4)],
        frozenset(['blurred_and_distorted_vision', 'fatigue']): [('Diabetes', 0.25)],
        
        # ===== Gastroenteritis =====
        frozenset(['stomach_pain', 'diarrhoea']): [('Gastroenteritis', 0.3)],
        frozenset(['stomach_pain', 'vomiting', 'diarrhoea']): [('Gastroenteritis', 0.4)],
        frozenset(['vomiting', 'diarrhoea', 'dehydration']): [('Gastroenteritis', 0.35)],
        frozenset(['vomiting', 'diarrhoea']): [('Gastroenteritis', 0.25)],
        
        # ===== Typhoid =====
        frozenset(['high_fever', 'stomach_pain', 'diarrhoea']): [('Typhoid', 0.35)],
        frozenset(['high_fever', 'headache', 'stomach_pain']): [('Typhoid', 0.3)],
        frozenset(['high_fever', 'stomach_pain']): [('Typhoid', 0.2)],
        
        # ===== Malaria - needs chills/sweating =====
        frozenset(['high_fever', 'chills', 'sweating']): [('Malaria', 0.4)],
        frozenset(['high_fever', 'headache', 'chills']): [('Malaria', 0.35)],
        frozenset(['high_fever', 'chills']): [('Malaria', 0.25)],
        
        # ===== Dengue =====
        frozenset(['high_fever', 'joint_pain', 'muscle_pain']): [('Dengue', 0.35)],
        frozenset(['high_fever', 'skin_rash', 'fatigue']): [('Dengue', 0.3)],
        frozenset(['high_fever', 'joint_pain']): [('Dengue', 0.2)],
        
        # ===== Migraine =====
        frozenset(['headache', 'nausea', 'blurred_and_distorted_vision']): [('Migraine', 0.4)],
        frozenset(['headache', 'vomiting', 'dizziness']): [('Migraine', 0.35)],
        frozenset(['headache', 'dizziness']): [('Migraine', 0.25)],
        
        # ===== Heart attack =====
        frozenset(['chest_pain', 'breathlessness', 'sweating']): [('Heart attack', 0.4)],
        frozenset(['chest_pain', 'vomiting', 'sweating']): [('Heart attack', 0.35)],
        
        # ===== Pneumonia =====
        frozenset(['high_fever', 'cough', 'breathlessness']): [('Pneumonia', 0.4)],
        frozenset(['chest_pain', 'cough', 'high_fever']): [('Pneumonia', 0.35)],
        frozenset(['cough', 'breathlessness']): [('Pneumonia', 0.2)],
        
        # ===== Jaundice/Hepatitis =====
        frozenset(['yellowish_skin', 'fatigue', 'dark_urine']): [('Jaundice', 0.4)],
        frozenset(['yellowish_skin', 'nausea', 'loss_of_appetite']): [('Jaundice', 0.35)],
        frozenset(['yellowish_skin']): [('Jaundice', 0.3)],
        
        # ===== UTI =====
        frozenset(['burning_micturition', 'frequent_urination']): [('Urinary tract infection', 0.4)],
        frozenset(['burning_micturition']): [('Urinary tract infection', 0.25)],
        
        # ===== Allergy =====
        frozenset(['continuous_sneezing', 'watering_from_eyes', 'itching']): [('Allergy', 0.4)],
        frozenset(['continuous_sneezing', 'itching']): [('Allergy', 0.3)],
        
        # ===== Arthritis / Joint problems =====
        frozenset(['joint_pain']): [('Arthritis', 0.5), ('Osteoarthritis', 0.2)],
        frozenset(['joint_pain', 'swelling']): [('Arthritis', 0.5), ('Osteoarthritis', 0.25)],
        frozenset(['joint_pain', 'stiff_neck']): [('Cervical spondylosis', 0.4)],
        frozenset(['joint_pain', 'muscle_pain']): [('Arthritis', 0.4)],
        frozenset(['back_pain']): [('Arthritis', 0.3), ('Cervical spondylosis', 0.25)],
        frozenset(['knee_pain']): [('Osteoarthritis', 0.4), ('Arthritis', 0.3)],
        
        # ===== Skin problems =====
        frozenset(['skin_rash']): [('Fungal infection', 0.3), ('Allergy', 0.25)],
        frozenset(['itching']): [('Fungal infection', 0.25), ('Allergy', 0.2)],
        frozenset(['skin_rash', 'itching']): [('Fungal infection', 0.4), ('Allergy', 0.3)],
        
        # ===== Headache alone =====
        frozenset(['headache']): [('Migraine', 0.3), ('Tension headache', 0.25)],
        
        # ===== Stomach problems =====
        frozenset(['stomach_pain']): [('Gastritis', 0.3), ('GERD', 0.25)],
        frozenset(['acidity']): [('GERD', 0.4), ('Gastritis', 0.3)],
        
        # ===== Blood in stool / Rectal issues =====
        frozenset(['blood_in_stool']): [('Dimorphic hemmorhoids(piles)', 0.4), ('Peptic ulcer diseae', 0.25), ('Gastroenteritis', 0.15)],
        frozenset(['blood_in_stool', 'stomach_pain']): [('Peptic ulcer diseae', 0.4), ('Gastroenteritis', 0.25)],
        frozenset(['blood_in_stool', 'constipation']): [('Dimorphic hemmorhoids(piles)', 0.5)],
        
        # ===== Breathing issues =====
        frozenset(['breathlessness']): [('Bronchial Asthma', 0.3), ('Pneumonia', 0.2)],
        frozenset(['breathlessness', 'cough']): [('Bronchial Asthma', 0.35), ('Pneumonia', 0.3)],
        
        # ===== Urinary issues =====
        frozenset(['blood_in_urine']): [('Urinary tract infection', 0.35), ('Chronic kidney disease', 0.2)],
    }
    
    # Diseases that should NOT be predicted for common generic symptoms alone
    # These require more specific symptoms to be valid predictions
    SERIOUS_DISEASES_NEEDING_SPECIFIC_SYMPTOMS = {
        'AIDS': ['skin_rash', 'weight_loss', 'night_sweats', 'swollen_lymph_nodes'],
        'HIV': ['skin_rash', 'weight_loss', 'night_sweats', 'swollen_lymph_nodes'],
        'Tuberculosis': ['blood_in_sputum', 'weight_loss', 'night_sweats'],
        'Cancer': ['weight_loss', 'lumps', 'unexplained_bleeding'],
    }
    
    # Generic symptoms that alone don't indicate serious diseases
    GENERIC_SYMPTOMS = {'high_fever', 'fever', 'headache', 'cough', 'fatigue', 
                        'weakness', 'dizziness', 'nausea', 'vomiting', 'muscle_pain'}
    
    def _apply_rule_based_boost(self, symptoms: List[str], probabilities: np.ndarray) -> np.ndarray:
        """Apply rule-based boosts and penalties to correct model limitations"""
        symptom_set = set(symptoms)
        boosted_probs = probabilities.copy()
        
        # 1. Apply positive boosts for matching symptom patterns
        for pattern, boosts in self.SYMPTOM_DISEASE_RULES.items():
            if pattern.issubset(symptom_set):
                for disease_name, boost in boosts:
                    try:
                        idx = list(self.preprocessor.label_encoder.classes_).index(disease_name)
                        boosted_probs[idx] += boost
                    except ValueError:
                        pass
        
        # 2. Penalize serious diseases if only generic symptoms are present
        non_generic_symptoms = symptom_set - self.GENERIC_SYMPTOMS
        has_specific_symptoms = len(non_generic_symptoms) > 0
        
        if not has_specific_symptoms:
            # Only generic symptoms like fever, headache, cough - penalize serious diseases
            for disease_name, required_symptoms in self.SERIOUS_DISEASES_NEEDING_SPECIFIC_SYMPTOMS.items():
                # Check if any required specific symptom is present
                has_required = any(req in symptom_set for req in required_symptoms)
                if not has_required:
                    try:
                        idx = list(self.preprocessor.label_encoder.classes_).index(disease_name)
                        # Reduce probability by 90% - these diseases need specific symptoms
                        boosted_probs[idx] *= 0.1
                    except ValueError:
                        pass
        
        # Normalize to ensure probabilities sum to 1
        if boosted_probs.sum() > 0:
            boosted_probs = boosted_probs / boosted_probs.sum()
        
        return boosted_probs
    
    def predict(self, symptoms: List[str], top_k: int = TOP_K_DISEASES, duration: str = None) -> List[Dict]:
        """
        Predict diseases from symptoms with optional duration consideration
        
        Args:
            symptoms: List of symptom strings
            top_k: Number of top predictions to return
            duration: Optional duration text (e.g., "2 days", "a week")
            
        Returns:
            List of dicts with disease name, probability, description, precautions, severity
        """
        if not self.is_trained:
            raise ValueError("Model not trained. Call train() first or load a trained model.")
        
        # Convert symptoms to vector
        symptom_vector = self.preprocessor.symptoms_to_vector(symptoms)
        symptom_vector = symptom_vector.reshape(1, -1)
        
        # Get prediction probabilities
        if self.ensemble_model is not None:
            probabilities = self.ensemble_model.predict_proba(symptom_vector)[0]
        else:
            probabilities = self.rf_model.predict_proba(symptom_vector)[0]
        
        # Apply rule-based corrections
        probabilities = self._apply_rule_based_boost(symptoms, probabilities)
        
        # Apply duration-based adjustments if duration is provided
        if duration:
            duration_adjustments = duration_analyzer.get_duration_adjustments(symptoms, duration)
            for disease_name, boost in duration_adjustments.items():
                try:
                    idx = list(self.preprocessor.label_encoder.classes_).index(disease_name)
                    probabilities[idx] += boost
                except ValueError:
                    pass  # Disease not in model
            
            # Re-normalize probabilities
            if probabilities.sum() > 0:
                probabilities = probabilities / probabilities.sum()
        
        # Get top K predictions
        top_indices = np.argsort(probabilities)[::-1][:top_k]
        
        # Calculate severity
        severity_score, severity_level = self.preprocessor.calculate_severity(symptoms)
        
        results = []
        for idx in top_indices:
            disease_name = self.preprocessor.label_encoder.classes_[idx]
            prob = probabilities[idx]
            
            # Get additional info
            description = self.preprocessor.disease_descriptions.get(disease_name, "No description available")
            precautions = self.preprocessor.disease_precautions.get(disease_name, [])
            
            results.append({
                'disease': disease_name,
                'probability': float(prob),
                'confidence_percent': f"{prob*100:.1f}%",
                'description': description,
                'precautions': precautions,
                'severity_score': severity_score,
                'severity_level': severity_level
            })
        
        return results
    
    def predict_from_text(self, symptom_text: str, top_k: int = TOP_K_DISEASES) -> List[Dict]:
        """
        Predict diseases from natural language symptom text
        Uses simple keyword matching (can be enhanced with NLP later)
        """
        # Simple preprocessing
        text = symptom_text.lower().replace(',', ' ').replace('.', ' ')
        words = text.split()
        
        # Find matching symptoms
        matched_symptoms = []
        for symptom in self.preprocessor.symptom_list:
            # Check if symptom words appear in text
            symptom_words = symptom.replace('_', ' ').split()
            if all(word in words or any(word in w for w in words) for word in symptom_words):
                matched_symptoms.append(symptom)
        
        if not matched_symptoms:
            # Fallback: try partial matching
            for word in words:
                for symptom in self.preprocessor.symptom_list:
                    if word in symptom or symptom in word:
                        if symptom not in matched_symptoms:
                            matched_symptoms.append(symptom)
        
        print(f"Matched symptoms: {matched_symptoms}")
        
        if not matched_symptoms:
            return [{
                'disease': 'Unable to match symptoms',
                'probability': 0,
                'confidence_percent': '0%',
                'description': 'Please provide more specific symptoms',
                'precautions': [],
                'severity_score': 0,
                'severity_level': 'UNKNOWN'
            }]
        
        return self.predict(matched_symptoms, top_k)
    
    def get_all_symptoms(self) -> List[str]:
        """Get list of all known symptoms"""
        return self.preprocessor.symptom_list.copy()
    
    def get_all_diseases(self) -> List[str]:
        """Get list of all known diseases"""
        return self.preprocessor.disease_list.copy()
    
    def save(self, path: Path = MODEL_DIR):
        """Save trained models"""
        path.mkdir(exist_ok=True)
        
        # Save models
        if self.ensemble_model is not None:
            joblib.dump(self.ensemble_model, path / 'ensemble_model.joblib')
        if self.rf_model is not None:
            joblib.dump(self.rf_model, path / 'rf_model.joblib')
        if self.xgb_model is not None:
            joblib.dump(self.xgb_model, path / 'xgb_model.joblib')
        
        # Save preprocessor
        self.preprocessor.save(path)
        
        print(f"Models saved to {path}")
    
    def load(self, path: Path = MODEL_DIR):
        """Load trained models"""
        # Load preprocessor first
        self.preprocessor.load(path)
        
        # Load models
        ensemble_path = path / 'ensemble_model.joblib'
        rf_path = path / 'rf_model.joblib'
        xgb_path = path / 'xgb_model.joblib'
        
        if ensemble_path.exists():
            self.ensemble_model = joblib.load(ensemble_path)
        if rf_path.exists():
            self.rf_model = joblib.load(rf_path)
        if xgb_path.exists():
            self.xgb_model = joblib.load(xgb_path)
        
        self.is_trained = True
        print(f"Models loaded from {path}")


def train_model():
    """Main function to train and save the model"""
    # Initialize
    model = DiseasePredictionModel()
    
    # Load and preprocess data
    df = model.preprocessor.load_main_dataset()
    model.preprocessor.load_auxiliary_data()
    X, y = model.preprocessor.prepare_training_data(df)
    
    # Train
    model.train(X, y, use_ensemble=True)
    
    # Save
    model.save()
    
    # Test prediction
    print("\n" + "="*50)
    print("TESTING PREDICTIONS")
    print("="*50)
    
    test_symptoms = ['itching', 'skin_rash', 'nodal_skin_eruptions']
    print(f"\nTest symptoms: {test_symptoms}")
    predictions = model.predict(test_symptoms, top_k=3)
    
    for i, pred in enumerate(predictions, 1):
        print(f"\n{i}. {pred['disease']} ({pred['confidence_percent']})")
        print(f"   Severity: {pred['severity_level']} (Score: {pred['severity_score']:.2f})")
        print(f"   Description: {pred['description'][:100]}...")
        if pred['precautions']:
            print(f"   Precautions: {', '.join(pred['precautions'][:2])}")
    
    return model


if __name__ == "__main__":
    model = train_model()

