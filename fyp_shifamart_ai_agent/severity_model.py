"""
Severity Detection Model for ShifaMart+ AI Agent
Dedicated model for predicting symptom severity levels
"""
import numpy as np
import pandas as pd
from sklearn.ensemble import GradientBoostingClassifier, RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
from typing import List, Dict, Tuple
import joblib
from pathlib import Path

from config import MODEL_DIR, SYMPTOM_SEVERITY_PATH, RANDOM_STATE


class SeverityLevel:
    """Severity level constants"""
    MILD = "MILD"
    MODERATE = "MODERATE"
    SEVERE = "SEVERE"
    EMERGENCY = "EMERGENCY"
    
    @classmethod
    def all_levels(cls) -> List[str]:
        return [cls.MILD, cls.MODERATE, cls.SEVERE, cls.EMERGENCY]


class SeverityDetectionModel:
    """
    Dedicated model for detecting severity of symptoms
    Uses both rule-based and ML-based approaches
    """
    
    # Critical emergency symptoms that immediately indicate high severity
    # NOTE: Scores are used for severity weighting. Only symptoms listed in
    # LIFE_THREATENING_SYMPTOMS below will auto-trigger an EMERGENCY when
    # present ALONE. Other items here contribute to severity scoring and
    # dangerous-combination checks but do not single-handedly raise an
    # emergency alert (e.g. `chest_pain` alone can be GERD/muscle strain).
    EMERGENCY_SYMPTOMS = {
        'chest_pain': 5,
        'breathlessness': 5,
        'coma': 5,
        'paralysis': 5,
        'weakness_of_one_body_side': 5,
        'altered_sensorium': 5,
        'stomach_bleeding': 5,
        'blood_in_sputum': 4,
        'bloody_stool': 4,
        'acute_liver_failure': 5,
        'high_fever': 3,
        'severe_chest_pain': 5,
        'unconsciousness': 5,
        'seizures': 5,
        'severe_bleeding': 5,
    }

    # Symptoms that are unambiguously life-threatening even when reported
    # as a single / stand-alone symptom. These bypass the combination check
    # and immediately escalate to EMERGENCY.
    LIFE_THREATENING_SYMPTOMS = {
        'coma',
        'unconsciousness',
        'paralysis',
        'weakness_of_one_body_side',
        'altered_sensorium',
        'seizures',
        'severe_bleeding',
        'stomach_bleeding',
        'acute_liver_failure',
        'severe_chest_pain',
    }
    
    # Symptoms that indicate moderate severity
    MODERATE_SYMPTOMS = {
        'high_fever': 3,
        'vomiting': 2,
        'diarrhoea': 2,
        'dehydration': 3,
        'swelling_of_stomach': 3,
        'swelled_lymph_nodes': 2,
        'blurred_and_distorted_vision': 2,
        'palpitations': 2,
        'weight_loss': 2,
    }
    
    # Duration impact on severity
    DURATION_SEVERITY_MULTIPLIER = {
        'hours': 1.0,
        'days': 1.2,
        'weeks': 1.5,
        'months': 2.0,
    }
    
    # Symptom combinations that increase severity
    DANGEROUS_COMBINATIONS = [
        ({'chest_pain', 'breathlessness'}, 'EMERGENCY'),
        ({'chest_pain', 'sweating', 'nausea'}, 'EMERGENCY'),  # Heart attack signs
        ({'high_fever', 'altered_sensorium'}, 'EMERGENCY'),
        ({'weakness_of_one_body_side', 'slurred_speech'}, 'EMERGENCY'),  # Stroke signs
        ({'vomiting', 'blood_in_sputum'}, 'SEVERE'),
        ({'high_fever', 'skin_rash', 'headache'}, 'SEVERE'),  # Meningitis signs
        ({'diarrhoea', 'vomiting', 'dehydration'}, 'SEVERE'),
        ({'breathlessness', 'chest_tightness', 'cough'}, 'SEVERE'),
    ]
    
    def __init__(self):
        self.symptom_weights = {}
        self.ml_model = None
        self.label_encoder = LabelEncoder()
        self.symptom_to_idx = {}
        self.is_trained = False
        
    def load_symptom_weights(self):
        """Load symptom severity weights from CSV"""
        try:
            df = pd.read_csv(SYMPTOM_SEVERITY_PATH)
            self.symptom_weights = dict(zip(
                df['Symptom'].str.strip().str.lower().str.replace(' ', '_'),
                df['weight']
            ))
            print(f"Loaded {len(self.symptom_weights)} symptom weights")
        except Exception as e:
            print(f"Warning: Could not load symptom weights: {e}")
            self.symptom_weights = {}
    
    def build_training_data(self, symptom_list: List[str]) -> Tuple[np.ndarray, np.ndarray]:
        """
        Generate synthetic training data for severity classification
        Based on symptom weights and medical knowledge
        """
        self.symptom_to_idx = {s: i for i, s in enumerate(symptom_list)}
        n_symptoms = len(symptom_list)
        
        X = []
        y = []
        
        # Generate samples for each severity level
        np.random.seed(RANDOM_STATE)
        
        # MILD cases: 1-2 low weight symptoms
        for _ in range(500):
            vector = np.zeros(n_symptoms)
            n_symptoms_to_add = np.random.randint(1, 3)
            mild_symptoms = [s for s, w in self.symptom_weights.items() 
                           if w <= 3 and s in self.symptom_to_idx]
            if mild_symptoms:
                chosen = np.random.choice(mild_symptoms, 
                                         min(n_symptoms_to_add, len(mild_symptoms)), 
                                         replace=False)
                for s in chosen:
                    vector[self.symptom_to_idx[s]] = 1
                X.append(vector)
                y.append(SeverityLevel.MILD)
        
        # MODERATE cases: 2-4 medium weight symptoms
        for _ in range(500):
            vector = np.zeros(n_symptoms)
            n_symptoms_to_add = np.random.randint(2, 5)
            moderate_symptoms = [s for s, w in self.symptom_weights.items() 
                               if 3 <= w <= 5 and s in self.symptom_to_idx]
            if moderate_symptoms:
                chosen = np.random.choice(moderate_symptoms, 
                                         min(n_symptoms_to_add, len(moderate_symptoms)), 
                                         replace=False)
                for s in chosen:
                    vector[self.symptom_to_idx[s]] = 1
                X.append(vector)
                y.append(SeverityLevel.MODERATE)
        
        # SEVERE cases: 3-5 high weight symptoms
        for _ in range(400):
            vector = np.zeros(n_symptoms)
            n_symptoms_to_add = np.random.randint(3, 6)
            severe_symptoms = [s for s, w in self.symptom_weights.items() 
                             if w >= 5 and s in self.symptom_to_idx]
            if severe_symptoms:
                chosen = np.random.choice(severe_symptoms, 
                                         min(n_symptoms_to_add, len(severe_symptoms)), 
                                         replace=False)
                for s in chosen:
                    vector[self.symptom_to_idx[s]] = 1
                X.append(vector)
                y.append(SeverityLevel.SEVERE)
        
        # EMERGENCY cases: life-threatening single symptoms OR dangerous
        # combinations. We avoid training the model to flag ambiguous
        # symptoms (like chest_pain alone) as EMERGENCY.
        life_threatening = [s for s in self.LIFE_THREATENING_SYMPTOMS
                            if s in self.symptom_to_idx]
        # Half the emergency samples: a single life-threatening symptom
        for _ in range(150):
            if not life_threatening:
                break
            vector = np.zeros(n_symptoms)
            chosen = np.random.choice(life_threatening, 1, replace=False)
            for s in chosen:
                vector[self.symptom_to_idx[s]] = 1
            X.append(vector)
            y.append(SeverityLevel.EMERGENCY)

        # Other half: dangerous combinations from DANGEROUS_COMBINATIONS
        emergency_combos = [combo for combo, level in self.DANGEROUS_COMBINATIONS
                            if level == SeverityLevel.EMERGENCY
                            and all(s in self.symptom_to_idx for s in combo)]
        for _ in range(150):
            if not emergency_combos:
                break
            vector = np.zeros(n_symptoms)
            combo = emergency_combos[np.random.randint(0, len(emergency_combos))]
            for s in combo:
                vector[self.symptom_to_idx[s]] = 1
            X.append(vector)
            y.append(SeverityLevel.EMERGENCY)
        
        return np.array(X), np.array(y)
    
    def train(self, symptom_list: List[str]):
        """Train the severity detection model"""
        print("\n" + "="*50)
        print("TRAINING SEVERITY DETECTION MODEL")
        print("="*50)
        
        # Load symptom weights
        self.load_symptom_weights()
        
        # Build training data
        X, y = self.build_training_data(symptom_list)
        print(f"Generated {len(X)} training samples")
        
        # Encode labels
        y_encoded = self.label_encoder.fit_transform(y)
        
        # Split data
        X_train, X_test, y_train, y_test = train_test_split(
            X, y_encoded, test_size=0.2, random_state=RANDOM_STATE, stratify=y_encoded
        )
        
        # Train Gradient Boosting model
        self.ml_model = GradientBoostingClassifier(
            n_estimators=100,
            max_depth=5,
            learning_rate=0.1,
            random_state=RANDOM_STATE
        )
        
        self.ml_model.fit(X_train, y_train)
        
        # Evaluate
        accuracy = self.ml_model.score(X_test, y_test)
        print(f"Severity Model Accuracy: {accuracy:.4f}")
        
        self.is_trained = True
        return accuracy
    
    def predict_severity(self, symptoms: List[str], duration: str = None) -> Dict:
        """
        Predict severity level for given symptoms
        
        Args:
            symptoms: List of symptom strings
            duration: Optional duration string (e.g., "3 days")
            
        Returns:
            Dict with severity level, score, and explanation
        """
        # Check for emergency combinations first (rule-based)
        symptom_set = set(symptoms)
        
        for combination, level in self.DANGEROUS_COMBINATIONS:
            if combination.issubset(symptom_set):
                return {
                    'level': level,
                    'score': 10.0,
                    'confidence': 0.95,
                    'reason': f"Dangerous symptom combination detected: {combination}",
                    'is_emergency': level == SeverityLevel.EMERGENCY
                }
        
        # Check for life-threatening single symptoms.
        # Only symptoms in LIFE_THREATENING_SYMPTOMS (e.g. coma, seizures,
        # severe bleeding, stroke signs) auto-trigger EMERGENCY on their own.
        # Other serious symptoms like `chest_pain` or `breathlessness` alone
        # are treated as SEVERE and only escalate to EMERGENCY when they
        # appear in a dangerous combination (handled above).
        for symptom in symptoms:
            if symptom in self.LIFE_THREATENING_SYMPTOMS:
                return {
                    'level': SeverityLevel.EMERGENCY,
                    'score': 10.0,
                    'confidence': 0.9,
                    'reason': f"Critical symptom detected: {symptom}",
                    'is_emergency': True
                }
        
        # Calculate weighted score
        total_weight = 0
        max_weight = 0
        
        for symptom in symptoms:
            weight = self.symptom_weights.get(symptom, 3)  # Default weight 3
            total_weight += weight
            max_weight = max(max_weight, weight)
        
        # Average weight with max weight consideration
        if symptoms:
            avg_weight = total_weight / len(symptoms)
            score = (avg_weight * 0.6 + max_weight * 0.4)
        else:
            score = 0
        
        # Apply duration multiplier
        if duration:
            duration_lower = duration.lower()
            for dur_type, multiplier in self.DURATION_SEVERITY_MULTIPLIER.items():
                if dur_type in duration_lower:
                    score *= multiplier
                    break
        
        # Use ML model if trained
        if self.is_trained and self.ml_model is not None:
            vector = np.zeros(len(self.symptom_to_idx))
            for symptom in symptoms:
                if symptom in self.symptom_to_idx:
                    vector[self.symptom_to_idx[symptom]] = 1
            
            ml_prediction = self.label_encoder.inverse_transform(
                self.ml_model.predict([vector])
            )[0]
            ml_proba = self.ml_model.predict_proba([vector])[0]
            ml_confidence = max(ml_proba)
            
            # Combine rule-based and ML predictions
            rule_level = self._score_to_level(score)
            
            # Use ML prediction if confidence is high
            if ml_confidence > 0.7:
                level = ml_prediction
                confidence = ml_confidence
            else:
                level = rule_level
                confidence = 0.8

            # Safeguard: the ML model may have been trained on older data
            # that marked ambiguous single symptoms (e.g. chest_pain alone)
            # as EMERGENCY. Since the rule-based checks above did NOT fire
            # (no life-threatening single symptom and no dangerous combo),
            # downgrade an ML-predicted EMERGENCY to SEVERE to avoid false
            # alarms. Real emergencies are caught by the rule-based logic.
            if level == SeverityLevel.EMERGENCY:
                level = SeverityLevel.SEVERE
                confidence = min(confidence, 0.85)
        else:
            level = self._score_to_level(score)
            confidence = 0.8

        # Extra safeguard for the rule-based path too: _score_to_level can
        # return EMERGENCY for high weighted scores. Only allow EMERGENCY
        # here if at least one life-threatening symptom is present.
        if level == SeverityLevel.EMERGENCY and not any(
            s in self.LIFE_THREATENING_SYMPTOMS for s in symptoms
        ):
            level = SeverityLevel.SEVERE
        
        return {
            'level': level,
            'score': round(score, 2),
            'confidence': round(confidence, 2),
            'reason': self._get_severity_reason(symptoms, level),
            'is_emergency': level == SeverityLevel.EMERGENCY
        }
    
    def _score_to_level(self, score: float) -> str:
        """Convert numeric score to severity level"""
        if score >= 7:
            return SeverityLevel.EMERGENCY
        elif score >= 5:
            return SeverityLevel.SEVERE
        elif score >= 3:
            return SeverityLevel.MODERATE
        else:
            return SeverityLevel.MILD
    
    def _get_severity_reason(self, symptoms: List[str], level: str) -> str:
        """Generate explanation for severity level"""
        high_weight_symptoms = [s for s in symptoms 
                               if self.symptom_weights.get(s, 0) >= 5]
        
        if level == SeverityLevel.EMERGENCY:
            if high_weight_symptoms:
                return f"Critical symptoms detected: {', '.join(high_weight_symptoms)}"
            return "Multiple severe symptoms indicate emergency"
        
        elif level == SeverityLevel.SEVERE:
            return f"Serious symptoms require medical attention: {', '.join(symptoms[:3])}"
        
        elif level == SeverityLevel.MODERATE:
            return "Symptoms should be monitored; consult doctor if they persist"
        
        else:
            return "Mild symptoms; rest and home care recommended"
    
    def save(self, path: Path = MODEL_DIR):
        """Save the severity model"""
        path.mkdir(exist_ok=True)
        
        state = {
            'ml_model': self.ml_model,
            'label_encoder': self.label_encoder,
            'symptom_to_idx': self.symptom_to_idx,
            'symptom_weights': self.symptom_weights,
            'is_trained': self.is_trained
        }
        
        joblib.dump(state, path / 'severity_model.joblib')
        print(f"Saved severity model to {path / 'severity_model.joblib'}")
    
    def load(self, path: Path = MODEL_DIR):
        """Load the severity model"""
        state = joblib.load(path / 'severity_model.joblib')
        
        self.ml_model = state['ml_model']
        self.label_encoder = state['label_encoder']
        self.symptom_to_idx = state['symptom_to_idx']
        self.symptom_weights = state['symptom_weights']
        self.is_trained = state['is_trained']
        
        print(f"Loaded severity model from {path / 'severity_model.joblib'}")


def train_severity_model():
    """Train and save the severity model"""
    from data_preprocessing import DataPreprocessor
    
    # Load preprocessor to get symptom list
    preprocessor = DataPreprocessor()
    df = preprocessor.load_main_dataset()
    preprocessor.prepare_training_data(df)
    
    # Train severity model
    severity_model = SeverityDetectionModel()
    severity_model.train(preprocessor.symptom_list)
    severity_model.save()
    
    # Test predictions
    print("\n" + "="*50)
    print("TESTING SEVERITY PREDICTIONS")
    print("="*50)
    
    test_cases = [
        (['itching', 'skin_rash'], None),
        (['fever', 'headache'], "2 days"),
        (['chest_pain', 'breathlessness'], None),
        (['vomiting', 'diarrhoea', 'dehydration'], "3 days"),
        (['high_fever', 'altered_sensorium'], None),
    ]
    
    for symptoms, duration in test_cases:
        result = severity_model.predict_severity(symptoms, duration)
        print(f"\nSymptoms: {symptoms} | Duration: {duration}")
        print(f"Level: {result['level']} | Score: {result['score']} | Emergency: {result['is_emergency']}")
        print(f"Reason: {result['reason']}")
    
    return severity_model


if __name__ == "__main__":
    train_severity_model()

