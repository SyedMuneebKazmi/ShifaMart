"""
Data Preprocessing Module for ShifaMart+ AI Agent
Handles loading and preprocessing of symptom-disease datasets
"""
import pandas as pd
import numpy as np
from sklearn.preprocessing import LabelEncoder, MultiLabelBinarizer
from typing import Tuple, Dict, List
import joblib
from pathlib import Path

from config import (
    DATASET_PATH, 
    SYMPTOM_DESCRIPTION_PATH,
    SYMPTOM_PRECAUTION_PATH,
    SYMPTOM_SEVERITY_PATH,
    MODEL_DIR
)


class DataPreprocessor:
    """Handles all data preprocessing for the disease prediction model"""
    
    def __init__(self):
        self.symptom_list = []
        self.disease_list = []
        self.label_encoder = LabelEncoder()
        self.symptom_to_idx = {}
        self.idx_to_symptom = {}
        self.disease_descriptions = {}
        self.disease_precautions = {}
        self.symptom_severity = {}
        
    def load_main_dataset(self) -> pd.DataFrame:
        """Load and clean the main symptom-disease dataset"""
        print("Loading main dataset...")
        df = pd.read_csv(DATASET_PATH)
        
        # Clean column names
        df.columns = df.columns.str.strip()
        
        # Get symptom columns
        symptom_cols = [col for col in df.columns if col.startswith('Symptom')]
        
        # Clean symptom values - strip whitespace and handle NaN
        for col in symptom_cols:
            df[col] = df[col].fillna('').astype(str).str.strip().str.lower().str.replace(' ', '_')
        
        # Clean disease names
        df['Disease'] = df['Disease'].str.strip()
        
        print(f"Loaded {len(df)} records with {len(df['Disease'].unique())} unique diseases")
        return df
    
    def load_auxiliary_data(self):
        """Load symptom descriptions, precautions, and severity data"""
        
        # Load symptom descriptions
        print("Loading symptom descriptions...")
        try:
            desc_df = pd.read_csv(SYMPTOM_DESCRIPTION_PATH)
            self.disease_descriptions = dict(zip(
                desc_df['Disease'].str.strip(), 
                desc_df['Description']
            ))
        except Exception as e:
            print(f"Warning: Could not load descriptions - {e}")
        
        # Load precautions
        print("Loading precautions...")
        try:
            prec_df = pd.read_csv(SYMPTOM_PRECAUTION_PATH)
            for _, row in prec_df.iterrows():
                disease = row['Disease'].strip()
                precautions = [
                    row.get('Precaution_1', ''),
                    row.get('Precaution_2', ''),
                    row.get('Precaution_3', ''),
                    row.get('Precaution_4', '')
                ]
                self.disease_precautions[disease] = [p for p in precautions if pd.notna(p) and p]
        except Exception as e:
            print(f"Warning: Could not load precautions - {e}")
        
        # Load symptom severity
        print("Loading symptom severity...")
        try:
            sev_df = pd.read_csv(SYMPTOM_SEVERITY_PATH)
            self.symptom_severity = dict(zip(
                sev_df['Symptom'].str.strip().str.lower().str.replace(' ', '_'),
                sev_df['weight']
            ))
        except Exception as e:
            print(f"Warning: Could not load severity - {e}")
            
        print(f"Loaded {len(self.disease_descriptions)} descriptions, "
              f"{len(self.disease_precautions)} precautions, "
              f"{len(self.symptom_severity)} symptom severities")
    
    def extract_symptoms(self, df: pd.DataFrame) -> Tuple[List[List[str]], List[str]]:
        """Extract symptoms list and disease labels from dataframe"""
        symptom_cols = [col for col in df.columns if col.startswith('Symptom')]
        
        all_symptoms = []
        diseases = []
        
        for _, row in df.iterrows():
            # Get non-empty symptoms for this row
            symptoms = []
            for col in symptom_cols:
                symptom = row[col]
                # Check for valid string symptoms (not NaN, not empty)
                if isinstance(symptom, str) and symptom.strip() and symptom.lower() != 'nan':
                    symptoms.append(symptom.strip())
            
            all_symptoms.append(symptoms)
            diseases.append(row['Disease'])
        
        return all_symptoms, diseases
    
    def build_symptom_vocabulary(self, symptoms_list: List[List[str]]):
        """Build symptom vocabulary from all symptoms"""
        unique_symptoms = set()
        for symptoms in symptoms_list:
            unique_symptoms.update(symptoms)
        
        # Remove empty strings, 'nan', and any non-string values (like float NaN)
        unique_symptoms.discard('')
        unique_symptoms.discard('nan')
        unique_symptoms = {s for s in unique_symptoms if isinstance(s, str) and s.strip()}
        
        self.symptom_list = sorted(list(unique_symptoms))
        self.symptom_to_idx = {s: i for i, s in enumerate(self.symptom_list)}
        self.idx_to_symptom = {i: s for i, s in enumerate(self.symptom_list)}
        
        print(f"Built vocabulary with {len(self.symptom_list)} unique symptoms")
        return self.symptom_list
    
    def symptoms_to_vector(self, symptoms: List[str]) -> np.ndarray:
        """Convert list of symptoms to binary vector"""
        vector = np.zeros(len(self.symptom_list))
        for symptom in symptoms:
            symptom = symptom.strip().lower().replace(' ', '_')
            if symptom in self.symptom_to_idx:
                vector[self.symptom_to_idx[symptom]] = 1
        return vector
    
    def prepare_training_data(self, df: pd.DataFrame, max_samples_per_disease: int = None, min_samples_per_disease: int = 2) -> Tuple[np.ndarray, np.ndarray]:
        """Prepare X (symptoms) and y (diseases) for training
        
        Args:
            df: DataFrame with Disease and Symptom columns
            max_samples_per_disease: If set, sample this many rows per disease to limit memory
            min_samples_per_disease: Minimum samples per disease (for stratified split)
        """
        from scipy import sparse
        
        # Filter out diseases with too few samples
        disease_counts = df['Disease'].value_counts()
        valid_diseases = disease_counts[disease_counts >= min_samples_per_disease].index
        original_count = len(df)
        df = df[df['Disease'].isin(valid_diseases)].copy()
        print(f"Filtered: {len(valid_diseases)} diseases with >= {min_samples_per_disease} samples ({len(df)}/{original_count} rows)")
        
        # Sample data if too large
        if max_samples_per_disease:
            print(f"Sampling max {max_samples_per_disease} per disease...")
            df = df.groupby('Disease', group_keys=False).apply(
                lambda x: x.sample(min(len(x), max_samples_per_disease), random_state=42)
            ).reset_index(drop=True)
            print(f"Sampled to {len(df)} records")
        
        symptoms_list, diseases = self.extract_symptoms(df)
        
        # Build vocabulary
        self.build_symptom_vocabulary(symptoms_list)
        
        # Encode diseases
        self.disease_list = list(df['Disease'].unique())
        self.label_encoder.fit(diseases)
        
        # Convert symptoms to sparse matrix for memory efficiency
        print("Converting symptoms to feature matrix...")
        n_samples = len(symptoms_list)
        n_features = len(self.symptom_list)
        
        # Build sparse matrix
        rows = []
        cols = []
        for i, symptoms in enumerate(symptoms_list):
            for symptom in symptoms:
                symptom = symptom.strip().lower().replace(' ', '_')
                if symptom in self.symptom_to_idx:
                    rows.append(i)
                    cols.append(self.symptom_to_idx[symptom])
        
        data = np.ones(len(rows))
        X_sparse = sparse.csr_matrix((data, (rows, cols)), shape=(n_samples, n_features))
        
        # Convert to dense for sklearn (but more memory efficient creation)
        X = X_sparse.toarray().astype(np.float32)  # Use float32 to save memory
        y = self.label_encoder.transform(diseases)
        
        print(f"Prepared data: X shape = {X.shape}, y shape = {y.shape}")
        print(f"Number of classes: {len(self.disease_list)}")
        
        return X, y
    
    def calculate_severity(self, symptoms: List[str]) -> Tuple[float, str]:
        """Calculate severity score based on symptoms"""
        if not symptoms:
            return 0, "UNKNOWN"
        
        total_weight = 0
        count = 0
        
        for symptom in symptoms:
            symptom = symptom.strip().lower().replace(' ', '_')
            if symptom in self.symptom_severity:
                total_weight += self.symptom_severity[symptom]
                count += 1
        
        if count == 0:
            return 0, "UNKNOWN"
        
        avg_severity = total_weight / count
        
        # Determine severity level
        if avg_severity < 3:
            level = "MILD"
        elif avg_severity < 5:
            level = "MODERATE"
        elif avg_severity < 7:
            level = "SEVERE"
        else:
            level = "EMERGENCY"
        
        return avg_severity, level
    
    def save(self, path: Path = MODEL_DIR):
        """Save preprocessor state"""
        state = {
            'symptom_list': self.symptom_list,
            'disease_list': self.disease_list,
            'label_encoder': self.label_encoder,
            'symptom_to_idx': self.symptom_to_idx,
            'idx_to_symptom': self.idx_to_symptom,
            'disease_descriptions': self.disease_descriptions,
            'disease_precautions': self.disease_precautions,
            'symptom_severity': self.symptom_severity
        }
        joblib.dump(state, path / 'preprocessor.joblib')
        print(f"Saved preprocessor to {path / 'preprocessor.joblib'}")
    
    def load(self, path: Path = MODEL_DIR):
        """Load preprocessor state"""
        state = joblib.load(path / 'preprocessor.joblib')
        self.symptom_list = state['symptom_list']
        self.disease_list = state['disease_list']
        self.label_encoder = state['label_encoder']
        self.symptom_to_idx = state['symptom_to_idx']
        self.idx_to_symptom = state['idx_to_symptom']
        self.disease_descriptions = state['disease_descriptions']
        self.disease_precautions = state['disease_precautions']
        self.symptom_severity = state['symptom_severity']
        print(f"Loaded preprocessor from {path / 'preprocessor.joblib'}")


def main():
    """Test the preprocessor"""
    preprocessor = DataPreprocessor()
    
    # Load data
    df = preprocessor.load_main_dataset()
    preprocessor.load_auxiliary_data()
    
    # Prepare training data
    X, y = preprocessor.prepare_training_data(df)
    
    # Save preprocessor
    preprocessor.save()
    
    # Print some stats
    print("\n" + "="*50)
    print("DATASET STATISTICS")
    print("="*50)
    print(f"Total samples: {len(X)}")
    print(f"Total symptoms: {len(preprocessor.symptom_list)}")
    print(f"Total diseases: {len(preprocessor.disease_list)}")
    print(f"\nSample symptoms: {preprocessor.symptom_list[:10]}")
    print(f"\nSample diseases: {preprocessor.disease_list[:10]}")
    
    # Test severity calculation
    test_symptoms = ['high_fever', 'headache', 'chest_pain']
    severity_score, severity_level = preprocessor.calculate_severity(test_symptoms)
    print(f"\nTest severity for {test_symptoms}:")
    print(f"Score: {severity_score:.2f}, Level: {severity_level}")


if __name__ == "__main__":
    main()

