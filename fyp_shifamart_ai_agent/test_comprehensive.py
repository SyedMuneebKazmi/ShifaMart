"""
Comprehensive test of NLP and Disease Prediction with human-like inputs
"""
import requests
import json
import time

API_URL = "http://localhost:8000"

# Test cases: (disease_name, human_input, expected_symptoms)
TEST_CASES = [
    # Common diseases
    ("Common Cold", "i have runny nose and sneezing since yesterday", ["runny_nose", "continuous_sneezing"]),
    ("Flu/Influenza", "high fever with body ache and feeling very tired", ["high_fever", "muscle_pain", "fatigue"]),
    ("Malaria", "i have high fever with chills and sweating", ["high_fever", "chills", "sweating"]),
    ("Typhoid", "fever with headache and stomach pain for a week", ["high_fever", "headache", "stomach_pain"]),
    ("Dengue", "high fever, joint pain and skin rash", ["high_fever", "joint_pain", "skin_rash"]),
    
    # Digestive diseases
    ("Gastroenteritis", "stomach pain with vomiting and loose motion", ["stomach_pain", "vomiting", "diarrhoea"]),
    ("GERD/Acidity", "burning sensation in chest and acidity problem", ["chest_pain", "acidity"]),
    ("Jaundice", "my skin is turning yellow and I feel weak", ["yellowish_skin", "weakness"]),
    ("Hepatitis", "stomach pain, yellow skin and very tired", ["stomach_pain", "yellowish_skin", "fatigue"]),
    
    # Respiratory diseases
    ("Pneumonia", "high fever with cough and difficulty breathing", ["high_fever", "cough", "breathlessness"]),
    ("Bronchitis", "persistent cough with phlegm and chest pain", ["cough", "phlegm", "chest_pain"]),
    ("Asthma", "difficulty breathing and wheezing sound", ["breathlessness"]),
    ("Tuberculosis", "cough with blood in sputum and weight loss", ["cough", "blood_in_sputum", "weight_loss"]),
    
    # Skin diseases
    ("Fungal infection", "itching and skin rash on my body", ["itching", "skin_rash"]),
    ("Acne", "pimples on my face and skin breakout", ["skin_rash"]),
    ("Psoriasis", "red patches on skin with itching", ["skin_rash", "itching"]),
    
    # Metabolic diseases
    ("Diabetes", "feeling very tired, always hungry and urinating frequently", ["fatigue", "excessive_hunger", "polyuria"]),
    ("Hyperthyroidism", "weight loss, feeling restless and sweating a lot", ["weight_loss", "restlessness", "sweating"]),
    ("Hypothyroidism", "weight gain, feeling cold and very tired", ["weight_gain", "fatigue"]),
    
    # Heart related
    ("Heart attack", "severe chest pain and shortness of breath", ["chest_pain", "breathlessness"]),
    ("Hypertension", "headache and feeling dizzy", ["headache", "dizziness"]),
    
    # Neurological
    ("Migraine", "severe headache with nausea and cant see clearly", ["headache", "nausea", "blurred_and_distorted_vision"]),
    ("Vertigo", "feeling dizzy and everything is spinning", ["dizziness"]),
    
    # Urinary
    ("UTI", "burning when urinating and frequent urination", ["burning_micturition", "frequent_urination"]),
    
    # Women's health
    ("Menstrual problems", "heavy bleeding during periods with pain", ["heavy_menstrual_flow", "painful_menstruation"]),
    ("Vaginal infection", "vaginal discharge and itching down there", ["vaginal_discharge", "vaginal_itching"]),
    
    # Other
    ("Food poisoning", "vomiting and diarrhea after eating", ["vomiting", "diarrhoea"]),
    ("Allergy", "sneezing, itching and watery eyes", ["continuous_sneezing", "itching", "watering_from_eyes"]),
    ("Arthritis", "joint pain and stiffness in morning", ["joint_pain"]),
]

def test_nlp(text, expected_symptoms):
    """Test if NLP extracts expected symptoms"""
    try:
        response = requests.post(f"{API_URL}/nlp/analyze", json={"text": text})
        result = response.json()
        extracted = set(result.get('symptoms', []))
        expected = set(expected_symptoms)
        
        # Check if at least one expected symptom was found
        found = extracted.intersection(expected)
        return len(found) > 0, list(extracted), list(found)
    except Exception as e:
        return False, [], []

def test_prediction(symptoms):
    """Test disease prediction"""
    try:
        response = requests.post(f"{API_URL}/predict/symptoms", json={"symptoms": symptoms})
        result = response.json()
        predictions = result.get('predictions', [])
        if predictions:
            return predictions[0]['disease'], predictions[0]['confidence_percent']
        return None, "0%"
    except Exception as e:
        return None, "Error"

def run_tests():
    print("=" * 70)
    print("COMPREHENSIVE NLP & DISEASE PREDICTION TEST")
    print("=" * 70)
    
    nlp_pass = 0
    pred_pass = 0
    total = len(TEST_CASES)
    
    results = []
    
    for disease, human_input, expected_symptoms in TEST_CASES:
        # Test NLP
        nlp_ok, extracted, found = test_nlp(human_input, expected_symptoms)
        
        # Test Prediction
        pred_disease, confidence = test_prediction(extracted if extracted else expected_symptoms)
        
        # Check if predicted disease matches (partial match)
        disease_match = pred_disease and (
            disease.lower() in pred_disease.lower() or 
            pred_disease.lower() in disease.lower() or
            disease.split('/')[0].lower() in pred_disease.lower()
        )
        
        if nlp_ok:
            nlp_pass += 1
        if disease_match:
            pred_pass += 1
        
        nlp_status = "[OK]" if nlp_ok else "[FAIL]"
        pred_status = "[OK]" if disease_match else "[--]"
        
        results.append({
            'disease': disease,
            'input': human_input[:40] + "..." if len(human_input) > 40 else human_input,
            'nlp_ok': nlp_ok,
            'extracted': extracted[:3],
            'predicted': pred_disease,
            'confidence': confidence,
            'pred_ok': disease_match
        })
    
    # Print results
    print("\n{:<25} {:<15} {:<25} {:<10}".format("Disease", "NLP", "Predicted", "Conf"))
    print("-" * 75)
    
    for r in results:
        nlp_mark = "[OK]" if r['nlp_ok'] else "[FAIL]"
        pred_mark = "[OK]" if r['pred_ok'] else ""
        extracted_short = ", ".join(r['extracted'][:2])[:20]
        print("{:<25} {:<15} {:<25} {:<10} {}".format(
            r['disease'][:24],
            nlp_mark + " " + extracted_short[:10],
            (r['predicted'] or "None")[:24],
            r['confidence'],
            pred_mark
        ))
    
    print("\n" + "=" * 70)
    print(f"NLP ACCURACY:        {nlp_pass}/{total} ({nlp_pass/total*100:.1f}%)")
    print(f"PREDICTION ACCURACY: {pred_pass}/{total} ({pred_pass/total*100:.1f}%)")
    print("=" * 70)
    
    # Show failed NLP cases
    failed_nlp = [r for r in results if not r['nlp_ok']]
    if failed_nlp:
        print("\nFailed NLP cases:")
        for r in failed_nlp:
            print(f"  - {r['disease']}: \"{r['input']}\"")

if __name__ == "__main__":
    run_tests()

