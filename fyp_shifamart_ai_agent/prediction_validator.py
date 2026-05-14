"""
Prediction Validator for ShifaMart+ AI Agent
Validates predictions before showing to users using a checklist approach
"""
from typing import List, Dict, Tuple
from dataclasses import dataclass


@dataclass
class ValidationResult:
    """Result of prediction validation"""
    is_valid: bool
    confidence: float  # 0-1, how confident we are in this prediction
    warnings: List[str]
    suggestions: List[str]
    should_ask_more: bool
    follow_up_questions: List[str]


class PredictionValidator:
    """
    Validates disease predictions using a checklist approach
    Asks "self-check" questions before finalizing predictions
    """
    
    # Diseases that need specific symptoms to be valid predictions
    DISEASE_REQUIRED_SYMPTOMS = {
        'AIDS': {
            'required_any': ['skin_rash', 'weight_loss', 'night_sweats', 'swollen_lymph_nodes', 
                            'patches_in_throat', 'muscle_wasting'],
            'min_match': 1,
            'warning': 'AIDS requires specific symptoms like weight loss, night sweats, or skin lesions'
        },
        'HIV': {
            'required_any': ['skin_rash', 'weight_loss', 'night_sweats', 'swollen_lymph_nodes'],
            'min_match': 1,
            'warning': 'HIV requires specific symptoms beyond fever/fatigue'
        },
        'Tuberculosis': {
            'required_any': ['blood_in_sputum', 'weight_loss', 'night_sweats', 'chest_pain', 'phlegm'],
            'min_match': 1,
            'warning': 'TB typically presents with persistent cough, blood in sputum, or night sweats'
        },
        'Heart attack': {
            'required_any': ['chest_pain', 'breathlessness', 'sweating', 'pain_in_arm'],
            'min_match': 2,
            'warning': 'Heart attack requires chest pain with other cardiac symptoms'
        },
        'Diabetes': {
            'required_any': ['polyuria', 'excessive_hunger', 'weight_loss', 'blurred_and_distorted_vision', 
                           'irregular_sugar_level', 'obesity'],
            'min_match': 1,
            'warning': 'Diabetes typically presents with frequent urination, excessive thirst/hunger'
        },
        'Malaria': {
            'required_any': ['chills', 'sweating', 'high_fever'],
            'min_match': 2,
            'warning': 'Malaria typically presents with cyclical fever, chills, and sweating'
        },
        'Dengue': {
            'required_any': ['joint_pain', 'muscle_pain', 'skin_rash', 'bleeding'],
            'min_match': 1,
            'warning': 'Dengue typically presents with severe body aches and possibly rash'
        },
        'Pneumonia': {
            'required_any': ['cough', 'breathlessness', 'chest_pain', 'phlegm', 'high_fever'],
            'min_match': 2,
            'warning': 'Pneumonia requires respiratory symptoms like cough with fever'
        },
        'Jaundice': {
            'required_any': ['yellowish_skin', 'dark_urine', 'yellowing_of_eyes', 'itching'],
            'min_match': 1,
            'warning': 'Jaundice requires yellowing of skin/eyes or dark urine'
        },
    }
    
    # Symptom combinations that strongly suggest specific diseases
    STRONG_INDICATORS = {
        frozenset(['chest_pain', 'breathlessness', 'sweating']): 'Heart attack',
        frozenset(['high_fever', 'chills', 'sweating']): 'Malaria',
        frozenset(['yellowish_skin', 'dark_urine']): 'Jaundice',
        frozenset(['stomach_pain', 'vomiting', 'diarrhoea']): 'Gastroenteritis',
        frozenset(['burning_micturition', 'frequent_urination']): 'Urinary tract infection',
        frozenset(['polyuria', 'excessive_hunger', 'fatigue']): 'Diabetes',
        frozenset(['blood_in_sputum', 'weight_loss', 'cough']): 'Tuberculosis',
    }
    
    # Generic symptoms that alone cannot diagnose serious diseases
    GENERIC_SYMPTOMS = {
        'high_fever', 'fever', 'headache', 'fatigue', 'weakness', 
        'cough', 'nausea', 'vomiting', 'dizziness', 'muscle_pain'
    }
    
    # Common diseases for generic symptoms
    COMMON_DISEASES = {
        'Common Cold', 'Typhoid', 'Viral infection', 'Flu', 
        'Gastroenteritis', 'Migraine', 'Allergy'
    }
    
    def validate_prediction(self, 
                           disease: str, 
                           probability: float, 
                           symptoms: List[str],
                           all_predictions: List[Dict]) -> ValidationResult:
        """
        Validate a single prediction using checklist questions
        
        Checklist:
        1. Does the disease match the symptom pattern?
        2. Are required symptoms present for serious diseases?
        3. Is the confidence level reasonable?
        4. Should we ask follow-up questions?
        5. Are there red flags or warnings?
        """
        warnings = []
        suggestions = []
        follow_up_questions = []
        confidence_modifier = 1.0
        
        symptom_set = set(symptoms)
        
        # ===== CHECK 1: Required Symptoms for Serious Diseases =====
        if disease in self.DISEASE_REQUIRED_SYMPTOMS:
            req_info = self.DISEASE_REQUIRED_SYMPTOMS[disease]
            required_any = set(req_info['required_any'])
            min_match = req_info['min_match']
            
            matched = symptom_set.intersection(required_any)
            
            if len(matched) < min_match:
                warnings.append(req_info['warning'])
                confidence_modifier *= 0.3  # Significant reduction
                follow_up_questions.append(
                    f"Do you have any of these symptoms: {', '.join(list(required_any)[:3])}?"
                )
        
        # ===== CHECK 2: Generic Symptoms Only =====
        non_generic = symptom_set - self.GENERIC_SYMPTOMS
        if len(non_generic) == 0 and disease not in self.COMMON_DISEASES:
            warnings.append(f"Only generic symptoms present - {disease} may not be accurate")
            confidence_modifier *= 0.5
            suggestions.append("Consider adding more specific symptoms for better accuracy")
        
        # ===== CHECK 3: Strong Indicator Match =====
        for indicator_symptoms, indicated_disease in self.STRONG_INDICATORS.items():
            if indicator_symptoms.issubset(symptom_set):
                if disease == indicated_disease:
                    confidence_modifier *= 1.3  # Boost confidence
                elif disease not in self.COMMON_DISEASES:
                    # Different serious disease predicted despite strong indicators
                    suggestions.append(f"Symptoms strongly suggest {indicated_disease}")
        
        # ===== CHECK 4: Low Probability Check =====
        if probability < 0.05:
            warnings.append("Low confidence prediction - consider providing more symptoms")
            follow_up_questions.append("Can you describe any other symptoms you're experiencing?")
        
        # ===== CHECK 5: Duration-based checks (if available) =====
        # This would be enhanced if duration is passed
        
        # ===== CHECK 6: Consistency Check =====
        # Check if top 3 predictions are from same disease category
        if len(all_predictions) >= 3:
            top3_diseases = [p['disease'] for p in all_predictions[:3]]
            # If predictions are very diverse, suggest more symptoms
            
        # Calculate final confidence
        final_confidence = min(1.0, probability * confidence_modifier)
        
        # Determine if we should ask more questions
        should_ask_more = (
            len(follow_up_questions) > 0 or 
            final_confidence < 0.15 or
            len(non_generic) == 0
        )
        
        # Is prediction valid enough to show?
        is_valid = final_confidence >= 0.01 and len(warnings) < 3
        
        return ValidationResult(
            is_valid=is_valid,
            confidence=final_confidence,
            warnings=warnings,
            suggestions=suggestions,
            should_ask_more=should_ask_more,
            follow_up_questions=follow_up_questions
        )
    
    def validate_all_predictions(self, 
                                predictions: List[Dict], 
                                symptoms: List[str]) -> Dict:
        """
        Validate all predictions and return validation summary
        """
        validated_predictions = []
        all_warnings = []
        all_suggestions = []
        should_ask_followup = False
        followup_questions = []
        
        for pred in predictions:
            validation = self.validate_prediction(
                disease=pred['disease'],
                probability=pred['probability'],
                symptoms=symptoms,
                all_predictions=predictions
            )
            
            # Add validation info to prediction
            validated_pred = pred.copy()
            validated_pred['validation'] = {
                'confidence': validation.confidence,
                'warnings': validation.warnings,
                'is_valid': validation.is_valid
            }
            validated_predictions.append(validated_pred)
            
            all_warnings.extend(validation.warnings)
            all_suggestions.extend(validation.suggestions)
            
            if validation.should_ask_more:
                should_ask_followup = True
                followup_questions.extend(validation.follow_up_questions)
        
        # Remove duplicates
        all_warnings = list(set(all_warnings))
        all_suggestions = list(set(all_suggestions))
        followup_questions = list(set(followup_questions))
        
        return {
            'predictions': validated_predictions,
            'warnings': all_warnings[:3],  # Limit to top 3
            'suggestions': all_suggestions[:2],
            'should_ask_followup': should_ask_followup,
            'followup_questions': followup_questions[:2],
            'overall_confidence': self._calculate_overall_confidence(validated_predictions)
        }
    
    def _calculate_overall_confidence(self, predictions: List[Dict]) -> str:
        """Calculate overall confidence level"""
        if not predictions:
            return "LOW"
        
        top_prob = predictions[0].get('probability', 0)
        
        if top_prob >= 0.4:
            return "HIGH"
        elif top_prob >= 0.2:
            return "MODERATE"
        elif top_prob >= 0.1:
            return "LOW"
        else:
            return "VERY LOW"
    
    def get_validation_message(self, validation_result: Dict) -> str:
        """Generate a user-friendly validation message"""
        messages = []
        
        confidence = validation_result.get('overall_confidence', 'LOW')
        
        if confidence == "VERY LOW":
            messages.append("⚠️ **Low confidence predictions** - Please provide more specific symptoms for better accuracy.")
        elif confidence == "LOW":
            messages.append("💡 These predictions have moderate confidence. Consider adding more symptoms if available.")
        
        if validation_result.get('warnings'):
            messages.append("\n**Notes:**")
            for warning in validation_result['warnings'][:2]:
                messages.append(f"• {warning}")
        
        if validation_result.get('followup_questions') and validation_result.get('should_ask_followup'):
            messages.append("\n**To improve accuracy, please answer:**")
            for q in validation_result['followup_questions'][:2]:
                messages.append(f"• {q}")
        
        return '\n'.join(messages) if messages else ''


# Singleton instance
prediction_validator = PredictionValidator()

