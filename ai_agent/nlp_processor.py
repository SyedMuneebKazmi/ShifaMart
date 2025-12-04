"""
Advanced NLP Processor for ShifaMart+ AI Agent
Handles natural language understanding for symptom extraction
"""
import re
from typing import List, Dict, Tuple, Set
from dataclasses import dataclass
from collections import defaultdict


@dataclass
class ExtractedSymptom:
    """Represents an extracted symptom with metadata"""
    symptom: str
    original_text: str
    confidence: float
    duration: str = None
    severity_modifier: str = None


class SymptomNLPProcessor:
    """
    Advanced NLP processor for extracting symptoms from natural language
    Uses pattern matching, synonym mapping, and fuzzy matching
    """
    
    # Comprehensive symptom synonyms and variations
    SYMPTOM_SYNONYMS = {
        # Fever related - map generic "fever" to high_fever (more common in dataset)
        'high_fever': ['fever', 'high fever', 'temperature', 'pyrexia', 'feverish', 'burning up', 
                       'high temp', 'hot', 'very high temperature', 'burning fever', 'severe fever', 
                       '103', '104', '105', 'have fever', 'got fever', 'having fever'],
        'mild_fever': ['mild fever', 'low grade fever', 'slight fever', 'low fever', 'slight temperature',
                       'little fever', 'small fever'],
        
        # Pain related - use specific phrases to avoid over-matching
        'headache': ['headache', 'head pain', 'head ache', 'migraine', 'head hurts', 'head is paining', 
                     'pain in head', 'head throbbing', 'pounding head', 'splitting headache'],
        'stomach_pain': ['stomach pain', 'stomach ache', 'tummy pain', 'abdominal pain', 'belly pain',
                        'stomach hurts', 'pain in stomach', 'abdomen pain', 'stomach cramps', 'gut pain',
                        'stomach is paining', 'pain in belly', 'pain in tummy', 'my belly hurts',
                        'belly ache', 'tummy ache', 'stomach is hurting', 'belly is hurting'],
        'chest_pain': ['chest pain', 'chest hurts', 'pain in chest', 'chest discomfort', 'chest tightness',
                      'heart pain', 'angina', 'chest pressure', 'heavy chest'],
        'back_pain': ['back pain', 'backache', 'back ache', 'lower back pain', 'upper back pain', 
                     'spine pain', 'back hurts'],
        'joint_pain': ['joint pain', 'joints hurt', 'painful joints', 'arthritis pain', 'joints aching'],
        'muscle_pain': ['muscle pain', 'body pain', 'body ache', 'muscles hurt', 'muscle ache', 
                       'myalgia', 'sore muscles', 'muscle soreness', 'aching body'],
        'neck_pain': ['neck pain', 'stiff neck', 'neck hurts', 'neck ache', 'sore neck'],
        'knee_pain': ['knee pain', 'knee hurts', 'painful knee'],
        
        # Respiratory
        'cough': ['cough', 'coughing', 'dry cough', 'wet cough', 'persistent cough', 'hacking cough'],
        'breathlessness': ['breathlessness', 'shortness of breath', 'difficulty breathing', 'cant breathe',
                          'hard to breathe', 'breathing difficulty', 'gasping', 'dyspnea', 'out of breath',
                          'breathing problem', 'suffocating', 'choking'],
        'phlegm': ['phlegm', 'mucus', 'sputum', 'chest congestion', 'coughing up mucus', 'productive cough'],
        'runny_nose': ['runny nose', 'running nose', 'nasal discharge', 'nose running', 'stuffy nose'],
        'congestion': ['congestion', 'blocked nose', 'nasal congestion', 'stuffed up', 'sinus congestion'],
        'sore_throat': ['sore throat', 'throat pain', 'throat hurts', 'painful throat', 'scratchy throat'],
        
        # Digestive
        'nausea': ['nausea', 'feeling sick', 'queasy', 'want to vomit', 'feel like vomiting', 'sick feeling'],
        'vomiting': ['vomiting', 'throwing up', 'puking', 'vomit', 'emesis', 'being sick', 'throwing out'],
        'diarrhoea': ['diarrhea', 'diarrhoea', 'loose motion', 'loose stool', 'watery stool', 'runny stomach',
                     'frequent stools', 'upset stomach', 'loose bowel'],
        'constipation': ['constipation', 'constipated', 'hard stool', 'difficulty passing stool', 'blocked'],
        'acidity': ['acidity', 'acid reflux', 'heartburn', 'burning sensation', 'gastric', 'indigestion'],
        'loss_of_appetite': ['loss of appetite', 'no appetite', 'not hungry', 'dont want to eat', 
                            'eating less', 'no hunger'],
        
        # Skin
        'itching': ['itching', 'itchy', 'scratching', 'itch', 'pruritus', 'skin itching'],
        'skin_rash': ['rash', 'skin rash', 'rashes', 'skin eruption', 'red spots', 'skin breakout',
                     'hives', 'urticaria', 'skin bumps'],
        'yellowish_skin': ['yellow skin', 'yellowish skin', 'jaundice', 'yellowing', 'yellow eyes',
                          'skin turning yellow'],
        
        # General
        'fatigue': ['fatigue', 'tired', 'tiredness', 'exhausted', 'no energy', 'weakness', 'lethargy',
                   'feeling weak', 'low energy', 'drained', 'worn out', 'sleepy'],
        'weakness': ['weakness', 'weak', 'feeling weak', 'no strength', 'feeble', 'powerless'],
        'chills': ['chills', 'shivering', 'feeling cold', 'cold sweats', 'rigors', 'trembling'],
        'sweating': ['sweating', 'sweats', 'excessive sweating', 'perspiration', 'night sweats'],
        'weight_loss': ['weight loss', 'losing weight', 'lost weight', 'getting thin', 'unintentional weight loss'],
        'weight_gain': ['weight gain', 'gaining weight', 'putting on weight', 'getting fat'],
        
        # Neurological
        'dizziness': ['dizziness', 'dizzy', 'lightheaded', 'vertigo', 'spinning', 'unsteady', 'wobbly'],
        'blurred_and_distorted_vision': ['blurred vision', 'blurry vision', 'cant see clearly', 
                                         'vision problems', 'fuzzy vision', 'distorted vision'],
        'anxiety': ['anxiety', 'anxious', 'worried', 'nervous', 'panic', 'restless', 'uneasy'],
        'depression': ['depression', 'depressed', 'sad', 'low mood', 'feeling down', 'hopeless'],
        
        # Urinary
        'burning_micturition': ['burning urination', 'painful urination', 'burning when peeing',
                               'pain while urinating', 'dysuria', 'burning pee'],
        'dark_urine': ['dark urine', 'dark colored urine', 'brown urine', 'tea colored urine'],
        'frequent_urination': ['frequent urination', 'peeing a lot', 'urinating often', 'polyuria'],
        
        # Eyes
        'redness_of_eyes': ['red eyes', 'eye redness', 'bloodshot eyes', 'pink eye', 'eye inflammation'],
        'watering_from_eyes': ['watery eyes', 'teary eyes', 'eyes watering', 'lacrimation'],
        'sunken_eyes': ['sunken eyes', 'hollow eyes', 'dark circles', 'eyes look tired'],
        
        # Diabetes-related symptoms
        'polyuria': ['polyuria', 'frequent urination', 'urinate frequently', 'urinating a lot',
                     'pee a lot', 'peeing frequently', 'going to bathroom often', 'urinate often',
                     'passing urine frequently', 'excessive urination'],
        'excessive_hunger': ['excessive hunger', 'always hungry', 'very hungry', 'hungry all the time',
                            'constant hunger', 'extreme hunger', 'starving', 'never full'],
        'increased_appetite': ['increased appetite', 'eating more', 'eat a lot', 'eating a lot',
                              'appetite increased', 'more appetite', 'always eating'],
        'irregular_sugar_level': ['irregular sugar', 'sugar level', 'high sugar', 'blood sugar',
                                  'sugar fluctuations', 'sugar problem', 'glucose level', 
                                  'diabetic symptoms', 'sugar high', 'sugar low'],
        'lethargy': ['lethargy', 'lethargic', 'sluggish', 'no energy', 'very low energy', 'slow'],
        'restlessness': ['restless', 'restlessness', 'cannot sit still', 'agitated', 'uneasy', 
                        'cant relax', 'fidgety'],
        'obesity': ['obesity', 'obese', 'overweight', 'very fat', 'heavy weight', 'high bmi'],
        
        # Other specific symptoms
        'continuous_sneezing': ['sneezing', 'continuous sneezing', 'cant stop sneezing', 'sneeze attacks'],
        'dehydration': ['dehydration', 'dehydrated', 'very thirsty', 'dry mouth', 'no water', 'thirsty all the time'],
        'swelling': ['swelling', 'swollen', 'puffiness', 'edema', 'bloating'],
        'palpitations': ['palpitations', 'heart racing', 'heart pounding', 'fast heartbeat', 
                        'irregular heartbeat', 'heart fluttering'],
        
        # Vaginal/Menstrual symptoms
        'vaginal_discharge': ['vaginal discharge', 'discharge', 'white discharge', 'yellow discharge',
                             'abnormal discharge', 'discharge from vagina', 'i have discharge',
                             'vaginal fluid', 'leaking', 'discharge problem'],
        'abnormal_menstruation': ['abnormal menstruation', 'irregular periods', 'period problems',
                                  'menstrual problems', 'abnormal period', 'period issues'],
        'intermenstrual_bleeding': ['bleeding between periods', 'spotting', 'blood from vagina',
                                    'vaginal bleeding', 'bleeding from vagina', 'abnormal bleeding',
                                    'unexpected bleeding', 'bleeding not period'],
        'heavy_menstrual_flow': ['heavy period', 'heavy bleeding', 'heavy menstrual flow',
                                 'excessive bleeding', 'heavy periods', 'menorrhagia'],
        'painful_menstruation': ['painful periods', 'period pain', 'menstrual cramps', 'cramps',
                                 'dysmenorrhea', 'pain during period', 'period cramps'],
        'vaginal_itching': ['vaginal itching', 'itching down there', 'itchy vagina', 'genital itch'],
        'vaginal_pain': ['vaginal pain', 'pain in vagina', 'pain down there', 'genital pain'],
        
        # Blood-related symptoms
        'blood_in_stool': ['blood in stool', 'bloody stool', 'blood in poop', 'rectal bleeding',
                          'bleeding from anus', 'blood when passing stool', 'blood in motion'],
        'blood_in_urine': ['blood in urine', 'bloody urine', 'blood when urinating', 'hematuria',
                          'red urine', 'blood in pee', 'passing blood in urine'],
        'vomiting_blood': ['vomiting blood', 'blood in vomit', 'throwing up blood', 'hematemesis',
                          'coughing blood', 'blood when vomiting'],
        'blood_in_sputum': ['blood in sputum', 'coughing up blood', 'bloody mucus', 'blood when coughing',
                           'hemoptysis', 'blood in phlegm'],
    }
    
    # Duration patterns
    DURATION_PATTERNS = [
        (r'(\d+)\s*days?', 'days'),
        (r'(\d+)\s*weeks?', 'weeks'),
        (r'(\d+)\s*hours?', 'hours'),
        (r'(\d+)\s*months?', 'months'),
        (r'since\s+(yesterday|today|morning|evening|last\s+night)', 'relative'),
        (r'for\s+a\s+(few|couple)\s+(days?|weeks?|hours?)', 'relative'),
        (r'from\s+a\s+(week|day|month|few\s+days)', 'relative'),  # "from a week"
        (r'(just\s+started|recently|suddenly|all\s+of\s+a\s+sudden)', 'recent'),
        (r'(a\s+week|one\s+week|1\s+week)', 'weeks'),  # "a week"
        (r'(past\s+\d+\s+days?|last\s+\d+\s+days?)', 'days'),
    ]
    
    # Severity modifiers
    SEVERITY_MODIFIERS = {
        'mild': ['mild', 'slight', 'little', 'minor', 'a bit', 'somewhat', 'light'],
        'moderate': ['moderate', 'medium', 'average', 'normal'],
        'severe': ['severe', 'very', 'extreme', 'intense', 'terrible', 'awful', 'horrible',
                  'excruciating', 'unbearable', 'really bad', 'worst', 'acute', 'serious'],
        'chronic': ['chronic', 'persistent', 'constant', 'continuous', 'ongoing', 'long-term'],
    }
    
    # Negation patterns
    NEGATION_WORDS = ['no', 'not', 'dont', "don't", 'doesnt', "doesn't", 'without', 
                      'never', 'none', 'havent', "haven't", 'hadnt', "hadn't"]
    
    def __init__(self, known_symptoms: List[str] = None):
        """Initialize with list of known symptoms from the model"""
        self.known_symptoms = set(known_symptoms) if known_symptoms else set()
        self._build_reverse_mapping()
    
    def _build_reverse_mapping(self):
        """Build reverse mapping from synonyms to canonical symptoms"""
        self.synonym_to_symptom = {}
        for symptom, synonyms in self.SYMPTOM_SYNONYMS.items():
            for syn in synonyms:
                self.synonym_to_symptom[syn.lower()] = symptom
    
    def set_known_symptoms(self, symptoms: List[str]):
        """Set the list of known symptoms from the trained model"""
        self.known_symptoms = set(symptoms)
    
    def preprocess_text(self, text: str) -> str:
        """Clean and normalize input text"""
        # Convert to lowercase
        text = text.lower()
        
        # Replace common contractions
        contractions = {
            "i'm": "i am", "i've": "i have", "i'll": "i will",
            "can't": "cannot", "won't": "will not", "don't": "do not",
            "doesn't": "does not", "didn't": "did not", "haven't": "have not",
            "hasn't": "has not", "hadn't": "had not", "isn't": "is not",
            "aren't": "are not", "wasn't": "was not", "weren't": "were not",
            "it's": "it is", "that's": "that is", "there's": "there is",
        }
        for contraction, expansion in contractions.items():
            text = text.replace(contraction, expansion)
        
        # Remove extra punctuation but keep periods for sentence boundaries
        text = re.sub(r'[^\w\s.,]', ' ', text)
        
        # Normalize whitespace
        text = ' '.join(text.split())
        
        return text
    
    def extract_duration(self, text: str) -> Tuple[str, str]:
        """Extract duration information from text"""
        for pattern, duration_type in self.DURATION_PATTERNS:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                return match.group(0), duration_type
        return None, None
    
    def extract_severity_modifier(self, text: str, symptom_position: int) -> str:
        """Extract severity modifier near a symptom mention"""
        # Look for severity words within 3 words before the symptom
        words_before = text[:symptom_position].split()[-5:]
        
        for modifier_level, modifiers in self.SEVERITY_MODIFIERS.items():
            for modifier in modifiers:
                if any(modifier in word for word in words_before):
                    return modifier_level
        
        return 'moderate'  # Default severity
    
    def is_negated(self, text: str, symptom_position: int) -> bool:
        """Check if symptom mention is negated"""
        # Look for negation words within 3 words before the symptom
        words_before = text[:symptom_position].lower().split()[-4:]
        return any(neg in words_before for neg in self.NEGATION_WORDS)
    
    def extract_symptoms(self, text: str) -> List[ExtractedSymptom]:
        """
        Extract symptoms from natural language text
        
        Returns list of ExtractedSymptom objects with confidence scores
        """
        processed_text = self.preprocess_text(text)
        extracted = []
        found_symptoms = set()
        
        # Extract duration
        duration, _ = self.extract_duration(processed_text)
        
        # Method 1: Match against synonym dictionary (prioritize longer matches)
        # Sort synonyms by length (longest first) to match more specific phrases
        sorted_synonyms = sorted(self.synonym_to_symptom.items(), key=lambda x: len(x[0]), reverse=True)
        
        for synonym, symptom in sorted_synonyms:
            if len(synonym) < 4:  # Skip very short synonyms
                continue
            
            if symptom in found_symptoms:
                continue
                
            # Use word boundary matching
            pattern = r'\b' + re.escape(synonym) + r'\b'
            match = re.search(pattern, processed_text)
            
            if match:
                position = match.start()
                
                # Check if negated
                if self.is_negated(processed_text, position):
                    continue
                
                # Get severity modifier
                severity = self.extract_severity_modifier(processed_text, position)
                
                # Check if this symptom exists in our known symptoms
                if symptom in self.known_symptoms or not self.known_symptoms:
                    extracted.append(ExtractedSymptom(
                        symptom=symptom,
                        original_text=match.group(0),
                        confidence=0.9,
                        duration=duration,
                        severity_modifier=severity
                    ))
                    found_symptoms.add(symptom)
        
        # Method 2: Direct matching against known symptoms
        for symptom in self.known_symptoms:
            if symptom in found_symptoms:
                continue
            
            # Try matching symptom directly
            symptom_readable = symptom.replace('_', ' ')
            pattern = r'\b' + re.escape(symptom_readable) + r'\b'
            match = re.search(pattern, processed_text)
            
            if match:
                position = match.start()
                if not self.is_negated(processed_text, position):
                    extracted.append(ExtractedSymptom(
                        symptom=symptom,
                        original_text=match.group(0),
                        confidence=0.85,
                        duration=duration,
                        severity_modifier=self.extract_severity_modifier(processed_text, position)
                    ))
                    found_symptoms.add(symptom)
        
        # Method 3: Careful fuzzy matching for specific symptom words only
        # Only match complete symptom words, not partial matches
        words = set(processed_text.split())
        
        # Specific symptom keywords that should trigger exact matches
        # Map common words to actual symptoms in the dataset
        exact_match_symptoms = {
            'fever': 'high_fever',  # Dataset has high_fever, not fever
            'temperature': 'high_fever',
            'headache': 'headache',
            'cough': 'cough',
            'coughing': 'cough',
            'cold': 'chills',  # Map to chills which exists in dataset
            'tired': 'fatigue',
            'tiredness': 'fatigue',
            'exhausted': 'fatigue',
            'weak': 'weakness',
            'weakness': 'weakness',
            'dizzy': 'dizziness',
            'dizziness': 'dizziness',
            'nausea': 'nausea',
            'nauseous': 'nausea',
            'vomit': 'vomiting',
            'vomiting': 'vomiting',
            'rash': 'skin_rash',
            'rashes': 'skin_rash',
            'itch': 'itching',
            'itchy': 'itching',
            'itching': 'itching',
            # Don't map generic 'pain' - let specific pains like 'stomach pain' match via synonyms
            'bodyache': 'muscle_pain',
            'sweating': 'sweating',
            'sweat': 'sweating',
            'chills': 'chills',
            'shivering': 'shivering',
            # Diabetes-related
            'hungry': 'excessive_hunger',
            'starving': 'excessive_hunger',
            'urinating': 'polyuria',
            'urination': 'polyuria',
            'peeing': 'polyuria',
            'sugar': 'irregular_sugar_level',
            'lethargic': 'lethargy',
            'sluggish': 'lethargy',
            'restless': 'restlessness',
            'obese': 'obesity',
            'overweight': 'obesity',
        }
        
        for word in words:
            if word in exact_match_symptoms:
                symptom = exact_match_symptoms[word]
                if symptom not in found_symptoms and symptom in self.known_symptoms:
                    word_pos = processed_text.find(word)
                    if not self.is_negated(processed_text, word_pos):
                        extracted.append(ExtractedSymptom(
                            symptom=symptom,
                            original_text=word,
                            confidence=0.7,
                            duration=duration,
                            severity_modifier='moderate'
                        ))
                        found_symptoms.add(symptom)
        
        # Sort by confidence
        extracted.sort(key=lambda x: x.confidence, reverse=True)
        
        return extracted
    
    def get_symptom_list(self, text: str) -> List[str]:
        """
        Simple method to get just the symptom names from text
        """
        extracted = self.extract_symptoms(text)
        return [e.symptom for e in extracted]
    
    def analyze_text(self, text: str) -> Dict:
        """
        Comprehensive analysis of symptom text
        Returns structured information about symptoms, duration, and severity
        """
        extracted = self.extract_symptoms(text)
        duration, duration_type = self.extract_duration(text)
        
        # Determine overall severity
        severities = [e.severity_modifier for e in extracted if e.severity_modifier]
        if 'severe' in severities:
            overall_severity = 'severe'
        elif 'chronic' in severities:
            overall_severity = 'chronic'
        elif severities:
            overall_severity = max(set(severities), key=severities.count)
        else:
            overall_severity = 'moderate'
        
        return {
            'symptoms': [e.symptom for e in extracted],
            'extracted_details': [
                {
                    'symptom': e.symptom,
                    'original_text': e.original_text,
                    'confidence': e.confidence,
                    'severity': e.severity_modifier
                }
                for e in extracted
            ],
            'duration': duration,
            'duration_type': duration_type,
            'overall_severity': overall_severity,
            'symptom_count': len(extracted)
        }


def test_nlp_processor():
    """Test the NLP processor with sample inputs"""
    # Sample known symptoms (from your dataset)
    known_symptoms = [
        'fever', 'high_fever', 'mild_fever', 'headache', 'stomach_pain', 
        'chest_pain', 'back_pain', 'joint_pain', 'muscle_pain', 'neck_pain',
        'cough', 'breathlessness', 'phlegm', 'runny_nose', 'congestion',
        'nausea', 'vomiting', 'diarrhoea', 'constipation', 'acidity',
        'loss_of_appetite', 'itching', 'skin_rash', 'yellowish_skin',
        'fatigue', 'weakness', 'chills', 'sweating', 'weight_loss',
        'dizziness', 'anxiety', 'depression', 'burning_micturition',
        'dark_urine', 'redness_of_eyes', 'continuous_sneezing', 'dehydration',
        'palpitations', 'blurred_and_distorted_vision'
    ]
    
    processor = SymptomNLPProcessor(known_symptoms)
    
    test_cases = [
        "I have been having severe headache and high fever for 3 days",
        "My stomach is paining a lot and I've been vomiting since morning",
        "I can't breathe properly and have chest pain",
        "I'm feeling very tired and weak, no appetite at all",
        "I have itching all over body with red rashes",
        "I don't have fever but I have continuous sneezing and runny nose",
        "Terrible body pain with chills and sweating at night",
        "My eyes are red and watery, vision is blurry",
        "I'm feeling dizzy and anxious, heart is racing",
        "Been having loose motions and acidity for a week",
    ]
    
    print("="*60)
    print("NLP Symptom Extraction Tests")
    print("="*60)
    
    for text in test_cases:
        print(f"\nInput: \"{text}\"")
        result = processor.analyze_text(text)
        print(f"Symptoms: {result['symptoms']}")
        print(f"Duration: {result['duration']}")
        print(f"Overall Severity: {result['overall_severity']}")
        print("-"*40)


if __name__ == "__main__":
    test_nlp_processor()

