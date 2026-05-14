"""
First Aid Module for ShifaMart+ AI Agent
Comprehensive first-aid guidance for medical emergencies
"""
from typing import List, Dict, Optional
from dataclasses import dataclass


@dataclass
class FirstAidInstruction:
    """Represents a first aid instruction step"""
    step_number: int
    instruction: str
    warning: Optional[str] = None
    image_hint: Optional[str] = None


@dataclass
class FirstAidGuide:
    """Complete first aid guide for an emergency"""
    emergency_type: str
    title: str
    description: str
    call_emergency: bool
    emergency_number: str
    steps: List[FirstAidInstruction]
    do_not: List[str]
    when_to_call_emergency: List[str]
    additional_notes: str


class FirstAidSystem:
    """
    Comprehensive First Aid System for ShifaMart+
    Provides step-by-step guidance for medical emergencies
    """
    
    # Pakistan emergency numbers
    EMERGENCY_NUMBERS = {
        'ambulance': '1122 (Rescue)',
        'police': '15',
        'fire': '16',
        'edhi': '115',
        'aman_foundation': '1021',
    }
    
    # Symptom to emergency type mapping
    SYMPTOM_TO_EMERGENCY = {
        # Cardiac emergencies
        'chest_pain': 'heart_attack',
        'severe_chest_pain': 'heart_attack',
        'palpitations': 'cardiac_arrhythmia',
        
        # Respiratory emergencies
        'breathlessness': 'breathing_difficulty',
        'choking': 'choking',
        'asthma_attack': 'asthma_attack',
        
        # Neurological emergencies
        'weakness_of_one_body_side': 'stroke',
        'slurred_speech': 'stroke',
        'altered_sensorium': 'unconsciousness',
        'coma': 'unconsciousness',
        'seizures': 'seizure',
        
        # Trauma
        'severe_bleeding': 'bleeding',
        'burns': 'burns',
        'fracture': 'fracture',
        
        # Allergic
        'allergic_reaction': 'anaphylaxis',
        'skin_swelling': 'anaphylaxis',
        
        # Other
        'poisoning': 'poisoning',
        'drowning': 'drowning',
        'electric_shock': 'electric_shock',
        'high_fever': 'high_fever_emergency',
        'dehydration': 'severe_dehydration',
        'stomach_bleeding': 'internal_bleeding',
    }
    
    def __init__(self):
        self.guides = self._build_first_aid_guides()
    
    def _build_first_aid_guides(self) -> Dict[str, FirstAidGuide]:
        """Build comprehensive first aid guides for all emergencies"""
        
        guides = {}
        
        # =============== HEART ATTACK ===============
        guides['heart_attack'] = FirstAidGuide(
            emergency_type='heart_attack',
            title='Heart Attack First Aid',
            description='A heart attack occurs when blood flow to the heart is blocked. Quick action can save lives.',
            call_emergency=True,
            emergency_number='1122',
            steps=[
                FirstAidInstruction(1, "Call 1122 (Rescue) or Edhi 115 immediately", 
                                   "Do not wait to see if symptoms improve"),
                FirstAidInstruction(2, "Have the person sit down and rest in a comfortable position (usually sitting up is better)",
                                   "Do not let them walk or exert themselves"),
                FirstAidInstruction(3, "Loosen any tight clothing around neck, chest, and waist"),
                FirstAidInstruction(4, "If the person is not allergic to aspirin and has no bleeding problems, give them one regular aspirin (325mg) to chew slowly",
                                   "Do NOT give aspirin if allergic or if there's bleeding"),
                FirstAidInstruction(5, "If the person has nitroglycerin medication, help them take it as prescribed"),
                FirstAidInstruction(6, "Keep the person calm and reassured - stress worsens the condition"),
                FirstAidInstruction(7, "Monitor breathing and pulse. Be ready to perform CPR if they become unresponsive"),
                FirstAidInstruction(8, "If the person becomes unconscious and stops breathing, begin CPR: 30 chest compressions followed by 2 rescue breaths"),
            ],
            do_not=[
                "Do NOT leave the person alone",
                "Do NOT let them eat or drink anything except aspirin/water",
                "Do NOT let them walk or climb stairs",
                "Do NOT ignore symptoms - call emergency even if unsure",
                "Do NOT give aspirin if person is allergic or has bleeding problems",
            ],
            when_to_call_emergency=[
                "Crushing chest pain or pressure",
                "Pain spreading to arm, jaw, neck, or back",
                "Shortness of breath with chest discomfort",
                "Cold sweats, nausea, or lightheadedness",
                "Symptoms lasting more than 5 minutes",
            ],
            additional_notes="Women may experience atypical symptoms like fatigue, nausea, and back pain instead of chest pain."
        )
        
        # =============== STROKE ===============
        guides['stroke'] = FirstAidGuide(
            emergency_type='stroke',
            title='Stroke First Aid (F.A.S.T.)',
            description='A stroke is a brain attack. Every minute counts - fast treatment can minimize brain damage.',
            call_emergency=True,
            emergency_number='1122',
            steps=[
                FirstAidInstruction(1, "Use F.A.S.T. to identify stroke:\n- Face: Ask them to smile. Does one side droop?\n- Arms: Ask them to raise both arms. Does one drift down?\n- Speech: Ask them to repeat a simple phrase. Is speech slurred?\n- Time: If any of these signs, call 1122 immediately!"),
                FirstAidInstruction(2, "Call 1122 (Rescue) immediately - note the time symptoms started"),
                FirstAidInstruction(3, "Lay the person down with head and shoulders slightly elevated"),
                FirstAidInstruction(4, "If vomiting or unconscious, turn them on their side (recovery position)"),
                FirstAidInstruction(5, "Loosen any restrictive clothing"),
                FirstAidInstruction(6, "Do NOT give any food, water, or medication"),
                FirstAidInstruction(7, "Keep the person calm and still - avoid sudden movements"),
                FirstAidInstruction(8, "Monitor consciousness and breathing until help arrives"),
                FirstAidInstruction(9, "If they stop breathing, begin CPR"),
            ],
            do_not=[
                "Do NOT give any food or water (swallowing may be affected)",
                "Do NOT give aspirin (stroke might be caused by bleeding)",
                "Do NOT let them fall asleep before help arrives",
                "Do NOT move them unnecessarily",
            ],
            when_to_call_emergency=[
                "Sudden numbness or weakness, especially on one side",
                "Sudden confusion or trouble speaking",
                "Sudden trouble seeing in one or both eyes",
                "Sudden severe headache with no known cause",
                "Sudden dizziness, loss of balance or coordination",
            ],
            additional_notes="Treatment within 3 hours of first symptoms can significantly reduce brain damage."
        )
        
        # =============== BREATHING DIFFICULTY ===============
        guides['breathing_difficulty'] = FirstAidGuide(
            emergency_type='breathing_difficulty',
            title='Breathing Difficulty First Aid',
            description='Difficulty breathing can be caused by various conditions. Stay calm and act quickly.',
            call_emergency=True,
            emergency_number='1122',
            steps=[
                FirstAidInstruction(1, "Call 1122 immediately if severe breathlessness"),
                FirstAidInstruction(2, "Help the person sit upright - sitting up is usually easier for breathing"),
                FirstAidInstruction(3, "Loosen tight clothing around the neck and chest"),
                FirstAidInstruction(4, "Open windows or move to fresh air if possible"),
                FirstAidInstruction(5, "If they have an inhaler (for asthma), help them use it"),
                FirstAidInstruction(6, "Encourage slow, deep breaths - breathe in through nose, out through mouth"),
                FirstAidInstruction(7, "Keep them calm - anxiety worsens breathing difficulty"),
                FirstAidInstruction(8, "Do not give anything to eat or drink"),
                FirstAidInstruction(9, "If they become unconscious, place in recovery position and check breathing"),
            ],
            do_not=[
                "Do NOT make them lie flat",
                "Do NOT give food or drink",
                "Do NOT leave them alone",
                "Do NOT panic - stay calm to help them stay calm",
            ],
            when_to_call_emergency=[
                "Lips or fingernails turning blue",
                "Unable to speak in full sentences",
                "Gasping or wheezing sounds",
                "Chest retracting with each breath",
                "Confusion or decreasing alertness",
            ],
            additional_notes="If caused by known asthma, use prescribed inhaler. If allergic reaction suspected, use EpiPen if available."
        )
        
        # =============== CHOKING ===============
        guides['choking'] = FirstAidGuide(
            emergency_type='choking',
            title='Choking First Aid (Heimlich Maneuver)',
            description='Choking occurs when an object blocks the airway. Quick action is critical.',
            call_emergency=True,
            emergency_number='1122',
            steps=[
                FirstAidInstruction(1, "Ask 'Are you choking?' If they cannot speak, cough, or breathe, act immediately"),
                FirstAidInstruction(2, "Call 1122 or have someone else call while you help"),
                FirstAidInstruction(3, "Stand behind the person, wrap your arms around their waist"),
                FirstAidInstruction(4, "Make a fist with one hand, place it just above the navel (belly button)"),
                FirstAidInstruction(5, "Grab your fist with your other hand"),
                FirstAidInstruction(6, "Give quick, upward thrusts into the abdomen"),
                FirstAidInstruction(7, "Repeat thrusts until object is expelled or person becomes unconscious"),
                FirstAidInstruction(8, "If person becomes unconscious, lower them to the ground and begin CPR"),
                FirstAidInstruction(9, "Before giving rescue breaths, look in mouth and remove visible objects"),
            ],
            do_not=[
                "Do NOT do blind finger sweeps",
                "Do NOT slap them on the back while they're upright (may push object deeper)",
                "Do NOT give water to help swallow the object",
            ],
            when_to_call_emergency=[
                "Person cannot speak, cough, or breathe",
                "Person is turning blue",
                "Person becomes unconscious",
                "Object cannot be removed after several attempts",
            ],
            additional_notes="For pregnant women or obese persons, use chest thrusts instead of abdominal thrusts."
        )
        
        # =============== SEVERE BLEEDING ===============
        guides['bleeding'] = FirstAidGuide(
            emergency_type='bleeding',
            title='Severe Bleeding First Aid',
            description='Severe bleeding can be life-threatening. Controlling blood loss is the priority.',
            call_emergency=True,
            emergency_number='1122',
            steps=[
                FirstAidInstruction(1, "Call 1122 immediately for severe bleeding"),
                FirstAidInstruction(2, "Protect yourself - wear gloves if available"),
                FirstAidInstruction(3, "Apply direct pressure to the wound using a clean cloth or bandage",
                                   "Press firmly and do not remove the cloth"),
                FirstAidInstruction(4, "If blood soaks through, add more cloth on top - do NOT remove the first layer"),
                FirstAidInstruction(5, "If possible, elevate the injured area above the heart level"),
                FirstAidInstruction(6, "Maintain pressure for at least 15 minutes without checking"),
                FirstAidInstruction(7, "If bleeding doesn't stop, apply pressure to the nearest pressure point"),
                FirstAidInstruction(8, "Once bleeding slows, secure the bandage firmly but not too tight"),
                FirstAidInstruction(9, "Keep the person warm and lying down to prevent shock"),
                FirstAidInstruction(10, "Monitor for signs of shock: pale skin, rapid pulse, confusion"),
            ],
            do_not=[
                "Do NOT remove the pressure bandage once applied",
                "Do NOT apply a tourniquet unless trained and as a last resort",
                "Do NOT clean large wounds - let medical professionals handle it",
                "Do NOT remove objects embedded in wounds",
            ],
            when_to_call_emergency=[
                "Blood spurting from wound",
                "Bleeding doesn't stop after 15 minutes of pressure",
                "Wound is deep or large",
                "Object is embedded in wound",
                "Signs of shock appear",
            ],
            additional_notes="For nosebleeds: lean forward, pinch soft part of nose for 10-15 minutes."
        )
        
        # =============== BURNS ===============
        guides['burns'] = FirstAidGuide(
            emergency_type='burns',
            title='Burns First Aid',
            description='Proper first aid for burns can reduce damage and prevent infection.',
            call_emergency=True,
            emergency_number='1122',
            steps=[
                FirstAidInstruction(1, "Remove the person from the heat source safely"),
                FirstAidInstruction(2, "Cool the burn with cool (not cold) running water for at least 10-20 minutes",
                                   "Do NOT use ice, butter, or toothpaste"),
                FirstAidInstruction(3, "Remove jewelry or tight items near the burn before swelling starts"),
                FirstAidInstruction(4, "Do NOT break blisters - cover with clean, non-fluffy material"),
                FirstAidInstruction(5, "Cover the burn loosely with cling film or a clean plastic bag"),
                FirstAidInstruction(6, "For severe burns, cover with a clean sheet and keep person warm"),
                FirstAidInstruction(7, "Give small sips of water if person is conscious and not nauseous"),
                FirstAidInstruction(8, "For chemical burns, brush off dry chemicals first, then rinse with water"),
            ],
            do_not=[
                "Do NOT apply ice, butter, oil, or toothpaste",
                "Do NOT break blisters",
                "Do NOT remove clothing stuck to the burn",
                "Do NOT touch the burn with bare hands",
                "Do NOT use cotton wool directly on burn",
            ],
            when_to_call_emergency=[
                "Burns larger than the person's palm",
                "Burns on face, hands, feet, or genitals",
                "Deep burns (white or charred appearance)",
                "Chemical or electrical burns",
                "Burns affecting breathing",
                "Burns in children or elderly",
            ],
            additional_notes="For electrical burns, ensure power source is off before touching the person."
        )
        
        # =============== SEIZURE ===============
        guides['seizure'] = FirstAidGuide(
            emergency_type='seizure',
            title='Seizure First Aid',
            description='During a seizure, focus on keeping the person safe until it passes.',
            call_emergency=True,
            emergency_number='1122',
            steps=[
                FirstAidInstruction(1, "Stay calm and time the seizure"),
                FirstAidInstruction(2, "Clear the area of dangerous objects - move furniture away"),
                FirstAidInstruction(3, "Protect the head - place something soft under it",
                                   "Do NOT restrain the person"),
                FirstAidInstruction(4, "Loosen tight clothing, especially around neck"),
                FirstAidInstruction(5, "Do NOT put anything in their mouth",
                                   "They cannot swallow their tongue"),
                FirstAidInstruction(6, "Once seizure ends, gently roll them onto their side (recovery position)"),
                FirstAidInstruction(7, "Stay with them until fully conscious and aware"),
                FirstAidInstruction(8, "Speak calmly and reassure them as they recover"),
            ],
            do_not=[
                "Do NOT restrain or hold them down",
                "Do NOT put anything in their mouth",
                "Do NOT give water or food until fully alert",
                "Do NOT leave them alone",
            ],
            when_to_call_emergency=[
                "Seizure lasts more than 5 minutes",
                "Person doesn't regain consciousness",
                "Person has another seizure",
                "Person is injured during seizure",
                "Person has breathing difficulties after seizure",
                "It's their first seizure",
                "Person is pregnant or has diabetes",
            ],
            additional_notes="Most seizures last 1-3 minutes. Call for help if it lasts longer than 5 minutes."
        )
        
        # =============== UNCONSCIOUSNESS ===============
        guides['unconsciousness'] = FirstAidGuide(
            emergency_type='unconsciousness',
            title='Unconscious Person First Aid',
            description='When someone is unconscious, check for breathing and maintain airway.',
            call_emergency=True,
            emergency_number='1122',
            steps=[
                FirstAidInstruction(1, "Check responsiveness - tap shoulders and shout 'Are you OK?'"),
                FirstAidInstruction(2, "Call 1122 immediately"),
                FirstAidInstruction(3, "Open the airway - tilt head back, lift chin"),
                FirstAidInstruction(4, "Check for breathing - look, listen, and feel for 10 seconds"),
                FirstAidInstruction(5, "If breathing: place in recovery position (on side)"),
                FirstAidInstruction(6, "If NOT breathing: begin CPR immediately"),
                FirstAidInstruction(7, "CPR: 30 chest compressions (2 inches deep, 100-120/min) + 2 rescue breaths"),
                FirstAidInstruction(8, "Continue CPR until help arrives or person starts breathing"),
                FirstAidInstruction(9, "If AED is available, use it and follow voice prompts"),
            ],
            do_not=[
                "Do NOT move them unless they're in danger",
                "Do NOT give food or water",
                "Do NOT slap or shake them",
                "Do NOT leave them on their back if breathing (risk of choking)",
            ],
            when_to_call_emergency=[
                "Person is unresponsive",
                "Person is not breathing normally",
                "Cause of unconsciousness is unknown",
                "Person was injured before becoming unconscious",
            ],
            additional_notes="Recovery position: roll onto side, top leg bent, head tilted back, hand under cheek."
        )
        
        # =============== ANAPHYLAXIS ===============
        guides['anaphylaxis'] = FirstAidGuide(
            emergency_type='anaphylaxis',
            title='Severe Allergic Reaction (Anaphylaxis) First Aid',
            description='Anaphylaxis is a severe, life-threatening allergic reaction requiring immediate treatment.',
            call_emergency=True,
            emergency_number='1122',
            steps=[
                FirstAidInstruction(1, "Call 1122 immediately - this is life-threatening"),
                FirstAidInstruction(2, "If person has an EpiPen (adrenaline auto-injector), help them use it immediately",
                                   "Inject into outer thigh through clothing if needed"),
                FirstAidInstruction(3, "Help them lie down with legs elevated (unless breathing is difficult)"),
                FirstAidInstruction(4, "If breathing is difficult, let them sit up"),
                FirstAidInstruction(5, "Loosen tight clothing"),
                FirstAidInstruction(6, "If vomiting or unconscious, place in recovery position"),
                FirstAidInstruction(7, "A second EpiPen dose may be given after 5-15 minutes if symptoms don't improve"),
                FirstAidInstruction(8, "Be prepared to perform CPR if they stop breathing"),
            ],
            do_not=[
                "Do NOT delay using EpiPen if available",
                "Do NOT make them stand or sit up if feeling faint",
                "Do NOT give oral medication if having trouble swallowing",
                "Do NOT leave them alone",
            ],
            when_to_call_emergency=[
                "Difficulty breathing or swallowing",
                "Swelling of face, lips, tongue, or throat",
                "Widespread rash or hives",
                "Dizziness or fainting",
                "Rapid or weak pulse",
                "Known severe allergy exposure",
            ],
            additional_notes="Common triggers: nuts, shellfish, bee stings, medications. Even after recovery, go to hospital as symptoms can return."
        )
        
        # =============== POISONING ===============
        guides['poisoning'] = FirstAidGuide(
            emergency_type='poisoning',
            title='Poisoning First Aid',
            description='Poisoning can occur from swallowing, inhaling, or touching toxic substances.',
            call_emergency=True,
            emergency_number='1122',
            steps=[
                FirstAidInstruction(1, "Call 1122 immediately - keep the poison container for identification"),
                FirstAidInstruction(2, "If swallowed: Do NOT induce vomiting unless told by poison control",
                                   "Some poisons cause more damage coming back up"),
                FirstAidInstruction(3, "If on skin: Remove contaminated clothing and rinse skin with water"),
                FirstAidInstruction(4, "If inhaled: Move to fresh air immediately"),
                FirstAidInstruction(5, "If in eyes: Rinse with clean water for 15-20 minutes"),
                FirstAidInstruction(6, "Keep the person calm and still"),
                FirstAidInstruction(7, "If unconscious but breathing, place in recovery position"),
                FirstAidInstruction(8, "If not breathing, begin CPR (mouth-to-mouth may not be safe - use hands-only CPR)"),
                FirstAidInstruction(9, "Save any vomit for analysis if possible"),
            ],
            do_not=[
                "Do NOT induce vomiting unless instructed",
                "Do NOT give anything by mouth unless instructed",
                "Do NOT use home remedies like milk or raw eggs",
                "Do NOT neutralize poison with acids or alkalis",
            ],
            when_to_call_emergency=[
                "Any suspected poisoning",
                "Difficulty breathing",
                "Confusion or unconsciousness",
                "Seizures",
                "Burns around mouth",
                "Child has swallowed any medication",
            ],
            additional_notes="Keep all medications and chemicals locked away from children."
        )
        
        # =============== HIGH FEVER EMERGENCY ===============
        guides['high_fever_emergency'] = FirstAidGuide(
            emergency_type='high_fever_emergency',
            title='High Fever Emergency First Aid',
            description='Very high fever (above 104F/40C) requires immediate attention.',
            call_emergency=True,
            emergency_number='1122',
            steps=[
                FirstAidInstruction(1, "Call 1122 if fever is above 104F (40C) or accompanied by severe symptoms"),
                FirstAidInstruction(2, "Give fever-reducing medication (paracetamol) if available and not allergic"),
                FirstAidInstruction(3, "Remove excess clothing - leave light, loose clothing"),
                FirstAidInstruction(4, "Apply cool (not cold) wet cloths to forehead, wrists, and groin"),
                FirstAidInstruction(5, "Give plenty of fluids - water, ORS, or clear liquids",
                                   "Avoid caffeinated drinks"),
                FirstAidInstruction(6, "Keep the room well-ventilated with fresh air"),
                FirstAidInstruction(7, "Sponge body with lukewarm (not cold) water",
                                   "Cold water can cause shivering which raises temperature"),
                FirstAidInstruction(8, "Monitor temperature every 30 minutes"),
            ],
            do_not=[
                "Do NOT use ice baths or very cold water",
                "Do NOT give aspirin to children",
                "Do NOT over-dress or bundle up",
                "Do NOT ignore if accompanied by stiff neck or rash",
            ],
            when_to_call_emergency=[
                "Temperature above 104F (40C)",
                "Fever with stiff neck",
                "Fever with difficulty breathing",
                "Fever with seizure",
                "Fever with rash that doesn't fade when pressed",
                "Fever in infant under 3 months",
            ],
            additional_notes="Fever is the body's response to infection. However, very high fever needs treatment."
        )
        
        # =============== SEVERE DEHYDRATION ===============
        guides['severe_dehydration'] = FirstAidGuide(
            emergency_type='severe_dehydration',
            title='Severe Dehydration First Aid',
            description='Severe dehydration can be dangerous, especially in children and elderly.',
            call_emergency=True,
            emergency_number='1122',
            steps=[
                FirstAidInstruction(1, "Move person to a cool, shaded area"),
                FirstAidInstruction(2, "If conscious, give ORS (oral rehydration solution) in small sips"),
                FirstAidInstruction(3, "If ORS not available, give water with a pinch of salt and sugar"),
                FirstAidInstruction(4, "Remove excess clothing"),
                FirstAidInstruction(5, "Cool the skin with damp cloths"),
                FirstAidInstruction(6, "Do NOT give large amounts of water at once",
                                   "Small frequent sips are better"),
                FirstAidInstruction(7, "Monitor for improvement or worsening"),
                FirstAidInstruction(8, "If vomiting prevents drinking, seek immediate medical help"),
            ],
            do_not=[
                "Do NOT give caffeinated, carbonated, or alcoholic drinks",
                "Do NOT force fluids if person is vomiting repeatedly",
                "Do NOT give only plain water - add salt/sugar or use ORS",
            ],
            when_to_call_emergency=[
                "No urination for 8+ hours",
                "Extreme lethargy or confusion",
                "Rapid heartbeat",
                "Sunken eyes",
                "Unable to keep fluids down",
                "In infants: no tears when crying, sunken soft spot",
            ],
            additional_notes="ORS Recipe: 1 liter water + 6 teaspoons sugar + 1/2 teaspoon salt"
        )
        
        return guides
    
    def get_first_aid(self, emergency_type: str) -> Optional[FirstAidGuide]:
        """Get first aid guide for an emergency type"""
        return self.guides.get(emergency_type)
    
    def get_first_aid_for_symptoms(self, symptoms: List[str]) -> Optional[FirstAidGuide]:
        """Get first aid guide based on symptoms"""
        for symptom in symptoms:
            if symptom in self.SYMPTOM_TO_EMERGENCY:
                emergency_type = self.SYMPTOM_TO_EMERGENCY[symptom]
                if emergency_type in self.guides:
                    return self.guides[emergency_type]
        return None
    
    def format_first_aid_text(self, guide: FirstAidGuide) -> str:
        """Format first aid guide as readable text"""
        output = []
        output.append(f"\n{'='*60}")
        output.append(f"FIRST AID: {guide.title}")
        output.append('='*60)
        
        if guide.call_emergency:
            output.append(f"\n[EMERGENCY] Call {guide.emergency_number} immediately!\n")
        
        output.append(guide.description)
        
        output.append("\n--- STEPS ---")
        for step in guide.steps:
            output.append(f"\n{step.step_number}. {step.instruction}")
            if step.warning:
                output.append(f"   [!] {step.warning}")
        
        output.append("\n--- DO NOT ---")
        for item in guide.do_not:
            output.append(f"  - {item}")
        
        output.append("\n--- CALL EMERGENCY IF ---")
        for item in guide.when_to_call_emergency:
            output.append(f"  - {item}")
        
        if guide.additional_notes:
            output.append(f"\n[Note] {guide.additional_notes}")
        
        output.append(f"\nEmergency Numbers: {', '.join([f'{k}: {v}' for k, v in self.EMERGENCY_NUMBERS.items()])}")
        
        return '\n'.join(output)
    
    def format_first_aid_html(self, guide: FirstAidGuide) -> str:
        """Format first aid guide as HTML for web display"""
        html = f"""
        <div class="first-aid-guide">
            <h2 class="emergency-title">{guide.title}</h2>
            
            {'<div class="emergency-call"><strong>CALL ' + guide.emergency_number + ' IMMEDIATELY!</strong></div>' if guide.call_emergency else ''}
            
            <p class="description">{guide.description}</p>
            
            <h3>Steps:</h3>
            <ol class="steps">
        """
        
        for step in guide.steps:
            html += f"""
                <li>
                    {step.instruction}
                    {'<span class="warning">' + step.warning + '</span>' if step.warning else ''}
                </li>
            """
        
        html += """
            </ol>
            
            <h3>Do NOT:</h3>
            <ul class="donot">
        """
        
        for item in guide.do_not:
            html += f"<li>{item}</li>"
        
        html += """
            </ul>
            
            <h3>Call Emergency If:</h3>
            <ul class="emergency-signs">
        """
        
        for item in guide.when_to_call_emergency:
            html += f"<li>{item}</li>"
        
        html += f"""
            </ul>
            
            <p class="notes"><strong>Note:</strong> {guide.additional_notes}</p>
            
            <div class="emergency-numbers">
                <strong>Emergency Numbers:</strong><br>
                {'<br>'.join([f'{k}: {v}' for k, v in self.EMERGENCY_NUMBERS.items()])}
            </div>
        </div>
        """
        
        return html
    
    def format_first_aid_json(self, guide: FirstAidGuide) -> Dict:
        """Format first aid guide as JSON/dict"""
        return {
            'emergency_type': guide.emergency_type,
            'title': guide.title,
            'description': guide.description,
            'call_emergency': guide.call_emergency,
            'emergency_number': guide.emergency_number,
            'steps': [
                {
                    'step': s.step_number,
                    'instruction': s.instruction,
                    'warning': s.warning
                }
                for s in guide.steps
            ],
            'do_not': guide.do_not,
            'when_to_call_emergency': guide.when_to_call_emergency,
            'additional_notes': guide.additional_notes,
            'emergency_numbers': self.EMERGENCY_NUMBERS
        }


def test_first_aid():
    """Test the first aid system"""
    system = FirstAidSystem()
    
    print("="*60)
    print("First Aid System Test")
    print("="*60)
    
    # Test specific emergencies
    emergencies = ['heart_attack', 'stroke', 'choking', 'bleeding']
    
    for emergency in emergencies:
        guide = system.get_first_aid(emergency)
        if guide:
            print(system.format_first_aid_text(guide))
            print("\n")
    
    # Test symptom-based lookup
    print("\n" + "="*60)
    print("Symptom-based First Aid Lookup")
    print("="*60)
    
    test_symptoms = [
        ['chest_pain', 'sweating'],
        ['weakness_of_one_body_side', 'headache'],
        ['breathlessness', 'cough'],
    ]
    
    for symptoms in test_symptoms:
        print(f"\nSymptoms: {symptoms}")
        guide = system.get_first_aid_for_symptoms(symptoms)
        if guide:
            print(f"Matched Emergency: {guide.emergency_type}")
            print(f"First step: {guide.steps[0].instruction}")


if __name__ == "__main__":
    test_first_aid()

