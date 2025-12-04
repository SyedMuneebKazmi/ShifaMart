"""
Duration Analyzer for ShifaMart+ AI Agent
Adjusts disease predictions based on symptom duration
"""
from typing import List, Dict, Tuple
import re


class DurationAnalyzer:
    """
    Analyzes symptom duration and adjusts disease predictions accordingly.
    Short duration symptoms often indicate acute conditions,
    while long duration symptoms suggest chronic conditions.
    """
    
    # Duration categories in days
    DURATION_CATEGORIES = {
        'acute': (0, 3),      # 0-3 days
        'subacute': (4, 14),  # 4-14 days (1-2 weeks)
        'chronic': (15, 90),  # 15-90 days (2 weeks - 3 months)
        'very_chronic': (91, float('inf'))  # > 3 months
    }
    
    # Symptom + Duration -> Disease adjustments
    # Format: (symptom, duration_category): [(disease, boost), ...]
    DURATION_DISEASE_RULES = {
        # Fever duration rules
        ('high_fever', 'acute'): [
            ('Common Cold', 0.3), ('Viral infection', 0.25), ('Flu', 0.2)
        ],
        ('high_fever', 'subacute'): [
            ('Typhoid', 0.35), ('Malaria', 0.3), ('Dengue', 0.25)
        ],
        ('high_fever', 'chronic'): [
            ('Tuberculosis', 0.3), ('HIV', 0.2)
        ],
        
        # Joint pain duration rules
        ('joint_pain', 'acute'): [
            ('Muscle strain', 0.3), ('Injury', 0.25)
        ],
        ('joint_pain', 'subacute'): [
            ('Arthritis', 0.25), ('Viral arthritis', 0.2)
        ],
        ('joint_pain', 'chronic'): [
            ('Osteoarthritis', 0.35), ('Rheumatoid arthritis', 0.3), ('Arthritis', 0.25)
        ],
        
        # Headache duration rules
        ('headache', 'acute'): [
            ('Tension headache', 0.3), ('Dehydration', 0.2)
        ],
        ('headache', 'subacute'): [
            ('Migraine', 0.35), ('Sinusitis', 0.25)
        ],
        ('headache', 'chronic'): [
            ('Migraine', 0.4), ('Chronic tension headache', 0.25), ('Hypertension', 0.2)
        ],
        
        # Cough duration rules
        ('cough', 'acute'): [
            ('Common Cold', 0.35), ('Viral infection', 0.25)
        ],
        ('cough', 'subacute'): [
            ('Bronchitis', 0.3), ('Pneumonia', 0.25)
        ],
        ('cough', 'chronic'): [
            ('Tuberculosis', 0.35), ('Bronchial Asthma', 0.3), ('COPD', 0.2)
        ],
        
        # Stomach pain duration rules
        ('stomach_pain', 'acute'): [
            ('Gastroenteritis', 0.3), ('Food poisoning', 0.25)
        ],
        ('stomach_pain', 'subacute'): [
            ('Gastritis', 0.3), ('Peptic ulcer diseae', 0.25)
        ],
        ('stomach_pain', 'chronic'): [
            ('GERD', 0.35), ('Peptic ulcer diseae', 0.3), ('Chronic gastritis', 0.2)
        ],
        
        # Fatigue duration rules
        ('fatigue', 'acute'): [
            ('Viral infection', 0.25), ('Common Cold', 0.2)
        ],
        ('fatigue', 'subacute'): [
            ('Anemia', 0.25), ('Thyroid disorder', 0.2)
        ],
        ('fatigue', 'chronic'): [
            ('Diabetes', 0.3), ('Hypothyroidism', 0.25), ('Chronic fatigue syndrome', 0.2), ('Anemia', 0.2)
        ],
        
        # Skin rash duration rules
        ('skin_rash', 'acute'): [
            ('Allergy', 0.35), ('Contact dermatitis', 0.25)
        ],
        ('skin_rash', 'subacute'): [
            ('Fungal infection', 0.3), ('Eczema', 0.25)
        ],
        ('skin_rash', 'chronic'): [
            ('Psoriasis', 0.35), ('Eczema', 0.3), ('Chronic skin condition', 0.2)
        ],
        
        # Back pain duration rules
        ('back_pain', 'acute'): [
            ('Muscle strain', 0.35), ('Injury', 0.25)
        ],
        ('back_pain', 'chronic'): [
            ('Cervical spondylosis', 0.35), ('Disc herniation', 0.25), ('Arthritis', 0.2)
        ],
        
        # Breathing issues duration rules
        ('breathlessness', 'acute'): [
            ('Anxiety', 0.2), ('Asthma attack', 0.3)
        ],
        ('breathlessness', 'chronic'): [
            ('Bronchial Asthma', 0.35), ('COPD', 0.25), ('Heart disease', 0.2)
        ],
    }
    
    def parse_duration(self, duration_text: str) -> int:
        """
        Parse duration text to number of days.
        Examples: "2 days", "a week", "3 months", "just started"
        """
        if not duration_text:
            return 1
        
        duration_text = duration_text.lower().strip()
        
        # Pattern matching
        patterns = [
            (r'just\s*started|today|just\s*now|few\s*hours?', 1),
            (r'yesterday|1\s*day|one\s*day', 1),
            (r'(\d+)\s*days?', lambda m: int(m.group(1))),
            (r'(\d+)\s*weeks?', lambda m: int(m.group(1)) * 7),
            (r'(\d+)\s*months?', lambda m: int(m.group(1)) * 30),
            (r'(\d+)\s*years?', lambda m: int(m.group(1)) * 365),
            (r'a\s*week|one\s*week', 7),
            (r'a\s*month|one\s*month', 30),
            (r'couple\s*of\s*days|few\s*days', 3),
            (r'couple\s*of\s*weeks|few\s*weeks', 14),
            (r'long\s*time|very\s*long|months|several\s*months', 90),
        ]
        
        for pattern, value in patterns:
            match = re.search(pattern, duration_text)
            if match:
                if callable(value):
                    return value(match)
                return value
        
        # Default to 3 days if unparseable
        return 3
    
    def get_duration_category(self, days: int) -> str:
        """Get duration category from number of days"""
        for category, (min_days, max_days) in self.DURATION_CATEGORIES.items():
            if min_days <= days <= max_days:
                return category
        return 'acute'
    
    def get_duration_adjustments(self, symptoms: List[str], duration_text: str) -> Dict[str, float]:
        """
        Get disease probability adjustments based on symptoms and duration.
        Returns dict of {disease: boost_amount}
        """
        days = self.parse_duration(duration_text)
        category = self.get_duration_category(days)
        
        adjustments = {}
        
        for symptom in symptoms:
            key = (symptom, category)
            if key in self.DURATION_DISEASE_RULES:
                for disease, boost in self.DURATION_DISEASE_RULES[key]:
                    if disease in adjustments:
                        adjustments[disease] = max(adjustments[disease], boost)
                    else:
                        adjustments[disease] = boost
        
        return adjustments
    
    def get_duration_insight(self, symptoms: List[str], duration_text: str) -> str:
        """
        Generate a human-readable insight about the duration.
        """
        days = self.parse_duration(duration_text)
        category = self.get_duration_category(days)
        
        if category == 'acute':
            return "Since symptoms are recent, this is likely an acute condition."
        elif category == 'subacute':
            return "Symptoms lasting 1-2 weeks may need medical attention if not improving."
        elif category == 'chronic':
            return "Symptoms persisting for weeks suggest a condition requiring proper diagnosis."
        else:
            return "Long-standing symptoms should be evaluated by a specialist."


# Singleton instance
duration_analyzer = DurationAnalyzer()

