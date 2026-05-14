"""
Enhanced FastAPI REST API for ShifaMart+ AI Agent (Version 2)
Includes NLP, Severity Detection, and First Aid features
"""
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pydantic import BaseModel, Field
from typing import List, Optional, Dict
import uvicorn
from pathlib import Path

from disease_predictor import DiseasePredictionModel
from symptom_checker_v2 import EnhancedSymptomChecker
from nlp_processor import SymptomNLPProcessor
from severity_model import SeverityDetectionModel
from first_aid import FirstAidSystem
from specialist_mapper import specialist_mapper


# Initialize FastAPI app
app = FastAPI(
    title="ShifaMart+ AI API v2",
    description="Enhanced AI-powered disease prediction, symptom analysis, severity detection, and first aid guidance",
    version="2.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize AI components
disease_model = DiseasePredictionModel()
symptom_agent = EnhancedSymptomChecker(disease_model)
nlp_processor = SymptomNLPProcessor()
severity_model = SeverityDetectionModel()
first_aid_system = FirstAidSystem()

# Flag to track if model is loaded
model_loaded = False


# ============ Pydantic Models ============

class SymptomInput(BaseModel):
    symptoms: List[str] = Field(..., description="List of symptoms", example=["fever", "headache", "fatigue"])
    top_k: int = Field(default=5, description="Number of top predictions to return")
    duration: Optional[str] = Field(default=None, description="Duration of symptoms", example="3 days")


class TextInput(BaseModel):
    text: str = Field(..., description="Natural language description of symptoms", 
                     example="I have had fever and headache for 2 days, feeling very tired")
    top_k: int = Field(default=5, description="Number of top predictions to return")


class ChatInput(BaseModel):
    session_id: str = Field(..., description="Unique session identifier")
    message: str = Field(..., description="User's message")


class NLPAnalysisRequest(BaseModel):
    text: str = Field(..., description="Text to analyze for symptoms")


class SeverityRequest(BaseModel):
    symptoms: List[str] = Field(..., description="List of symptoms")
    duration: Optional[str] = Field(default=None, description="Duration of symptoms")


class FirstAidRequest(BaseModel):
    emergency_type: str = Field(..., description="Type of emergency", 
                                example="heart_attack")


class FirstAidFromSymptomsRequest(BaseModel):
    symptoms: List[str] = Field(..., description="List of symptoms to get first aid for")


# ============ Response Models ============

class PredictionResult(BaseModel):
    disease: str
    probability: float
    confidence_percent: str
    description: str
    precautions: List[str]
    severity_score: float
    severity_level: str


class NLPAnalysisResponse(BaseModel):
    symptoms: List[str]
    duration: Optional[str]
    overall_severity: str
    symptom_count: int
    extracted_details: List[Dict]


class SeverityResponse(BaseModel):
    level: str
    score: float
    confidence: float
    reason: str
    is_emergency: bool


class SpecialistInfo(BaseModel):
    key: str
    name: str
    description: str
    icon: str


class PredictionResponse(BaseModel):
    predictions: List[PredictionResult]
    matched_symptoms: Optional[List[str]] = None
    severity: Optional[SeverityResponse] = None
    nlp_analysis: Optional[NLPAnalysisResponse] = None
    recommended_specialist: Optional[SpecialistInfo] = None


class ChatResponse(BaseModel):
    response: str
    state: str
    suggestions: List[str]
    collected_symptoms: List[str]
    predictions: Optional[List[Dict]] = None
    severity: Optional[Dict] = None
    is_emergency: bool = False
    first_aid: Optional[Dict] = None
    recommended_specialist: Optional[Dict] = None
    google_maps_url: Optional[str] = None  # Google Maps search URL
    marham_url: Optional[str] = None  # Marham.pk URL


class HealthResponse(BaseModel):
    status: str
    version: str
    model_loaded: bool
    symptoms_count: int
    diseases_count: int
    features: List[str]


# ============ API Endpoints ============

@app.on_event("startup")
async def startup_event():
    """Load all models on startup"""
    global model_loaded
    try:
        symptom_agent.load_all_models()
        nlp_processor.set_known_symptoms(disease_model.get_all_symptoms())
        model_loaded = True
        print("[OK] All models loaded successfully")
    except Exception as e:
        print(f"[WARNING] Could not load models: {e}")
        print("Run train_model.py first to train the model")


@app.get("/", response_model=Dict)
async def root():
    """Root endpoint"""
    return {
        "message": "Welcome to ShifaMart+ AI API v2",
        "version": "2.0.0",
        "docs": "/docs",
        "health": "/health",
        "web_interface": "/web"
    }


@app.get("/health", response_model=HealthResponse)
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy" if model_loaded else "model_not_loaded",
        "version": "2.0.0",
        "model_loaded": model_loaded,
        "symptoms_count": len(disease_model.get_all_symptoms()) if model_loaded else 0,
        "diseases_count": len(disease_model.get_all_diseases()) if model_loaded else 0,
        "features": [
            "Disease Prediction",
            "NLP Symptom Extraction",
            "Severity Detection",
            "First Aid Guidance",
            "Conversational AI Agent"
        ]
    }


# ============ Prediction Endpoints ============

@app.post("/predict/symptoms", response_model=PredictionResponse)
async def predict_from_symptoms(input_data: SymptomInput):
    """Predict diseases from a list of symptoms with severity analysis"""
    if not model_loaded:
        raise HTTPException(status_code=503, detail="Model not loaded")
    
    try:
        # Get predictions
        predictions = disease_model.predict(input_data.symptoms, top_k=input_data.top_k)
        
        # Get severity
        severity = severity_model.predict_severity(input_data.symptoms, input_data.duration)
        
        # Get specialist recommendation based on top prediction
        specialist = None
        if predictions:
            specialist = specialist_mapper.get_specialist_for_disease(predictions[0]['disease'])
        
        return {
            "predictions": predictions,
            "matched_symptoms": input_data.symptoms,
            "severity": severity,
            "recommended_specialist": specialist
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/predict/text", response_model=PredictionResponse)
async def predict_from_text(input_data: TextInput):
    """Predict diseases from natural language text using NLP"""
    if not model_loaded:
        raise HTTPException(status_code=503, detail="Model not loaded")
    
    try:
        # Use NLP to extract symptoms
        nlp_result = nlp_processor.analyze_text(input_data.text)
        symptoms = nlp_result['symptoms']
        
        if not symptoms:
            raise HTTPException(status_code=400, detail="Could not identify symptoms from text")
        
        # Get predictions
        predictions = disease_model.predict(symptoms, top_k=input_data.top_k)
        
        # Get severity
        severity = severity_model.predict_severity(symptoms, nlp_result['duration'])
        
        # Get specialist recommendation
        specialist = None
        if predictions:
            specialist = specialist_mapper.get_specialist_for_disease(predictions[0]['disease'])
        
        return {
            "predictions": predictions,
            "matched_symptoms": symptoms,
            "severity": severity,
            "nlp_analysis": nlp_result,
            "recommended_specialist": specialist
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ============ NLP Endpoints ============

@app.post("/nlp/analyze", response_model=NLPAnalysisResponse)
async def analyze_text(input_data: NLPAnalysisRequest):
    """Analyze text to extract symptoms using NLP"""
    if not model_loaded:
        raise HTTPException(status_code=503, detail="Model not loaded")
    
    try:
        result = nlp_processor.analyze_text(input_data.text)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ============ Severity Endpoints ============

@app.post("/severity/check", response_model=SeverityResponse)
async def check_severity(input_data: SeverityRequest):
    """Check severity level for given symptoms"""
    if not model_loaded:
        raise HTTPException(status_code=503, detail="Model not loaded")
    
    try:
        result = severity_model.predict_severity(input_data.symptoms, input_data.duration)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ============ First Aid Endpoints ============

@app.get("/first-aid/types", response_model=List[str])
async def get_first_aid_types():
    """Get all available first aid types"""
    return list(first_aid_system.guides.keys())


@app.post("/first-aid/guide")
async def get_first_aid_guide(input_data: FirstAidRequest):
    """Get first aid guide for a specific emergency type"""
    guide = first_aid_system.get_first_aid(input_data.emergency_type)
    if not guide:
        raise HTTPException(status_code=404, detail=f"No first aid guide for: {input_data.emergency_type}")
    
    return first_aid_system.format_first_aid_json(guide)


@app.post("/first-aid/for-symptoms")
async def get_first_aid_for_symptoms(input_data: FirstAidFromSymptomsRequest):
    """Get first aid guide based on symptoms"""
    guide = first_aid_system.get_first_aid_for_symptoms(input_data.symptoms)
    if not guide:
        return {"message": "No emergency first aid required for these symptoms", "guide": None}
    
    return first_aid_system.format_first_aid_json(guide)


@app.get("/first-aid/emergency-numbers")
async def get_emergency_numbers():
    """Get emergency contact numbers"""
    return first_aid_system.EMERGENCY_NUMBERS


# ============ Chat Endpoints ============

@app.post("/chat", response_model=ChatResponse)
async def chat(input_data: ChatInput):
    """Chat with the enhanced AI symptom checker agent"""
    if not model_loaded:
        raise HTTPException(status_code=503, detail="Model not loaded")
    
    try:
        response = symptom_agent.process_message(input_data.session_id, input_data.message)
        
        # Filter out None values from suggestions
        suggestions = [s for s in response.get('suggestions', []) if s is not None]
        
        return ChatResponse(
            response=response.get('response', ''),
            state=response.get('state', 'unknown'),
            suggestions=suggestions,
            collected_symptoms=response.get('collected_symptoms', []),
            predictions=response.get('predictions'),
            severity=response.get('severity'),
            is_emergency=response.get('is_emergency', False),
            first_aid=response.get('first_aid'),
            recommended_specialist=response.get('recommended_specialist'),
            google_maps_url=response.get('google_maps_url'),
            marham_url=response.get('marham_url')
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.delete("/chat/{session_id}")
async def end_session(session_id: str):
    """End a chat session"""
    if session_id in symptom_agent.sessions:
        del symptom_agent.sessions[session_id]
        return {"message": f"Session {session_id} ended"}
    return {"message": "Session not found"}


# ============ Reference Data Endpoints ============

@app.get("/symptoms", response_model=List[str])
async def get_all_symptoms():
    """Get list of all known symptoms"""
    if not model_loaded:
        raise HTTPException(status_code=503, detail="Model not loaded")
    return disease_model.get_all_symptoms()


@app.get("/diseases", response_model=List[str])
async def get_all_diseases():
    """Get list of all known diseases"""
    if not model_loaded:
        raise HTTPException(status_code=503, detail="Model not loaded")
    return disease_model.get_all_diseases()


# ============ Web Interface ============

# Serve static files for web interface
web_dir = Path(__file__).parent / "web"
if web_dir.exists():
    app.mount("/static", StaticFiles(directory=str(web_dir)), name="static")

@app.get("/web")
async def serve_web_interface():
    """Serve the web interface"""
    index_path = web_dir / "index.html"
    if index_path.exists():
        return FileResponse(str(index_path))
    raise HTTPException(status_code=404, detail="Web interface not found")


# ============ Run Server ============

def start_server(host: str = "0.0.0.0", port: int = 8000):
    """Start the API server"""
    print("\n" + "="*60)
    print("ShifaMart+ AI API v2")
    print("="*60)
    print(f"\nStarting server at http://{host}:{port}")
    print(f"API Documentation: http://localhost:{port}/docs")
    print(f"Web Interface: http://localhost:{port}/web")
    print("\nPress Ctrl+C to stop the server")
    print("="*60 + "\n")
    
    uvicorn.run(app, host=host, port=port)


if __name__ == "__main__":
    start_server()

