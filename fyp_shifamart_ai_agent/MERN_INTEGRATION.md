# ShifaMart+ AI Agent - MERN Integration Guide

This guide explains how to integrate the ShifaMart+ AI Agent with your MERN (MongoDB, Express, React, Node.js) application.

## Quick Start

### 1. Setup Python Backend

```bash
cd ai_agent

# Install Python dependencies
pip install -r requirements.txt

# Train the models (first time only - takes ~2-3 minutes)
python train_fast.py

# Start the API server
python mern_api.py
```

The API server will start at `http://localhost:8000`

### 2. Test the API

Open your browser and go to:
- **Interactive API Docs:** http://localhost:8000/docs
- **Health Check:** http://localhost:8000/api/health

---

## API Endpoints

### Health Check
```
GET /api/health
```
Use this to verify the API is running before making other requests.

**Response:**
```json
{
  "status": "ok",
  "model_loaded": true,
  "symptoms_count": 132,
  "diseases_count": 42
}
```

---

### Chat (Main Conversational AI)
```
POST /api/chat
```
This is the **primary endpoint** for symptom checking. It maintains conversation state.

**Request Body:**
```json
{
  "session_id": "user_123_session_456",
  "message": "I have fever and headache for 2 days"
}
```

**Response:**
```json
{
  "response": "I've noted: **Fever, Headache**\n\nDo you have any other symptoms?",
  "state": "collecting_symptoms",
  "suggestions": ["I also have chills", "I feel tired", "That's all"],
  "collected_symptoms": ["fever", "headache"],
  "predictions": null,
  "severity": null,
  "is_emergency": false,
  "recommended_specialist": null
}
```

**Important Notes:**
- Generate a unique `session_id` for each user (e.g., `${userId}_${Date.now()}`)
- The conversation is stateful - keep using the same session_id for a user's session
- Delete session when user logs out using `DELETE /api/chat/{session_id}`

---

### Quick Analysis (Stateless)
```
POST /api/analyze
```
One-shot symptom analysis from natural language text. No session required.

**Request Body:**
```json
{
  "text": "I have been feeling tired with headaches and fever for 3 days",
  "top_k": 5
}
```

**Response:**
```json
{
  "success": true,
  "extracted_symptoms": ["fatigue", "headache", "fever"],
  "duration": "3 days",
  "predictions": [
    {
      "disease": "Flu",
      "probability": 0.87,
      "confidence_percent": "87%",
      "description": "Influenza is a viral infection...",
      "precautions": ["rest", "drink fluids", "take medication"],
      "severity_level": "MODERATE"
    }
  ],
  "severity": {
    "level": "MODERATE",
    "score": 4.5,
    "is_emergency": false
  },
  "recommended_specialist": {
    "key": "general_physician",
    "name": "General Physician",
    "description": "Primary care doctor",
    "icon": "👨‍⚕️"
  }
}
```

---

### Direct Prediction
```
POST /api/predict
```
Get predictions from a list of symptoms (when you've already extracted symptoms).

**Request Body:**
```json
{
  "symptoms": ["fever", "headache", "fatigue"],
  "duration": "3 days",
  "top_k": 5
}
```

---

### Severity Check
```
POST /api/severity
```
Get severity assessment for symptoms.

**Request Body:**
```json
{
  "symptoms": ["chest_pain", "breathlessness"],
  "duration": "1 hour"
}
```

**Response:**
```json
{
  "success": true,
  "level": "EMERGENCY",
  "score": 10.0,
  "confidence": 0.95,
  "reason": "Dangerous symptom combination detected",
  "is_emergency": true
}
```

---

### First Aid
```
POST /api/first-aid
```
Get first aid instructions.

**Request Body:**
```json
{
  "symptoms": ["chest_pain", "breathlessness"]
}
```

---

### Reference Data
```
GET /api/symptoms    # Get all known symptoms
GET /api/diseases    # Get all known diseases
```

---

## Express.js Integration Examples

### Setup in Express Backend

```javascript
// backend/services/aiService.js

const axios = require('axios');

const AI_API_URL = process.env.AI_API_URL || 'http://localhost:8000';

class AIService {
  // Health check
  async checkHealth() {
    const response = await axios.get(`${AI_API_URL}/api/health`);
    return response.data;
  }

  // Chat with AI
  async chat(sessionId, message) {
    const response = await axios.post(`${AI_API_URL}/api/chat`, {
      session_id: sessionId,
      message: message
    });
    return response.data;
  }

  // Quick analysis
  async analyze(text) {
    const response = await axios.post(`${AI_API_URL}/api/analyze`, {
      text: text,
      top_k: 5
    });
    return response.data;
  }

  // Get severity
  async checkSeverity(symptoms, duration = null) {
    const response = await axios.post(`${AI_API_URL}/api/severity`, {
      symptoms: symptoms,
      duration: duration
    });
    return response.data;
  }

  // End session
  async endSession(sessionId) {
    const response = await axios.delete(`${AI_API_URL}/api/chat/${sessionId}`);
    return response.data;
  }

  // Get all symptoms (for autocomplete)
  async getAllSymptoms() {
    const response = await axios.get(`${AI_API_URL}/api/symptoms`);
    return response.data;
  }
}

module.exports = new AIService();
```

### Express Routes

```javascript
// backend/routes/symptomChecker.js

const express = require('express');
const router = express.Router();
const aiService = require('../services/aiService');

// Health check
router.get('/health', async (req, res) => {
  try {
    const health = await aiService.checkHealth();
    res.json(health);
  } catch (error) {
    res.status(503).json({ error: 'AI service unavailable', details: error.message });
  }
});

// Chat endpoint
router.post('/chat', async (req, res) => {
  try {
    const { sessionId, message } = req.body;
    
    // Generate session ID if not provided
    const session = sessionId || `${req.user?._id || 'guest'}_${Date.now()}`;
    
    const response = await aiService.chat(session, message);
    
    // If emergency, you might want to log or notify
    if (response.is_emergency) {
      console.log(`⚠️ EMERGENCY detected for session: ${session}`);
      // Optional: Save to database, send notification, etc.
    }
    
    res.json({ ...response, sessionId: session });
  } catch (error) {
    res.status(500).json({ error: 'AI chat error', details: error.message });
  }
});

// Quick analyze
router.post('/analyze', async (req, res) => {
  try {
    const { text } = req.body;
    const response = await aiService.analyze(text);
    res.json(response);
  } catch (error) {
    res.status(500).json({ error: 'Analysis error', details: error.message });
  }
});

// End session
router.delete('/chat/:sessionId', async (req, res) => {
  try {
    const response = await aiService.endSession(req.params.sessionId);
    res.json(response);
  } catch (error) {
    res.status(500).json({ error: 'Error ending session', details: error.message });
  }
});

// Get symptoms for autocomplete
router.get('/symptoms', async (req, res) => {
  try {
    const response = await aiService.getAllSymptoms();
    res.json(response);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching symptoms', details: error.message });
  }
});

module.exports = router;
```

### Use in Express App

```javascript
// backend/app.js

const express = require('express');
const symptomCheckerRoutes = require('./routes/symptomChecker');

const app = express();
app.use(express.json());

// Mount the routes
app.use('/api/symptom-checker', symptomCheckerRoutes);

// Your routes will be available at:
// POST /api/symptom-checker/chat
// POST /api/symptom-checker/analyze
// GET  /api/symptom-checker/symptoms
// etc.
```

---

## React Frontend Example

```jsx
// src/components/SymptomChecker.jsx

import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';

const SymptomChecker = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [sessionId] = useState(() => `session_${Date.now()}`);
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  
  const messagesEndRef = useRef(null);
  
  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  // Start conversation
  useEffect(() => {
    sendMessage('');
  }, []);
  
  const sendMessage = async (text) => {
    if (text.trim()) {
      setMessages(prev => [...prev, { type: 'user', text }]);
    }
    
    setLoading(true);
    setInput('');
    
    try {
      const response = await axios.post('/api/symptom-checker/chat', {
        sessionId,
        message: text
      });
      
      const data = response.data;
      
      setMessages(prev => [...prev, {
        type: 'bot',
        text: data.response,
        predictions: data.predictions,
        severity: data.severity,
        isEmergency: data.is_emergency,
        specialist: data.recommended_specialist,
        firstAid: data.first_aid
      }]);
      
      setSuggestions(data.suggestions || []);
      
    } catch (error) {
      setMessages(prev => [...prev, {
        type: 'error',
        text: 'Sorry, something went wrong. Please try again.'
      }]);
    }
    
    setLoading(false);
  };
  
  const handleSuggestionClick = (suggestion) => {
    sendMessage(suggestion);
  };
  
  return (
    <div className="symptom-checker">
      <div className="messages">
        {messages.map((msg, i) => (
          <div key={i} className={`message ${msg.type}`}>
            <div dangerouslySetInnerHTML={{ __html: formatMessage(msg.text) }} />
            
            {msg.isEmergency && (
              <div className="emergency-alert">
                🚨 This requires immediate medical attention!
                <a href="tel:1122">Call Rescue: 1122</a>
              </div>
            )}
            
            {msg.specialist && (
              <div className="specialist-info">
                {msg.specialist.icon} Recommended: {msg.specialist.name}
              </div>
            )}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      
      {suggestions.length > 0 && (
        <div className="suggestions">
          {suggestions.map((s, i) => (
            <button key={i} onClick={() => handleSuggestionClick(s)}>
              {s}
            </button>
          ))}
        </div>
      )}
      
      <form onSubmit={(e) => { e.preventDefault(); sendMessage(input); }}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Describe your symptoms..."
          disabled={loading}
        />
        <button type="submit" disabled={loading || !input.trim()}>
          {loading ? 'Thinking...' : 'Send'}
        </button>
      </form>
    </div>
  );
};

// Helper to format markdown-style text
const formatMessage = (text) => {
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\n/g, '<br>');
};

export default SymptomChecker;
```

---

## Environment Variables

Add to your `.env` file:

```env
# Python AI API URL
AI_API_URL=http://localhost:8000

# For production, use your deployed Python API URL
# AI_API_URL=https://your-ai-api.herokuapp.com
```

---

## Running Both Services

### Development (Two terminals)

**Terminal 1 - Python AI API:**
```bash
cd ai_agent
python mern_api.py
```

**Terminal 2 - Node.js/Express:**
```bash
cd backend
npm run dev
```

### Production

Consider using:
- **Docker Compose** to run both services
- **PM2** for Node.js process management
- **Gunicorn/Uvicorn** for Python production server

Example production command for Python:
```bash
uvicorn mern_api:app --host 0.0.0.0 --port 8000 --workers 4
```

---

## Key Response Fields

| Field | Type | Description |
|-------|------|-------------|
| `response` | string | AI's text response (may contain markdown) |
| `state` | string | Current conversation state |
| `suggestions` | array | Quick reply options |
| `collected_symptoms` | array | Symptoms identified so far |
| `predictions` | array | Disease predictions (after analysis) |
| `severity` | object | Severity assessment |
| `is_emergency` | boolean | True if emergency detected |
| `first_aid` | object | First aid instructions (if emergency) |
| `recommended_specialist` | object | Doctor type recommendation |
| `google_maps_url` | string | URL to find doctors (if city provided) |

---

## Severity Levels

| Level | Description | Action Required |
|-------|-------------|-----------------|
| `MILD` | Minor symptoms | Home care, rest |
| `MODERATE` | Notable symptoms | Monitor, consider doctor visit |
| `SEVERE` | Serious symptoms | See doctor soon |
| `EMERGENCY` | Critical symptoms | Immediate medical attention |

---

## Error Handling

The API returns standard HTTP status codes:
- `200` - Success
- `400` - Bad request (invalid input)
- `500` - Server error
- `503` - Service unavailable (models not loaded)

Always wrap API calls in try-catch and handle errors gracefully.

---

## Need Help?

1. Check API health: `GET http://localhost:8000/api/health`
2. View API docs: `http://localhost:8000/docs`
3. Make sure models are trained: `python train_fast.py`
4. Check console logs for errors

