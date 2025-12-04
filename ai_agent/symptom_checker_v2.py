"""
Enhanced Symptom Checker AI Agent for ShifaMart+ (Version 2)
Integrates NLP, Severity Detection, and First Aid features
"""
import json
from typing import List, Dict, Optional, Tuple
from enum import Enum
from dataclasses import dataclass, field

from disease_predictor import DiseasePredictionModel
from nlp_processor import SymptomNLPProcessor
from severity_model import SeverityDetectionModel, SeverityLevel
from first_aid import FirstAidSystem
from specialist_mapper import specialist_mapper
from prediction_validator import prediction_validator
from maps_integration import maps_integration
from duration_analyzer import duration_analyzer


class ConversationState(Enum):
    """States for the conversation flow"""
    GREETING = "greeting"
    COLLECTING_SYMPTOMS = "collecting_symptoms"
    ASKING_DURATION = "asking_duration"
    CONFIRMING_SYMPTOMS = "confirming_symptoms"
    SHOWING_RESULTS = "showing_results"
    SHOWING_FIRST_AID = "showing_first_aid"
    EMERGENCY_DETECTED = "emergency_detected"
    ASKING_CITY = "asking_city"  # For Google Maps integration
    ENDED = "ended"


@dataclass
class PatientSession:
    """Stores patient session data"""
    session_id: str
    collected_symptoms: List[str] = field(default_factory=list)
    symptom_duration: Optional[str] = None
    symptom_severity: Optional[str] = None
    state: ConversationState = ConversationState.GREETING
    predictions: List[Dict] = field(default_factory=list)
    severity_result: Optional[Dict] = None
    validation_result: Optional[Dict] = None  # Prediction validation result
    questions_asked: int = 0
    max_questions: int = 10
    nlp_analysis: Optional[Dict] = None
    user_city: Optional[str] = None  # For finding nearby doctors
    recommended_specialist: Optional[Dict] = None  # Store recommended specialist


class EnhancedSymptomChecker:
    """
    Enhanced AI Agent for symptom checking with:
    - Advanced NLP for natural language understanding
    - Dedicated severity detection model
    - Comprehensive first-aid guidance
    """
    
    # Critical emergency symptoms (only trigger for MULTIPLE of these or very severe ones)
    CRITICAL_EMERGENCY_SYMPTOMS = [
        'coma', 'paralysis', 'weakness_of_one_body_side',
        'altered_sensorium', 'stomach_bleeding', 'seizures'
    ]
    
    # Severe symptoms (warn but don't auto-trigger emergency)
    SEVERE_SYMPTOMS = [
        'chest_pain', 'breathlessness', 'severe_bleeding'
    ]
    
    # Dangerous combinations that trigger emergency
    DANGEROUS_COMBINATIONS = [
        {'chest_pain', 'breathlessness'},  # Heart attack signs
        {'chest_pain', 'sweating', 'nausea'},  # Heart attack
        {'weakness_of_one_body_side', 'slurred_speech'},  # Stroke
    ]
    
    def __init__(self, model: Optional[DiseasePredictionModel] = None):
        """Initialize the enhanced symptom checker"""
        self.model = model or DiseasePredictionModel()
        self.nlp_processor = SymptomNLPProcessor()
        self.severity_model = SeverityDetectionModel()
        self.first_aid_system = FirstAidSystem()
        self.sessions: Dict[str, PatientSession] = {}
        self.is_loaded = False
        
    def load_all_models(self):
        """Load all required models"""
        try:
            # Load disease prediction model
            self.model.load()
            
            # Set known symptoms for NLP processor
            self.nlp_processor.set_known_symptoms(self.model.get_all_symptoms())
            
            # Load severity model
            try:
                self.severity_model.load()
            except:
                print("Severity model not found, training new one...")
                self.severity_model.load_symptom_weights()
                self.severity_model.train(self.model.get_all_symptoms())
                self.severity_model.save()
            
            self.is_loaded = True
            print("All models loaded successfully!")
            
        except Exception as e:
            print(f"Error loading models: {e}")
            raise
    
    def create_session(self, session_id: str) -> PatientSession:
        """Create a new patient session"""
        session = PatientSession(session_id=session_id)
        self.sessions[session_id] = session
        return session
    
    def get_session(self, session_id: str) -> PatientSession:
        """Get existing session or create new one"""
        if session_id not in self.sessions:
            return self.create_session(session_id)
        return self.sessions[session_id]
    
    def process_message(self, session_id: str, user_message: str) -> Dict:
        """Process user message and return appropriate response"""
        session = self.get_session(session_id)
        user_message = user_message.strip()
        
        # Handle different conversation states
        if session.state == ConversationState.GREETING:
            # If user already provides symptoms in first message, process them
            if user_message and len(user_message) > 2:
                session.state = ConversationState.COLLECTING_SYMPTOMS
                return self._handle_symptom_collection(session, user_message)
            return self._handle_greeting(session)
        
        if not user_message:
            return self._handle_greeting(session)
        
        elif session.state == ConversationState.COLLECTING_SYMPTOMS:
            return self._handle_symptom_collection(session, user_message)
        
        elif session.state == ConversationState.ASKING_DURATION:
            # Allow "yes" to skip duration and go to analysis
            if user_message.lower() in ['yes', 'analyze', 'ok']:
                session.state = ConversationState.CONFIRMING_SYMPTOMS
                return self._analyze_and_show_results(session)
            return self._handle_duration(session, user_message)
        
        elif session.state == ConversationState.CONFIRMING_SYMPTOMS:
            return self._handle_confirmation(session, user_message)
        
        elif session.state == ConversationState.SHOWING_RESULTS:
            return self._handle_post_results(session, user_message)
        
        elif session.state == ConversationState.EMERGENCY_DETECTED:
            return self._handle_emergency_followup(session, user_message)
        
        elif session.state == ConversationState.ASKING_CITY:
            return self._handle_city_input(session, user_message)
        
        else:
            return self._handle_greeting(session)
    
    def _handle_city_input(self, session: PatientSession, user_message: str) -> Dict:
        """Handle city input for finding nearby doctors"""
        city_name = user_message.strip()
        
        # Try to get city info
        city_info = maps_integration.get_city_info(city_name)
        
        if city_info:
            session.user_city = city_info['name']
        else:
            # Accept any city name if it's reasonable
            if len(city_name) >= 3:
                session.user_city = city_name.title()
            else:
                return {
                    'response': "Please enter a valid city name (e.g., Karachi, Lahore, Islamabad):",
                    'state': session.state.value,
                    'suggestions': ['Karachi', 'Lahore', 'Islamabad', 'Rawalpindi'],
                    'collected_symptoms': session.collected_symptoms
                }
        
        # Get the specialist
        specialist = session.recommended_specialist
        if not specialist and session.predictions:
            specialist = specialist_mapper.get_specialist_for_disease(session.predictions[0]['disease'])
        if not specialist:
            specialist = specialist_mapper.get_specialist_for_symptoms(session.collected_symptoms)
        
        # Generate maps response
        maps_result = maps_integration.get_location_search_response(specialist, session.user_city)
        
        # Return to results state
        session.state = ConversationState.SHOWING_RESULTS
        
        return {
            'response': maps_result['message'],
            'state': session.state.value,
            'suggestions': ['Start new check', 'Add more symptoms', 'Thank you'],
            'collected_symptoms': session.collected_symptoms,
            'recommended_specialist': specialist,
            'google_maps_url': maps_result['google_maps_url'],
            'marham_url': maps_result['marham_url']
        }
    
    def _handle_greeting(self, session: PatientSession) -> Dict:
        """Handle initial greeting"""
        session.state = ConversationState.COLLECTING_SYMPTOMS
        
        return {
            'response': (
                "Hello! I'm your **ShifaMart+ AI Health Assistant**. 👋\n\n"
                "I'm here to help you understand your symptoms and provide guidance.\n\n"
                "**Please describe your symptoms in your own words.** For example:\n"
                "• 'I have had fever and headache for 2 days'\n"
                "• 'My stomach is hurting and I feel like vomiting'\n"
                "• 'I have difficulty breathing and chest pain'\n\n"
                "⚠️ **Disclaimer:** This is for informational purposes only and does not replace professional medical advice."
            ),
            'state': session.state.value,
            'suggestions': [
                'I have fever and headache',
                'I feel tired and weak',
                'I have stomach pain',
                'I have skin rash'
            ],
            'collected_symptoms': []
        }
    
    def _handle_symptom_collection(self, session: PatientSession, user_message: str) -> Dict:
        """Handle symptom collection with NLP"""
        
        # Check for end/analyze commands
        msg_lower = user_message.lower()
        if any(cmd in msg_lower for cmd in ['done', "that's all", 'thats all', 'no more', 'finish', 'check', 'analyze now', 'analyze']):
            if len(session.collected_symptoms) >= 1:
                session.state = ConversationState.ASKING_DURATION
                return self._ask_duration(session)
            else:
                return {
                    'response': "I need at least one symptom to analyze. Please describe what you're experiencing.",
                    'state': session.state.value,
                    'suggestions': self._get_symptom_suggestions(),
                    'collected_symptoms': []
                }
        
        # Direct analyze command - skip confirmation if we have symptoms
        if user_message.lower() in ['analyze', 'predict', 'analyze now']:
            if len(session.collected_symptoms) >= 1:
                return self._analyze_and_show_results(session)
            else:
                return {
                    'response': "I need at least one symptom to analyze. Please describe what you're experiencing.",
                    'state': session.state.value,
                    'suggestions': self._get_symptom_suggestions(),
                    'collected_symptoms': []
                }
        
        # Use NLP to analyze text and extract symptoms
        nlp_result = self.nlp_processor.analyze_text(user_message)
        session.nlp_analysis = nlp_result
        extracted_symptoms = nlp_result['symptoms']
        
        # Add new symptoms first
        new_symptoms = [s for s in extracted_symptoms if s not in session.collected_symptoms]
        session.collected_symptoms.extend(new_symptoms)
        
        # Check for CRITICAL emergency (only very severe single symptoms)
        critical_found = [s for s in extracted_symptoms if s in self.CRITICAL_EMERGENCY_SYMPTOMS]
        
        # Check for dangerous combinations
        all_symptoms_set = set(session.collected_symptoms)
        dangerous_combo_found = any(combo.issubset(all_symptoms_set) for combo in self.DANGEROUS_COMBINATIONS)
        
        # Only trigger emergency if: multiple critical symptoms OR dangerous combination
        if len(critical_found) >= 2 or dangerous_combo_found:
            session.state = ConversationState.EMERGENCY_DETECTED
            return self._handle_emergency(session, critical_found or list(session.collected_symptoms))
        
        # Warn about severe symptoms but continue conversation
        severe_found = [s for s in extracted_symptoms if s in self.SEVERE_SYMPTOMS]
        
        session.questions_asked += 1
        
        # Store duration if extracted
        if nlp_result['duration']:
            session.symptom_duration = nlp_result['duration']
        
        # Build response
        if new_symptoms:
            formatted_symptoms = [s.replace('_', ' ').title() for s in new_symptoms]
            response = f"I've noted: **{', '.join(formatted_symptoms)}**\n\n"
            
            # Warn about severe symptoms (but don't trigger emergency)
            if severe_found:
                severe_formatted = [s.replace('_', ' ').title() for s in severe_found]
                response += f"⚠️ **Note:** {', '.join(severe_formatted)} can be serious. "
                response += "If symptoms are severe, please consider seeking medical help.\n\n"
        else:
            response = "I couldn't identify specific medical symptoms from that. Could you describe your symptoms more specifically?\n\n"
            response += "For example: 'I have fever', 'my head is paining', 'I feel dizzy'\n\n"
        
        # Check if we should move to duration question
        if len(session.collected_symptoms) >= 2 and session.questions_asked >= 2:
            session.state = ConversationState.ASKING_DURATION
            response += "\n" + self._ask_duration(session)['response']
            return {
                'response': response,
                'state': session.state.value,
                'suggestions': ['Just started', 'Since yesterday', '2-3 days', 'About a week', 'More than a week'],
                'collected_symptoms': session.collected_symptoms
            }
        
        # Current symptoms summary
        if session.collected_symptoms:
            symptom_list = [s.replace('_', ' ').title() for s in session.collected_symptoms]
            response += f"📋 **Current symptoms:** {', '.join(symptom_list)}\n\n"
            response += "Do you have any other symptoms? (Type 'done' when ready to analyze)"
        
        return {
            'response': response,
            'state': session.state.value,
            'suggestions': self._get_related_suggestions(session.collected_symptoms),
            'collected_symptoms': session.collected_symptoms,
            'nlp_analysis': nlp_result
        }
    
    def _ask_duration(self, session: PatientSession) -> Dict:
        """Ask about symptom duration"""
        if session.symptom_duration:
            # Duration already extracted from NLP
            session.state = ConversationState.CONFIRMING_SYMPTOMS
            return self._show_confirmation(session)
        
        symptom_list = [s.replace('_', ' ').title() for s in session.collected_symptoms]
        
        return {
            'response': (
                f"📋 **Symptoms noted:** {', '.join(symptom_list)}\n\n"
                "**How long have you been experiencing these symptoms?**"
            ),
            'state': session.state.value,
            'suggestions': ['Just started today', '1-2 days', '3-5 days', 'About a week', 'More than a week'],
            'collected_symptoms': session.collected_symptoms
        }
    
    def _handle_duration(self, session: PatientSession, user_message: str) -> Dict:
        """Handle duration response - also check if user is adding more symptoms"""
        msg_lower = user_message.lower()
        
        # Check if this looks like a duration or more symptoms
        # Duration patterns: "2 days", "a week", "since yesterday", etc.
        duration_keywords = ['day', 'week', 'hour', 'month', 'yesterday', 'today', 'morning', 
                            'night', 'started', 'since', 'ago', 'few']
        
        is_duration = any(kw in msg_lower for kw in duration_keywords)
        
        # Try to extract symptoms from the message
        nlp_result = self.nlp_processor.analyze_text(user_message)
        extracted_symptoms = nlp_result['symptoms']
        
        # If message contains symptoms but not duration keywords, treat as symptoms
        if extracted_symptoms and not is_duration:
            new_symptoms = [s for s in extracted_symptoms if s not in session.collected_symptoms]
            if new_symptoms:
                session.collected_symptoms.extend(new_symptoms)
                formatted = [s.replace('_', ' ').title() for s in new_symptoms]
                all_symptoms = [s.replace('_', ' ').title() for s in session.collected_symptoms]
                
                # Stay in duration state to ask again
                return {
                    'response': (
                        f"✓ Added: **{', '.join(formatted)}**\n\n"
                        f"📋 **All symptoms:** {', '.join(all_symptoms)}\n\n"
                        f"**How long have you been experiencing these symptoms?**"
                    ),
                    'state': session.state.value,
                    'suggestions': ['Just started', '1-2 days', '3-5 days', 'About a week', 'Skip'],
                    'collected_symptoms': session.collected_symptoms
                }
        
        # Skip duration if user says skip
        if 'skip' in msg_lower or 'don' in msg_lower:
            session.state = ConversationState.CONFIRMING_SYMPTOMS
            return self._show_confirmation(session)
        
        # Extract duration from NLP if available
        if nlp_result['duration']:
            session.symptom_duration = nlp_result['duration']
        else:
            session.symptom_duration = user_message
        
        session.state = ConversationState.CONFIRMING_SYMPTOMS
        return self._show_confirmation(session)
    
    def _show_confirmation(self, session: PatientSession) -> Dict:
        """Show collected symptoms for confirmation"""
        symptom_list = [s.replace('_', ' ').title() for s in session.collected_symptoms]
        
        duration_text = f"\n⏱️ **Duration:** {session.symptom_duration}" if session.symptom_duration else ""
        
        return {
            'response': (
                f"📋 **Summary of your symptoms:**\n\n"
                f"{''.join(['• ' + s + chr(10) for s in symptom_list])}"
                f"{duration_text}\n\n"
                f"Is this correct? Reply **'yes'** to analyze or **'add more'** to add symptoms."
            ),
            'state': session.state.value,
            'suggestions': ['Yes, analyze now', 'Add more symptoms', 'Start over'],
            'collected_symptoms': session.collected_symptoms
        }
    
    def _handle_confirmation(self, session: PatientSession, user_message: str) -> Dict:
        """Handle confirmation response - also try to extract symptoms from the message"""
        msg_lower = user_message.lower()
        
        if 'yes' in msg_lower or 'analyze' in msg_lower or 'correct' in msg_lower or msg_lower == 'ok':
            return self._analyze_and_show_results(session)
        
        elif 'add' in msg_lower or 'more' in msg_lower:
            session.state = ConversationState.COLLECTING_SYMPTOMS
            return {
                'response': "Please describe any additional symptoms you're experiencing.",
                'state': session.state.value,
                'suggestions': self._get_related_suggestions(session.collected_symptoms),
                'collected_symptoms': session.collected_symptoms
            }
        
        elif 'start over' in msg_lower or 'reset' in msg_lower or msg_lower == 'no':
            return self._reset_session(session)
        
        else:
            # Try to extract symptoms from the message (user might be adding more symptoms)
            nlp_result = self.nlp_processor.analyze_text(user_message)
            extracted_symptoms = nlp_result['symptoms']
            
            if extracted_symptoms:
                # User is adding more symptoms
                new_symptoms = [s for s in extracted_symptoms if s not in session.collected_symptoms]
                if new_symptoms:
                    session.collected_symptoms.extend(new_symptoms)
                    formatted = [s.replace('_', ' ').title() for s in new_symptoms]
                    all_symptoms = [s.replace('_', ' ').title() for s in session.collected_symptoms]
                    
                    return {
                        'response': (
                            f"✓ Added: **{', '.join(formatted)}**\n\n"
                            f"📋 **All symptoms:** {', '.join(all_symptoms)}\n\n"
                            f"Ready to analyze? Reply **'yes'** or add more symptoms."
                        ),
                        'state': session.state.value,
                        'suggestions': ['Yes, analyze now', 'Add more symptoms'],
                        'collected_symptoms': session.collected_symptoms
                    }
            
            return {
                'response': "Please reply 'yes' to analyze or describe more symptoms to add.",
                'state': session.state.value,
                'suggestions': ['Yes, analyze', 'I have more symptoms'],
                'collected_symptoms': session.collected_symptoms
            }
    
    def _analyze_and_show_results(self, session: PatientSession) -> Dict:
        """Run prediction, severity analysis, and show results"""
        session.state = ConversationState.SHOWING_RESULTS
        
        # Get disease predictions with duration consideration
        predictions = self.model.predict(
            session.collected_symptoms, 
            top_k=3, 
            duration=session.symptom_duration
        )
        
        # Add duration insight to results
        duration_insight = None
        if session.symptom_duration:
            duration_insight = duration_analyzer.get_duration_insight(
                session.collected_symptoms, 
                session.symptom_duration
            )
        
        # ===== VALIDATION CHECKLIST =====
        # Validate predictions before showing to user
        validation_result = prediction_validator.validate_all_predictions(
            predictions, 
            session.collected_symptoms
        )
        
        # Store validated predictions
        session.predictions = predictions
        session.validation_result = validation_result
        
        # Get severity assessment
        severity_result = self.severity_model.predict_severity(
            session.collected_symptoms, 
            session.symptom_duration
        )
        session.severity_result = severity_result
        
        # Build response
        response = "🔍 **Analysis Results**\n\n"
        
        # Show validation warnings if low confidence
        if validation_result.get('overall_confidence') in ['VERY LOW', 'LOW']:
            validation_msg = prediction_validator.get_validation_message(validation_result)
            if validation_msg:
                response += validation_msg + "\n\n"
        
        # Severity warning first
        if severity_result['level'] in [SeverityLevel.SEVERE, SeverityLevel.EMERGENCY]:
            response += f"⚠️ **Severity: {severity_result['level']}**\n"
            response += f"📍 {severity_result['reason']}\n\n"
            
            if severity_result['is_emergency']:
                response += "🚨 **This requires immediate medical attention!**\n"
                response += "📞 Call **1122 (Rescue)** or **115 (Edhi)** immediately.\n\n"
        
        response += "**Possible Conditions:**\n\n"
        
        for i, pred in enumerate(predictions, 1):
            severity_emoji = self._get_severity_emoji(pred['severity_level'])
            
            response += f"**{i}. {pred['disease']}** ({pred['confidence_percent']})\n"
            response += f"   {severity_emoji} Severity: {pred['severity_level']}\n"
            
            if pred['description'] and pred['description'] != "No description available":
                desc = pred['description'][:120] + "..." if len(pred['description']) > 120 else pred['description']
                response += f"   📖 {desc}\n"
            
            if pred['precautions']:
                response += f"   💊 {', '.join(pred['precautions'][:2])}\n"
            
            response += "\n"
        
        # Get specialist recommendation based on top prediction
        # Always use the disease-based specialist for top prediction (more relevant)
        top_disease = predictions[0]['disease'] if predictions else None
        
        if top_disease:
            specialist = specialist_mapper.get_specialist_for_disease(top_disease)
        else:
            # Fallback to symptom-based if no predictions
            specialist = specialist_mapper.get_specialist_for_symptoms(session.collected_symptoms)
        
        # Add specialist recommendation
        response += "---\n"
        if specialist:
            response += f"\n👨‍⚕️ **Recommended Specialist:** {specialist['icon']} **{specialist['name']}**\n"
            response += f"_{specialist['description']}_\n\n"
        
        # Recommendations based on severity
        if severity_result['level'] == SeverityLevel.EMERGENCY:
            response += "🚨 **Seek emergency medical care immediately.**\n"
        elif severity_result['level'] == SeverityLevel.SEVERE:
            response += "⚠️ **Please consult a doctor as soon as possible.**\n"
        elif severity_result['level'] == SeverityLevel.MODERATE:
            response += "💡 **Consider consulting a healthcare provider if symptoms persist.**\n"
        else:
            response += "💚 **Rest and monitor your symptoms. Consult a doctor if they worsen.**\n"
        
        # Suggestion to find specialist
        if specialist:
            response += f"\n🏥 **Would you like me to help you find a {specialist['name']} near you?**"
        
        response += "\n\n⚕️ *This is for informational purposes only.*"
        response += "\n\n---\n💬 **You can:** Add more symptoms, ask about a disease, or type 'bye' to end."
        
        # Check if first aid is relevant
        first_aid_guide = self.first_aid_system.get_first_aid_for_symptoms(session.collected_symptoms)
        first_aid_available = first_aid_guide is not None
        
        # Build suggestions with specialist option
        suggestions = ['I have more symptoms']
        if specialist:
            suggestions.append(f"Find {specialist['name']}")
        if predictions:
            suggestions.append(f'Tell me about {predictions[0]["disease"]}')
        if first_aid_available:
            suggestions.append('Show first aid')
        suggestions.append('Start new check')
        
        return {
            'response': response,
            'state': session.state.value,
            'predictions': predictions,
            'severity': severity_result,
            'collected_symptoms': session.collected_symptoms,
            'suggestions': suggestions,
            'is_emergency': severity_result['is_emergency'],
            'first_aid_available': first_aid_available,
            'recommended_specialist': specialist
        }
    
    def _handle_emergency(self, session: PatientSession, emergency_symptoms: List[str]) -> Dict:
        """Handle emergency situation with first aid"""
        
        # Get first aid guide
        first_aid_guide = self.first_aid_system.get_first_aid_for_symptoms(emergency_symptoms)
        
        response = "🚨 **EMERGENCY ALERT** 🚨\n\n"
        response += "Based on your symptoms, this could require immediate medical attention.\n\n"
        
        response += "**📞 CALL EMERGENCY SERVICES NOW:**\n"
        response += "• 🚑 Rescue: **1122**\n"
        response += "• 🏥 Edhi: **115**\n\n"
        
        response += f"**Critical symptoms detected:** {', '.join([s.replace('_', ' ').title() for s in emergency_symptoms])}\n\n"
        
        # Show first aid if available
        if first_aid_guide:
            response += f"**🩹 FIRST AID: {first_aid_guide.title}**\n\n"
            response += "**Immediate Steps:**\n"
            for step in first_aid_guide.steps[:5]:
                response += f"{step.step_number}. {step.instruction}\n"
                if step.warning:
                    response += f"   ⚠️ {step.warning}\n"
            
            response += "\n**DO NOT:**\n"
            for item in first_aid_guide.do_not[:3]:
                response += f"• {item}\n"
        
        response += "\n\n⚠️ **Do not delay seeking professional medical help.**"
        
        return {
            'response': response,
            'state': session.state.value,
            'is_emergency': True,
            'emergency_symptoms': emergency_symptoms,
            'first_aid': self.first_aid_system.format_first_aid_json(first_aid_guide) if first_aid_guide else None,
            'suggestions': ['I\'ve called for help', 'Show more first aid steps', 'Start new check'],
            'collected_symptoms': session.collected_symptoms
        }
    
    def _handle_emergency_followup(self, session: PatientSession, user_message: str) -> Dict:
        """Handle follow-up after emergency"""
        msg_lower = user_message.lower()
        
        if 'more' in msg_lower or 'first aid' in msg_lower or 'steps' in msg_lower:
            first_aid_guide = self.first_aid_system.get_first_aid_for_symptoms(session.collected_symptoms)
            if first_aid_guide:
                return {
                    'response': self.first_aid_system.format_first_aid_text(first_aid_guide),
                    'state': session.state.value,
                    'suggestions': ['Start new check'],
                    'collected_symptoms': session.collected_symptoms,
                    'is_emergency': True
                }
        
        elif 'new' in msg_lower or 'start' in msg_lower:
            return self._reset_session(session)
        
        return {
            'response': "Please ensure you've contacted emergency services. Type 'new' to start a new symptom check.",
            'state': session.state.value,
            'suggestions': ['Start new check'],
            'collected_symptoms': session.collected_symptoms,
            'is_emergency': True
        }
    
    def _handle_post_results(self, session: PatientSession, user_message: str) -> Dict:
        """Handle messages after showing results - allow adding more symptoms"""
        msg_lower = user_message.lower()
        
        # Check for re-analyze command
        if 'analyze' in msg_lower or 'predict' in msg_lower or 'check again' in msg_lower:
            return self._analyze_and_show_results(session)
        
        # Check for reset/new session commands
        if 'new' in msg_lower or 'start over' in msg_lower or 'reset' in msg_lower:
            return self._reset_session(session)
        
        # Check for exit/end commands
        if msg_lower in ['bye', 'exit', 'quit', 'thank you', 'thanks', 'end']:
            return {
                'response': "Thank you for using ShifaMart+! Take care and get well soon. 💚\n\nType anything to start a new consultation.",
                'state': session.state.value,
                'suggestions': ['Start new consultation'],
                'collected_symptoms': session.collected_symptoms
            }
        
        # Show first aid if requested
        if 'first aid' in msg_lower or 'instructions' in msg_lower:
            first_aid_guide = self.first_aid_system.get_first_aid_for_symptoms(session.collected_symptoms)
            if first_aid_guide:
                return {
                    'response': self.first_aid_system.format_first_aid_text(first_aid_guide),
                    'state': session.state.value,
                    'suggestions': ['Add more symptoms', 'Start new check', 'Thank you'],
                    'collected_symptoms': session.collected_symptoms
                }
        
        # Find specialist request - Ask for city first
        if 'find' in msg_lower and any(s in msg_lower for s in ['doctor', 'specialist', 'physician', 'cardiologist', 'dermatologist', 'neurologist', 'orthopedic', 'urologist', 'gynecologist', 'gastroenterologist', 'pulmonologist', 'endocrinologist', 'hepatologist', 'nephrologist', 'near']):
            # Get the recommended specialist
            specialist = None
            if session.predictions:
                specialist = specialist_mapper.get_specialist_for_disease(session.predictions[0]['disease'])
            else:
                specialist = specialist_mapper.get_specialist_for_symptoms(session.collected_symptoms)
            
            session.recommended_specialist = specialist
            session.state = ConversationState.ASKING_CITY
            
            response = maps_integration.get_city_prompt()
            response += f"\n\n_Looking for: {specialist['icon']} {specialist['name']}_"
            
            return {
                'response': response,
                'state': session.state.value,
                'suggestions': ['Karachi', 'Lahore', 'Islamabad', 'Rawalpindi', 'Faisalabad'],
                'collected_symptoms': session.collected_symptoms,
                'recommended_specialist': specialist
            }
        
        # Direct city name detection (if user types a city name)
        city_info = maps_integration.get_city_info(msg_lower)
        if city_info and session.predictions:
            # User typed a city directly
            specialist = specialist_mapper.get_specialist_for_disease(session.predictions[0]['disease'])
            session.user_city = city_info['name']
            
            maps_result = maps_integration.get_location_search_response(specialist, session.user_city)
            
            return {
                'response': maps_result['message'],
                'state': session.state.value,
                'suggestions': ['Start new check', 'Thank you'],
                'collected_symptoms': session.collected_symptoms,
                'recommended_specialist': specialist,
                'google_maps_url': maps_result['google_maps_url'],
                'marham_url': maps_result['marham_url']
            }
        
        # Legacy find doctor response (if city wasn't provided)
        if 'find' in msg_lower and 'doctor' in msg_lower:
            specialist = None
            if session.predictions:
                specialist = specialist_mapper.get_specialist_for_disease(session.predictions[0]['disease'])
            else:
                specialist = specialist_mapper.get_specialist_for_symptoms(session.collected_symptoms)
            
            session.recommended_specialist = specialist
            session.state = ConversationState.ASKING_CITY
            
            return {
                'response': maps_integration.get_city_prompt(),
                'state': session.state.value,
                'suggestions': ['Karachi', 'Lahore', 'Islamabad', 'Rawalpindi'],
                'collected_symptoms': session.collected_symptoms,
                'recommended_specialist': specialist
            }
        
        # Keep old response for backward compatibility
        if 'find' in msg_lower:
            specialist = None
            if session.predictions:
                specialist = specialist_mapper.get_specialist_for_disease(session.predictions[0]['disease'])
            else:
                specialist = specialist_mapper.get_specialist_for_symptoms(session.collected_symptoms)
            
            response = f"🏥 **Finding a {specialist['name']} for you**\n\n"
            response += f"{specialist['icon']} **{specialist['name']}**\n"
            response += f"_{specialist['description']}_\n\n"
            response += "**How to find a specialist:**\n\n"
            response += "1. 🌐 **Online Search:** Search for '{specialist_name} near me' on Google Maps\n".format(specialist_name=specialist['name'])
            response += "2. 📱 **Healthcare Apps:** Use apps like Marham, oladoc, or Sehat\n"
            response += "3. 🏥 **Hospital Directory:** Contact nearby hospitals for referrals\n"
            response += "4. 📞 **Helplines:** Call 1166 (Pakistan Health Helpline)\n\n"
            response += "**Questions to ask your doctor:**\n"
            response += "• Describe your symptoms: " + ", ".join([s.replace('_', ' ') for s in session.collected_symptoms[:5]]) + "\n"
            response += "• Mention the duration\n"
            response += "• List any medications you're taking\n\n"
            response += "---\n💬 Type 'new' to start a fresh consultation or 'bye' to end."
            
            return {
                'response': response,
                'state': session.state.value,
                'suggestions': ['Start new check', 'Thank you', 'Bye'],
                'collected_symptoms': session.collected_symptoms,
                'recommended_specialist': specialist
            }
        
        # Tell more about a disease
        if 'tell me' in msg_lower or 'about' in msg_lower:
            if session.predictions:
                pred = session.predictions[0]
                response = f"**More about {pred['disease']}:**\n\n"
                response += f"📖 **Description:**\n{pred['description']}\n\n"
                
                if pred['precautions']:
                    response += "💊 **Recommended Precautions:**\n"
                    for i, prec in enumerate(pred['precautions'], 1):
                        response += f"   {i}. {prec}\n"
                
                response += "\n---\nWould you like to add more symptoms or start a new check?"
                
                return {
                    'response': response,
                    'state': session.state.value,
                    'suggestions': ['Add more symptoms', 'Start new check'],
                    'collected_symptoms': session.collected_symptoms
                }
        
        # DEFAULT: Try to extract symptoms from the message (allow adding more symptoms)
        # This keeps the conversation going!
        nlp_result = self.nlp_processor.analyze_text(user_message)
        extracted_symptoms = nlp_result['symptoms']
        
        if extracted_symptoms:
            # User is adding more symptoms - stay in results mode but allow re-analysis
            new_symptoms = [s for s in extracted_symptoms if s not in session.collected_symptoms]
            if new_symptoms:
                session.collected_symptoms.extend(new_symptoms)
                # Keep state as SHOWING_RESULTS so 'analyze' works directly
                
                formatted = [s.replace('_', ' ').title() for s in new_symptoms]
                all_symptoms = [s.replace('_', ' ').title() for s in session.collected_symptoms]
                
                response = f"✓ Added: **{', '.join(formatted)}**\n\n"
                response += f"📋 **All symptoms:** {', '.join(all_symptoms)}\n\n"
                response += "Type **'analyze'** to get updated predictions, or add more symptoms."
                
                return {
                    'response': response,
                    'state': session.state.value,
                    'suggestions': ['Analyze now', 'I also have nausea', 'I have chills', 'Bye'],
                    'collected_symptoms': session.collected_symptoms
                }
            else:
                all_symptoms = [s.replace('_', ' ').title() for s in session.collected_symptoms]
                return {
                    'response': f"Those symptoms are already noted.\n\n📋 **Current symptoms:** {', '.join(all_symptoms)}\n\nType 'analyze' for predictions or describe more symptoms.",
                    'state': session.state.value,
                    'suggestions': ['Analyze now', 'I have more symptoms', 'Bye'],
                    'collected_symptoms': session.collected_symptoms
                }
        
        # If we can't identify symptoms, offer options
        return {
            'response': "I'm still here to help! You can:\n• Describe more symptoms to add\n• Type 'analyze' to re-analyze\n• Type 'new' for a fresh start\n• Type 'bye' to end",
            'state': session.state.value,
            'suggestions': ['I have more symptoms', 'Analyze again', 'Start new check', 'Bye'],
            'collected_symptoms': session.collected_symptoms
        }
    
    def _reset_session(self, session: PatientSession) -> Dict:
        """Reset session and start over"""
        session.collected_symptoms = []
        session.predictions = []
        session.severity_result = None
        session.symptom_duration = None
        session.questions_asked = 0
        session.nlp_analysis = None
        session.state = ConversationState.GREETING
        return self._handle_greeting(session)
    
    def _get_severity_emoji(self, level: str) -> str:
        """Get emoji for severity level"""
        emojis = {
            'MILD': '🟢',
            'MODERATE': '🟡',
            'SEVERE': '🟠',
            'EMERGENCY': '🔴'
        }
        return emojis.get(level, '⚪')
    
    def _get_symptom_suggestions(self) -> List[str]:
        """Get general symptom suggestions"""
        return [
            'I have fever',
            'I have headache',
            'I feel tired',
            'I have stomach pain',
            'I have cough'
        ]
    
    def _get_related_suggestions(self, current_symptoms: List[str]) -> List[str]:
        """Get suggestions based on current symptoms"""
        suggestions = []
        
        # Related symptom groups
        groups = {
            'fever': ['chills', 'sweating', 'body_pain', 'fatigue'],
            'headache': ['dizziness', 'nausea', 'blurred_and_distorted_vision'],
            'stomach_pain': ['nausea', 'vomiting', 'diarrhoea', 'acidity'],
            'cough': ['breathlessness', 'phlegm', 'throat_irritation'],
            'skin_rash': ['itching', 'redness', 'swelling'],
        }
        
        for symptom in current_symptoms:
            if symptom in groups:
                for related in groups[symptom]:
                    if related not in current_symptoms:
                        suggestions.append(f'I also have {related.replace("_", " ")}')
                        if len(suggestions) >= 3:
                            break
            if len(suggestions) >= 3:
                break
        
        suggestions.append("That's all, analyze now")
        return suggestions[:4]


def interactive_test():
    """Test the enhanced symptom checker interactively"""
    print("\n" + "="*60)
    print("ShifaMart+ Enhanced AI Symptom Checker")
    print("="*60)
    
    # Initialize agent
    agent = EnhancedSymptomChecker()
    agent.load_all_models()
    
    session_id = "test_session_001"
    
    # Start conversation
    response = agent.process_message(session_id, "")
    print(f"\nBot: {response['response']}")
    
    while True:
        user_input = input("\nYou: ").strip()
        
        if user_input.lower() in ['quit', 'exit', 'bye']:
            print("\nBot: Thank you for using ShifaMart+. Take care! 👋")
            break
        
        response = agent.process_message(session_id, user_input)
        print(f"\nBot: {response['response']}")
        
        if response.get('suggestions'):
            print(f"\nSuggestions: {response['suggestions']}")


if __name__ == "__main__":
    interactive_test()

