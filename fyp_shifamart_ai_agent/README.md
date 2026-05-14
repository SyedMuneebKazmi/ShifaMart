# ShifaMart+ AI Agent

AI-powered disease prediction and symptom analysis system for the ShifaMart+ healthcare platform.

## 🚀 Quick Start

### 1. Install Dependencies

```bash
cd ai_agent
pip install -r requirements.txt
```

### 2. Train the Model

```bash
python train_model.py
```

This will:
- Load and preprocess the symptom-disease dataset
- Train XGBoost and Random Forest models
- Create an ensemble model
- Save all models to `models/` directory

### 3. Run the API

```bash
python api.py
```

API will be available at: `http://localhost:8000`

API Documentation: `http://localhost:8000/docs`

### 4. Test Interactively

```bash
python symptom_checker.py
```

## 📁 Project Structure

```
ai_agent/
├── config.py              # Configuration settings
├── data_preprocessing.py  # Data loading and preprocessing
├── disease_predictor.py   # ML model training and prediction
├── symptom_checker.py     # Conversational AI agent
├── api.py                 # FastAPI REST endpoints
├── train_model.py         # Training script
├── requirements.txt       # Python dependencies
├── models/                # Saved models (created after training)
│   ├── ensemble_model.joblib
│   ├── rf_model.joblib
│   ├── xgb_model.joblib
│   └── preprocessor.joblib
└── README.md
```

## 🔌 API Endpoints

### Health Check
```bash
GET /health
```

### Predict from Symptoms List
```bash
POST /predict/symptoms
{
    "symptoms": ["fever", "headache", "fatigue"],
    "top_k": 5
}
```

### Predict from Text
```bash
POST /predict/text
{
    "text": "I have fever and headache for 2 days",
    "top_k": 5
}
```

### Chat with AI Agent
```bash
POST /chat
{
    "session_id": "user123",
    "message": "I have fever and body pain"
}
```

### Get All Symptoms
```bash
GET /symptoms
```

### Get All Diseases
```bash
GET /diseases
```

## 🤖 AI Components

### 1. Disease Prediction Model
- **Algorithm**: Ensemble of XGBoost + Random Forest
- **Input**: Binary vector of symptoms
- **Output**: Probability distribution over 41 diseases

### 2. Severity Detection
- Rule-based scoring using symptom weights
- Levels: MILD, MODERATE, SEVERE, EMERGENCY

### 3. Symptom Checker Agent
- Conversational interface for symptom collection
- Emergency detection
- Follow-up questions
- Natural language understanding

## 📊 Datasets Used

| File | Description |
|------|-------------|
| `dataset.csv` | Main symptom-disease mapping (4922 records) |
| `symptom_Description.csv` | Disease descriptions |
| `symptom_precaution.csv` | Precautions for each disease |
| `Symptom-severity.csv` | Symptom severity weights |

## 🎯 Model Performance

Expected accuracy: **92-96%** (varies based on training run)

## 🔧 Configuration

Edit `config.py` to modify:
- Model parameters
- Severity thresholds
- Number of predictions (top_k)
- File paths

## 📝 Example Usage

### Python
```python
from disease_predictor import DiseasePredictionModel

# Load model
model = DiseasePredictionModel()
model.load()

# Predict
symptoms = ['fever', 'headache', 'fatigue']
results = model.predict(symptoms, top_k=3)

for r in results:
    print(f"{r['disease']}: {r['confidence_percent']}")
```

### API (curl)
```bash
curl -X POST "http://localhost:8000/predict/symptoms" \
     -H "Content-Type: application/json" \
     -d '{"symptoms": ["fever", "headache"], "top_k": 3}'
```

## ⚠️ Disclaimer

This AI system is for **informational purposes only** and should not replace professional medical advice, diagnosis, or treatment. Always consult a qualified healthcare provider for medical concerns.

## 👥 Team

- Member 1: AI & Data Specialist
- Member 2: Backend & Web Scraping
- Member 3: Frontend & Prescription NLP

