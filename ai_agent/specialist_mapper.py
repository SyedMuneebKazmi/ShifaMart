"""
Specialist Doctor Mapper for ShifaMart+ AI Agent
Maps diseases to appropriate medical specialists
"""
from typing import Dict, List, Tuple

class SpecialistMapper:
    """Maps diseases to appropriate medical specialists"""
    
    # Specialist definitions with descriptions
    SPECIALISTS = {
        'cardiologist': {
            'name': 'Cardiologist',
            'description': 'Heart and cardiovascular system specialist',
            'icon': '❤️'
        },
        'dermatologist': {
            'name': 'Dermatologist', 
            'description': 'Skin, hair, and nail specialist',
            'icon': '🧴'
        },
        'gastroenterologist': {
            'name': 'Gastroenterologist',
            'description': 'Digestive system and stomach specialist',
            'icon': '🫁'
        },
        'neurologist': {
            'name': 'Neurologist',
            'description': 'Brain and nervous system specialist',
            'icon': '🧠'
        },
        'orthopedic': {
            'name': 'Orthopedic Surgeon',
            'description': 'Bone, joint, and muscle specialist',
            'icon': '🦴'
        },
        'pulmonologist': {
            'name': 'Pulmonologist',
            'description': 'Lung and respiratory specialist',
            'icon': '🫁'
        },
        'endocrinologist': {
            'name': 'Endocrinologist',
            'description': 'Hormone and diabetes specialist',
            'icon': '💉'
        },
        'gynecologist': {
            'name': 'Gynecologist',
            'description': "Women's health specialist",
            'icon': '👩‍⚕️'
        },
        'urologist': {
            'name': 'Urologist',
            'description': 'Urinary system and male reproductive specialist',
            'icon': '🩺'
        },
        'ophthalmologist': {
            'name': 'Ophthalmologist',
            'description': 'Eye specialist',
            'icon': '👁️'
        },
        'ent': {
            'name': 'ENT Specialist',
            'description': 'Ear, Nose, and Throat specialist',
            'icon': '👂'
        },
        'psychiatrist': {
            'name': 'Psychiatrist',
            'description': 'Mental health specialist',
            'icon': '🧘'
        },
        'hepatologist': {
            'name': 'Hepatologist',
            'description': 'Liver specialist',
            'icon': '🫀'
        },
        'nephrologist': {
            'name': 'Nephrologist',
            'description': 'Kidney specialist',
            'icon': '🫘'
        },
        'oncologist': {
            'name': 'Oncologist',
            'description': 'Cancer specialist',
            'icon': '🎗️'
        },
        'rheumatologist': {
            'name': 'Rheumatologist',
            'description': 'Arthritis and autoimmune disease specialist',
            'icon': '🦵'
        },
        'infectious_disease': {
            'name': 'Infectious Disease Specialist',
            'description': 'Specialist for infections and tropical diseases',
            'icon': '🦠'
        },
        'general_physician': {
            'name': 'General Physician',
            'description': 'Primary care doctor for general health issues',
            'icon': '👨‍⚕️'
        },
        'allergist': {
            'name': 'Allergist/Immunologist',
            'description': 'Allergy and immune system specialist',
            'icon': '🤧'
        },
        'hematologist': {
            'name': 'Hematologist',
            'description': 'Blood disorder specialist',
            'icon': '🩸'
        },
        'emergency': {
            'name': 'Emergency Medicine',
            'description': 'Immediate emergency care required',
            'icon': '🚨'
        }
    }
    
    # Disease to specialist mapping
    DISEASE_SPECIALIST_MAP = {
        # Heart/Cardiovascular diseases
        'heart attack': 'cardiologist',
        'hypertension': 'cardiologist',
        'heart disease': 'cardiologist',
        'coronary artery disease': 'cardiologist',
        'arrhythmia': 'cardiologist',
        'heart failure': 'cardiologist',
        'angina': 'cardiologist',
        'atherosclerosis': 'cardiologist',
        'central atherosclerosis': 'cardiologist',
        'myocardial infarction': 'cardiologist',
        'pericarditis': 'cardiologist',
        'varicose veins': 'cardiologist',
        'varicose': 'cardiologist',
        
        # Skin diseases
        'fungal infection': 'dermatologist',
        'acne': 'dermatologist',
        'psoriasis': 'dermatologist',
        'eczema': 'dermatologist',
        'dermatitis': 'dermatologist',
        'skin rash': 'dermatologist',
        'impetigo': 'dermatologist',
        'vitiligo': 'dermatologist',
        'melanoma': 'dermatologist',
        'cellulitis': 'dermatologist',
        'ringworm': 'dermatologist',
        'scabies': 'dermatologist',
        'herpes': 'dermatologist',
        'shingles': 'dermatologist',
        'urticaria': 'dermatologist',
        
        # Digestive/GI diseases
        'gerd': 'gastroenterologist',
        'gastroenteritis': 'gastroenterologist',
        'peptic ulcer': 'gastroenterologist',
        'peptic ulcer diseae': 'gastroenterologist',
        'irritable bowel syndrome': 'gastroenterologist',
        'ibs': 'gastroenterologist',
        'crohn': 'gastroenterologist',
        'ulcerative colitis': 'gastroenterologist',
        'gastritis': 'gastroenterologist',
        'acid reflux': 'gastroenterologist',
        'constipation': 'gastroenterologist',
        'diarrhea': 'gastroenterologist',
        'food poisoning': 'gastroenterologist',
        'appendicitis': 'gastroenterologist',
        'hemorrhoids': 'gastroenterologist',
        'dimorphic hemmorhoids(piles)': 'gastroenterologist',
        'piles': 'gastroenterologist',
        'pancreatitis': 'gastroenterologist',
        'gallstones': 'gastroenterologist',
        'cholecystitis': 'gastroenterologist',
        
        # Liver diseases
        'jaundice': 'hepatologist',
        'hepatitis': 'hepatologist',
        'hepatitis a': 'hepatologist',
        'hepatitis b': 'hepatologist',
        'hepatitis c': 'hepatologist',
        'hepatitis d': 'hepatologist',
        'hepatitis e': 'hepatologist',
        'cirrhosis': 'hepatologist',
        'fatty liver': 'hepatologist',
        'liver disease': 'hepatologist',
        'alcoholic hepatitis': 'hepatologist',
        'chronic cholestasis': 'hepatologist',
        
        # Neurological diseases
        'migraine': 'neurologist',
        'epilepsy': 'neurologist',
        'parkinson': 'neurologist',
        'alzheimer': 'neurologist',
        'stroke': 'neurologist',
        'paralysis': 'neurologist',
        'paralysis (brain hemorrhage)': 'neurologist',
        'vertigo': 'neurologist',
        'brain hemorrhage': 'neurologist',
        'meningitis': 'neurologist',
        'multiple sclerosis': 'neurologist',
        'neuropathy': 'neurologist',
        'cervical spondylosis': 'neurologist',
        'syringomyelia': 'neurologist',
        
        # Bone/Joint diseases
        'arthritis': 'orthopedic',
        'osteoarthritis': 'orthopedic',
        'osteoporosis': 'orthopedic',
        'fracture': 'orthopedic',
        'back pain': 'orthopedic',
        'spondylitis': 'orthopedic',
        'joint pain': 'orthopedic',
        'bone disease': 'orthopedic',
        'slipped disc': 'orthopedic',
        
        # Respiratory diseases
        'pneumonia': 'pulmonologist',
        'bronchitis': 'pulmonologist',
        'asthma': 'pulmonologist',
        'bronchial asthma': 'pulmonologist',
        'tuberculosis': 'pulmonologist',
        'copd': 'pulmonologist',
        'lung disease': 'pulmonologist',
        'emphysema': 'pulmonologist',
        'pleurisy': 'pulmonologist',
        'pulmonary fibrosis': 'pulmonologist',
        
        # Hormonal/Metabolic diseases
        'diabetes': 'endocrinologist',
        'thyroid': 'endocrinologist',
        'hyperthyroidism': 'endocrinologist',
        'hypothyroidism': 'endocrinologist',
        'hypoglycemia': 'endocrinologist',
        'obesity': 'endocrinologist',
        'pcos': 'endocrinologist',
        'adrenal': 'endocrinologist',
        'cushing': 'endocrinologist',
        
        # Women's health
        'menstrual': 'gynecologist',
        'abnormal menstruation': 'gynecologist',
        'vaginal': 'gynecologist',
        'vaginal infection': 'gynecologist',
        'pelvic inflammatory': 'gynecologist',
        'endometriosis': 'gynecologist',
        'ovarian': 'gynecologist',
        'pregnancy': 'gynecologist',
        'cervical': 'gynecologist',
        'uterine': 'gynecologist',
        'hpv': 'gynecologist',
        'genital warts': 'gynecologist',
        'pcos': 'gynecologist',
        'polycystic': 'gynecologist',
        
        # Urinary diseases
        'uti': 'urologist',
        'urinary tract infection': 'urologist',
        'kidney stone': 'urologist',
        'prostate': 'urologist',
        'bladder': 'urologist',
        'urinary': 'urologist',
        
        # Kidney diseases
        'kidney disease': 'nephrologist',
        'chronic kidney disease': 'nephrologist',
        'renal failure': 'nephrologist',
        'nephritis': 'nephrologist',
        
        # Eye diseases
        'cataract': 'ophthalmologist',
        'glaucoma': 'ophthalmologist',
        'eye infection': 'ophthalmologist',
        'conjunctivitis': 'ophthalmologist',
        'retinopathy': 'ophthalmologist',
        'macular degeneration': 'ophthalmologist',
        
        # ENT diseases
        'sinusitis': 'ent',
        'tonsillitis': 'ent',
        'ear infection': 'ent',
        'hearing loss': 'ent',
        'vertigo': 'ent',
        'throat infection': 'ent',
        'laryngitis': 'ent',
        
        # Mental health
        'depression': 'psychiatrist',
        'anxiety': 'psychiatrist',
        'bipolar': 'psychiatrist',
        'schizophrenia': 'psychiatrist',
        'ptsd': 'psychiatrist',
        'ocd': 'psychiatrist',
        'insomnia': 'psychiatrist',
        
        # Autoimmune/Rheumatic
        'rheumatoid arthritis': 'rheumatologist',
        'lupus': 'rheumatologist',
        'fibromyalgia': 'rheumatologist',
        'gout': 'rheumatologist',
        'scleroderma': 'rheumatologist',
        
        # Infectious diseases
        'malaria': 'infectious_disease',
        'dengue': 'infectious_disease',
        'typhoid': 'infectious_disease',
        'cholera': 'infectious_disease',
        'tuberculosis': 'infectious_disease',
        'hiv': 'infectious_disease',
        'aids': 'infectious_disease',
        'chicken pox': 'infectious_disease',
        'measles': 'infectious_disease',
        'mumps': 'infectious_disease',
        
        # Allergies
        'allergy': 'allergist',
        'allergic': 'allergist',
        'drug reaction': 'allergist',
        'food allergy': 'allergist',
        'hay fever': 'allergist',
        
        # Blood disorders
        'anemia': 'hematologist',
        'leukemia': 'hematologist',
        'lymphoma': 'hematologist',
        'hemophilia': 'hematologist',
        'thalassemia': 'hematologist',
        
        # Common diseases - General Physician
        'common cold': 'general_physician',
        'flu': 'general_physician',
        'influenza': 'general_physician',
        'fever': 'general_physician',
        'cold': 'general_physician',
        'cough': 'general_physician',
        
        # Emergency conditions
        'poisoning': 'emergency',
        'drug overdose': 'emergency',
        'severe bleeding': 'emergency',
        'unconscious': 'emergency',
    }
    
    # Symptom-based specialist suggestions
    SYMPTOM_SPECIALIST_MAP = {
        'chest_pain': 'cardiologist',
        'breathlessness': 'pulmonologist',
        'skin_rash': 'dermatologist',
        'itching': 'dermatologist',
        'stomach_pain': 'gastroenterologist',
        'vomiting': 'gastroenterologist',
        'blood_in_stool': 'gastroenterologist',  # Rectal bleeding
        'bloody_stool': 'gastroenterologist',
        'constipation': 'gastroenterologist',
        'diarrhoea': 'gastroenterologist',
        'nausea': 'gastroenterologist',
        'headache': 'neurologist',
        'dizziness': 'neurologist',
        'joint_pain': 'orthopedic',
        'back_pain': 'orthopedic',
        'muscle_pain': 'orthopedic',
        'knee_pain': 'orthopedic',
        'burning_micturition': 'urologist',
        'blood_in_urine': 'urologist',
        'frequent_urination': 'urologist',
        'polyuria': 'urologist',
        'dark_urine': 'urologist',
        'vaginal_discharge': 'gynecologist',
        'vaginal_itching': 'gynecologist',
        'intermenstrual_bleeding': 'gynecologist',
        'painful_menstruation': 'gynecologist',
        'heavy_menstrual_flow': 'gynecologist',
        'abnormal_menstruation': 'gynecologist',
        'yellowish_skin': 'hepatologist',
        'depression': 'psychiatrist',
        'anxiety': 'psychiatrist',
        'blurred_and_distorted_vision': 'ophthalmologist',
        'high_fever': 'infectious_disease',
        'cough': 'pulmonologist',
        'phlegm': 'pulmonologist',
        'blood_in_sputum': 'pulmonologist',
        'cramps': 'gynecologist',
    }
    
    def get_specialist_for_disease(self, disease: str) -> Dict:
        """Get specialist recommendation for a disease"""
        disease_lower = disease.lower().strip()
        
        # Direct match
        for disease_key, specialist_key in self.DISEASE_SPECIALIST_MAP.items():
            if disease_key in disease_lower or disease_lower in disease_key:
                return self._get_specialist_info(specialist_key)
        
        # Partial keyword match
        keywords_to_specialist = {
            'heart': 'cardiologist',
            'cardio': 'cardiologist',
            'skin': 'dermatologist',
            'derma': 'dermatologist',
            'stomach': 'gastroenterologist',
            'gastro': 'gastroenterologist',
            'liver': 'hepatologist',
            'hepat': 'hepatologist',
            'brain': 'neurologist',
            'neuro': 'neurologist',
            'bone': 'orthopedic',
            'joint': 'orthopedic',
            'lung': 'pulmonologist',
            'pulmon': 'pulmonologist',
            'respir': 'pulmonologist',
            'diabet': 'endocrinologist',
            'thyroid': 'endocrinologist',
            'kidney': 'nephrologist',
            'renal': 'nephrologist',
            'eye': 'ophthalmologist',
            'vision': 'ophthalmologist',
            'ear': 'ent',
            'throat': 'ent',
            'nose': 'ent',
            'vagin': 'gynecologist',
            'menstr': 'gynecologist',
            'urin': 'urologist',
            'bladder': 'urologist',
            'cancer': 'oncologist',
            'tumor': 'oncologist',
            'blood': 'hematologist',
            'anemi': 'hematologist',
            'allerg': 'allergist',
            'infect': 'infectious_disease',
            'fever': 'general_physician',
            'cold': 'general_physician',
            'flu': 'general_physician',
            'poison': 'emergency',
        }
        
        for keyword, specialist_key in keywords_to_specialist.items():
            if keyword in disease_lower:
                return self._get_specialist_info(specialist_key)
        
        # Default to general physician
        return self._get_specialist_info('general_physician')
    
    def get_specialist_for_symptoms(self, symptoms: List[str]) -> Dict:
        """Get specialist based on symptoms"""
        specialist_votes = {}
        
        for symptom in symptoms:
            symptom_lower = symptom.lower().strip()
            if symptom_lower in self.SYMPTOM_SPECIALIST_MAP:
                specialist = self.SYMPTOM_SPECIALIST_MAP[symptom_lower]
                specialist_votes[specialist] = specialist_votes.get(specialist, 0) + 1
        
        if specialist_votes:
            # Return specialist with most votes
            best_specialist = max(specialist_votes, key=specialist_votes.get)
            return self._get_specialist_info(best_specialist)
        
        return self._get_specialist_info('general_physician')
    
    def _get_specialist_info(self, specialist_key: str) -> Dict:
        """Get full specialist information"""
        if specialist_key in self.SPECIALISTS:
            info = self.SPECIALISTS[specialist_key].copy()
            info['key'] = specialist_key
            return info
        return self.SPECIALISTS['general_physician'].copy()
    
    def get_recommendation_message(self, disease: str, probability: float) -> str:
        """Generate specialist recommendation message"""
        specialist = self.get_specialist_for_disease(disease)
        
        message = f"\n\n👨‍⚕️ **Recommended Specialist:** {specialist['icon']} **{specialist['name']}**\n"
        message += f"_{specialist['description']}_\n\n"
        
        if probability >= 0.3:
            message += "Based on your symptoms, we strongly recommend consulting this specialist.\n"
        elif probability >= 0.15:
            message += "Consider scheduling an appointment with this specialist for proper diagnosis.\n"
        else:
            message += "A consultation may help clarify your condition.\n"
        
        message += "\n**Would you like me to help you find a nearby specialist?**"
        
        return message
    
    def get_all_specialists(self) -> List[Dict]:
        """Get list of all specialists"""
        return [
            {**info, 'key': key} 
            for key, info in self.SPECIALISTS.items()
        ]


# Singleton instance
specialist_mapper = SpecialistMapper()

