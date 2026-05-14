"""
ShifaMart+ AI Agent - MERN Integration API
===========================================

This module provides a clean REST API interface for integrating the 
ShifaMart+ AI Agent with a MERN (MongoDB, Express, React, Node.js) application.

QUICK START:
------------
1. Install dependencies: pip install -r requirements.txt
2. Train models (pick ONE):
   - Small / fast demo (41 diseases):  python train_fast.py
   - More diseases & symptoms (e.g. tooth pain):  python train_combined_light.py
3. Start server: python mern_api.py   (or: set PORT=8001 if 8000 is busy)
4. API available at: http://localhost:8000

The API will be available at http://localhost:8000/docs for interactive documentation.

ENDPOINTS FOR MERN INTEGRATION:
-------------------------------
POST /api/chat           - Main chat endpoint for conversational AI
POST /api/analyze        - Quick symptom analysis (text input)
POST /api/predict        - Direct prediction from symptom list
POST /api/severity       - Get severity assessment
POST /api/first-aid      - Get first aid instructions
GET  /api/symptoms       - Get list of all known symptoms
GET  /api/diseases       - Get list of all known diseases
GET  /api/health         - Health check endpoint

All endpoints accept and return JSON.
"""

import socket

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
import os
import sys
import uvicorn
from contextlib import asynccontextmanager

# Windows consoles often default to cp1252; avoid UnicodeEncodeError on emoji in prints
if hasattr(sys.stdout, "reconfigure"):
    try:
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")
        sys.stderr.reconfigure(encoding="utf-8", errors="replace")
    except Exception:
        pass

# Import AI components
from disease_predictor import DiseasePredictionModel
from symptom_checker_v2 import EnhancedSymptomChecker
from nlp_processor import SymptomNLPProcessor
from severity_model import SeverityDetectionModel
from first_aid import FirstAidSystem
from specialist_mapper import specialist_mapper


# ============================================================================
#                           REQUEST/RESPONSE MODELS
# ============================================================================
# These models define the structure of API requests and responses.
# Your MERN backend should send/receive JSON matching these structures.
# ============================================================================

class ChatRequest(BaseModel):
    """
    Chat with the AI symptom checker.
    
    Example request from MERN:
    {
        "session_id": "user_123_abc",
        "message": "I have fever and headache for 2 days"
    }
    """
    session_id: str = Field(..., description="Unique identifier for the chat session (e.g., user ID + timestamp)")
    message: str = Field(..., description="User's message describing symptoms or responding to questions")


class ChatResponse(BaseModel):
    """Response from chat endpoint - contains all information MERN frontend needs"""
    response: str = Field(..., description="AI's text response to display")
    state: str = Field(..., description="Current conversation state (collecting_symptoms, showing_results, etc.)")
    suggestions: List[str] = Field(default=[], description="Quick reply suggestions for the user")
    collected_symptoms: List[str] = Field(default=[], description="List of symptoms identified so far")
    predictions: Optional[List[Dict[str, Any]]] = Field(None, description="Disease predictions (if available)")
    severity: Optional[Dict[str, Any]] = Field(None, description="Severity assessment (if available)")
    is_emergency: bool = Field(default=False, description="True if this is an emergency situation")
    first_aid: Optional[Dict[str, Any]] = Field(None, description="First aid instructions (if emergency)")
    recommended_specialist: Optional[Dict[str, Any]] = Field(None, description="Recommended doctor type")
    google_maps_url: Optional[str] = Field(None, description="URL to find doctors on Google Maps")
    marham_url: Optional[str] = Field(None, description="URL to find doctors on Marham.pk")


class AnalyzeTextRequest(BaseModel):
    """
    Analyze natural language text to extract symptoms and get predictions.
    
    Example request from MERN:
    {
        "text": "I have been feeling tired with headaches and slight fever for the past 3 days"
    }
    """
    text: str = Field(..., description="Natural language description of symptoms")
    top_k: int = Field(default=5, description="Number of top predictions to return")


class PredictRequest(BaseModel):
    """
    Get disease predictions from a list of symptoms.
    
    Example request from MERN:
    {
        "symptoms": ["fever", "headache", "fatigue"],
        "duration": "3 days"
    }
    """
    symptoms: List[str] = Field(..., description="List of symptoms (use underscores, e.g., 'skin_rash')")
    duration: Optional[str] = Field(None, description="Duration of symptoms (e.g., '3 days')")
    top_k: int = Field(default=5, description="Number of top predictions to return")


class SeverityRequest(BaseModel):
    """
    Check severity level for given symptoms.
    
    Example request from MERN:
    {
        "symptoms": ["chest_pain", "breathlessness"],
        "duration": "1 hour"
    }
    """
    symptoms: List[str] = Field(..., description="List of symptoms")
    duration: Optional[str] = Field(None, description="Duration of symptoms")


class FirstAidRequest(BaseModel):
    """
    Get first aid instructions for symptoms or emergency type.
    
    Example request from MERN:
    {
        "symptoms": ["chest_pain", "breathlessness"]
    }
    """
    symptoms: Optional[List[str]] = Field(None, description="List of symptoms")
    emergency_type: Optional[str] = Field(None, description="Specific emergency type (e.g., 'heart_attack')")


# ============================================================================
#                              GLOBAL STATE
# ============================================================================

# AI Components (initialized on startup)
disease_model: DiseasePredictionModel = None
symptom_agent: EnhancedSymptomChecker = None
nlp_processor: SymptomNLPProcessor = None
severity_model: SeverityDetectionModel = None
first_aid_system: FirstAidSystem = None
model_loaded: bool = False


# ============================================================================
#                           LIFESPAN HANDLER
# ============================================================================

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Initialize and cleanup AI models"""
    global disease_model, symptom_agent, nlp_processor, severity_model, first_aid_system, model_loaded
    
    try:
        print("\n" + "="*60)
        print("🚀 INITIALIZING ShifaMart+ AI AGENT")
        print("="*60)
        
        # Initialize components
        disease_model = DiseasePredictionModel()
        symptom_agent = EnhancedSymptomChecker(disease_model)
        nlp_processor = SymptomNLPProcessor()
        severity_model = SeverityDetectionModel()
        first_aid_system = FirstAidSystem()
        
        # Load all models
        symptom_agent.load_all_models()
        nlp_processor.set_known_symptoms(disease_model.get_all_symptoms())
        
        model_loaded = True
        print("✅ All models loaded successfully!")
        print("="*60 + "\n")
        
    except Exception as e:
        print(f"❌ Error loading models: {e}")
        print("💡 Run 'python train_fast.py' first to train the models")
        model_loaded = False
    
    yield  # App runs here
    
    # Cleanup (if needed)
    print("\n👋 Shutting down ShifaMart+ AI Agent...")


# ============================================================================
#                           FASTAPI APP SETUP
# ============================================================================

app = FastAPI(
    title="ShifaMart+ AI API (MERN Integration)",
    description="""
## AI-Powered Healthcare Assistant API

This API provides endpoints for symptom analysis, disease prediction, 
severity detection, and first aid guidance.

### For MERN Integration:
- All endpoints accept JSON requests and return JSON responses
- Use CORS is enabled for all origins (configure for production)
- Sessions are managed server-side using session_id

### Quick Start:
1. Use `/api/chat` for conversational symptom checking
2. Use `/api/analyze` for quick text-based analysis
3. Use `/api/predict` for direct symptom-to-disease prediction
    """,
    version="2.0.0",
    lifespan=lifespan
)

# CORS Configuration - Allow all origins for development
# For production, replace "*" with your MERN app's domain
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Change to ["http://localhost:3000", "https://yourdomain.com"] for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============================================================================
#                           API ENDPOINTS
# ============================================================================

# ------------------------------ HEALTH CHECK --------------------------------

@app.get("/api/health", tags=["Health"])
async def health_check():
    """
    Health check endpoint - Use this to verify the API is running.
    
    Returns:
        - status: "ok" if models are loaded, "error" otherwise
        - model_loaded: boolean indicating if AI models are ready
        - symptoms_count: number of symptoms the model knows
        - diseases_count: number of diseases the model can predict
    """
    return {
        "status": "ok" if model_loaded else "error",
        "model_loaded": model_loaded,
        "symptoms_count": len(disease_model.get_all_symptoms()) if model_loaded else 0,
        "diseases_count": len(disease_model.get_all_diseases()) if model_loaded else 0,
        "message": "ShifaMart+ AI Agent is running" if model_loaded else "Models not loaded - run train_fast.py first"
    }


# --------------------------------- CHAT -------------------------------------

@app.post("/api/chat", response_model=ChatResponse, tags=["Chat"])
async def chat(request: ChatRequest):
    """
    Main chat endpoint for conversational symptom checking.
    
    This is the primary endpoint for MERN integration. It maintains conversation
    state and guides users through symptom collection, analysis, and recommendations.
    
    **How to use in MERN:**
    1. Generate a unique session_id for each user (e.g., `userId_timestamp`)
    2. Send user messages to this endpoint
    3. Display the `response` field to the user
    4. Show `suggestions` as quick reply buttons
    5. Handle `is_emergency` flag for emergency UI
    
    **Conversation Flow:**
    1. User describes symptoms in natural language
    2. AI extracts symptoms and asks follow-up questions
    3. AI provides predictions with severity and specialist recommendations
    4. User can add more symptoms or ask for more information
    """
    if not model_loaded:
        raise HTTPException(status_code=503, detail="Models not loaded. Please wait or run train_fast.py")
    
    try:
        # Process message through the AI agent
        result = symptom_agent.process_message(request.session_id, request.message)
        
        # Clean up None values in suggestions
        suggestions = [s for s in result.get('suggestions', []) if s is not None]
        
        return ChatResponse(
            response=result.get('response', ''),
            state=result.get('state', 'unknown'),
            suggestions=suggestions,
            collected_symptoms=result.get('collected_symptoms', []),
            predictions=result.get('predictions'),
            severity=result.get('severity'),
            is_emergency=result.get('is_emergency', False),
            first_aid=result.get('first_aid'),
            recommended_specialist=result.get('recommended_specialist'),
            google_maps_url=result.get('google_maps_url'),
            marham_url=result.get('marham_url')
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.delete("/api/chat/{session_id}", tags=["Chat"])
async def end_chat_session(session_id: str):
    """
    End a chat session and clear its data.
    
    Call this when user logs out or closes the chat to free up memory.
    """
    if session_id in symptom_agent.sessions:
        del symptom_agent.sessions[session_id]
        return {"success": True, "message": f"Session {session_id} ended"}
    return {"success": True, "message": "Session not found (already ended)"}


# ------------------------------ ANALYZE TEXT --------------------------------

@app.post("/api/analyze", tags=["Analysis"])
async def analyze_text(request: AnalyzeTextRequest):
    """
    Analyze natural language text and get disease predictions.
    
    This is a simpler, stateless endpoint for quick analysis without
    maintaining a conversation. Good for one-shot symptom checking.
    
    **Returns:**
    - extracted_symptoms: List of symptoms found in the text
    - duration: Duration mentioned in the text (if any)
    - predictions: List of possible diseases with confidence scores
    - severity: Severity assessment (MILD, MODERATE, SEVERE, EMERGENCY)
    - recommended_specialist: Type of doctor to consult
    """
    if not model_loaded:
        raise HTTPException(status_code=503, detail="Models not loaded")
    
    try:
        # Use NLP to extract symptoms
        nlp_result = nlp_processor.analyze_text(request.text)
        symptoms = nlp_result['symptoms']
        
        if not symptoms:
            return {
                "success": False,
                "message": "Could not identify symptoms from the text. Please describe your symptoms more specifically.",
                "extracted_symptoms": [],
                "predictions": [],
                "severity": None
            }
        
        # Get predictions
        predictions = disease_model.predict(symptoms, top_k=request.top_k)
        
        # Get severity
        severity = severity_model.predict_severity(symptoms, nlp_result['duration'])
        
        # Get specialist recommendation
        specialist = None
        if predictions:
            specialist = specialist_mapper.get_specialist_for_disease(predictions[0]['disease'])
        
        return {
            "success": True,
            "extracted_symptoms": symptoms,
            "duration": nlp_result['duration'],
            "predictions": predictions,
            "severity": severity,
            "recommended_specialist": specialist,
            "nlp_analysis": nlp_result
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ----------------------------- DIRECT PREDICT -------------------------------

@app.post("/api/predict", tags=["Analysis"])
async def predict_from_symptoms(request: PredictRequest):
    """
    Get disease predictions from a list of symptoms.
    
    Use this when you have already extracted symptoms and just need predictions.
    Symptoms should be in snake_case format (e.g., "skin_rash", "high_fever").
    
    **Returns:**
    - predictions: List of diseases with probability, description, and precautions
    - severity: Severity assessment
    - recommended_specialist: Type of doctor to consult
    """
    if not model_loaded:
        raise HTTPException(status_code=503, detail="Models not loaded")
    
    try:
        # Get predictions (duration-aware if the model supports it)
        try:
            predictions = disease_model.predict(
                request.symptoms,
                top_k=request.top_k,
                duration=request.duration,
            )
        except TypeError:
            # Fallback for models that don't accept duration kwarg
            predictions = disease_model.predict(request.symptoms, top_k=request.top_k)
        
        # Get severity (always duration-aware)
        severity = severity_model.predict_severity(request.symptoms, request.duration)
        
        # Get specialist for the top-ranked disease
        specialist = None
        if predictions:
            specialist = specialist_mapper.get_specialist_for_disease(predictions[0]['disease'])
        
        return {
            "success": True,
            "symptoms": request.symptoms,
            "duration": request.duration,
            "predictions": predictions,
            "severity": severity,
            "recommended_specialist": specialist,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ------------------------------- SEVERITY -----------------------------------

@app.post("/api/severity", tags=["Analysis"])
async def check_severity(request: SeverityRequest):
    """
    Get severity assessment for given symptoms.
    
    **Returns:**
    - level: MILD, MODERATE, SEVERE, or EMERGENCY
    - score: Numeric severity score (0-10)
    - confidence: Model confidence (0-1)
    - reason: Explanation for the severity level
    - is_emergency: Boolean flag for emergency situations
    """
    if not model_loaded:
        raise HTTPException(status_code=503, detail="Models not loaded")
    
    try:
        result = severity_model.predict_severity(request.symptoms, request.duration)
        return {
            "success": True,
            **result
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ------------------------------- FIRST AID ----------------------------------

@app.post("/api/first-aid", tags=["First Aid"])
async def get_first_aid(request: FirstAidRequest):
    """
    Get first aid instructions for symptoms or emergency type.
    
    **Returns:**
    - guide: First aid instructions with steps, warnings, and do-not items
    - emergency_numbers: Emergency contact numbers for Pakistan
    """
    try:
        guide = None
        
        if request.symptoms:
            guide = first_aid_system.get_first_aid_for_symptoms(request.symptoms)
        elif request.emergency_type:
            guide = first_aid_system.get_first_aid(request.emergency_type)
        
        if not guide:
            return {
                "success": True,
                "message": "No specific first aid required for these symptoms",
                "guide": None,
                "emergency_numbers": first_aid_system.EMERGENCY_NUMBERS
            }
        
        return {
            "success": True,
            "guide": first_aid_system.format_first_aid_json(guide),
            "emergency_numbers": first_aid_system.EMERGENCY_NUMBERS
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/first-aid/types", tags=["First Aid"])
async def get_first_aid_types():
    """
    Get list of all available first aid guide types.
    """
    return {
        "types": list(first_aid_system.guides.keys())
    }


@app.get("/api/first-aid/emergency-numbers", tags=["First Aid"])
async def get_emergency_numbers():
    """
    Get emergency contact numbers for Pakistan.
    """
    return first_aid_system.EMERGENCY_NUMBERS


# ----------------------------- REFERENCE DATA -------------------------------

@app.get("/api/symptoms", tags=["Reference"])
async def get_all_symptoms():
    """
    Get list of all known symptoms the AI can recognize.
    
    Use this to build autocomplete or symptom selection UI.
    """
    if not model_loaded:
        raise HTTPException(status_code=503, detail="Models not loaded")
    
    symptoms = disease_model.get_all_symptoms()
    return {
        "count": len(symptoms),
        "symptoms": symptoms
    }


@app.get("/api/diseases", tags=["Reference"])
async def get_all_diseases():
    """
    Get list of all diseases the AI can predict.
    """
    if not model_loaded:
        raise HTTPException(status_code=503, detail="Models not loaded")
    
    diseases = disease_model.get_all_diseases()
    return {
        "count": len(diseases),
        "diseases": diseases
    }


# ============================================================================
#                           SERVER STARTUP
# ============================================================================

def _port_in_use(host: str, port: int) -> bool:
    """Return True if something is already listening on host:port."""
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as sock:
        sock.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
        try:
            sock.bind((host if host != "0.0.0.0" else "127.0.0.1", port))
        except OSError:
            return True
    return False


def start_server(host: str = "0.0.0.0", port: int = 8000):
    """Start the API server"""
    if _port_in_use(host, port):
        print("\n" + "="*70)
        print("PORT ALREADY IN USE")
        print("="*70)
        print(f"\nPort {port} is taken (WinError 10048). Another mern_api / Python process may still be running.")
        print("\nFix (PowerShell) — find PID on 8000, then stop it (no angle brackets):")
        print("    Get-NetTCPConnection -LocalPort 8000 | Select-Object OwningProcess")
        print("    Stop-Process -Id 15940 -Force")
        print("    (replace 15940 with the OwningProcess number you see)")
        print(f"\nOr run this API on a different port:")
        print(f"    $env:PORT=8001; python mern_api.py")
        print("    (and set PYTHON_API_URL=http://localhost:8001 in the Node .env)\n")
        raise SystemExit(1)

    print("\n" + "="*70)
    print("🏥 ShifaMart+ AI API - MERN Integration Server")
    print("="*70)
    print(f"\n🌐 API Server: http://localhost:{port}")
    print(f"📚 Interactive Docs: http://localhost:{port}/docs")
    print(f"🔍 ReDoc: http://localhost:{port}/redoc")
    print(f"\n📋 Main Endpoints for MERN:")
    print(f"   POST /api/chat     - Conversational AI")
    print(f"   POST /api/analyze  - Quick text analysis")
    print(f"   POST /api/predict  - Direct prediction")
    print(f"   GET  /api/health   - Health check")
    print(f"\n⚡ Press Ctrl+C to stop the server")
    print("="*70 + "\n")
    
    uvicorn.run(app, host=host, port=port)


if __name__ == "__main__":
    _port = int(os.environ.get("PORT", "8000"))
    start_server(port=_port)

