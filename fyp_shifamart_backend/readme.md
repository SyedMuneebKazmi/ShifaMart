ShifaMart+ Healthcare AI - Frontend Developer Guide
👨‍💻 For Frontend (React) Developer
📋 Quick Overview
You're building a React frontend that connects to a Node.js backend (which I've already built). The Node.js backend then talks to a Python AI API for medical analysis.

🎯 Your Job:
Build React components that:

Authenticate users (login/register)

Chat with AI doctor

Show symptom analysis results

Display health records

Handle emergency situations

🔗 API Flow (Simple Version)
text
Your React App → Node.js Backend → Python AI API
      ↓                ↓                ↓
  (UI/State)    (Auth/Database)   (AI/ML Processing)
🚀 5-Minute Setup
1. Start Backend Services First
bash
# Terminal 1: Start Python AI API (Already running on port 8000)
cd ai_agent
python mern_api.py

# Terminal 2: Start Node.js Backend (Already running on port 5000)
cd backend
node server.js
2. Create React App
bash
npx create-react-app frontend
cd frontend
npm install axios react-router-dom
3. Environment Variables (.env)
env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_AI_URL=http://localhost:8000/api
📞 API Endpoints You'll Use
Authentication
javascript
POST   /api/auth/register    // Register new user
POST   /api/auth/login       // Login user
AI Services (Most Important!)
javascript
POST   /api/ai/chat          // Chat with AI doctor
POST   /api/ai/analyze       // Quick symptom check
GET    /api/ai/symptoms      // Get all symptoms list
GET    /api/ai/diseases      // Get all diseases list
User Management
javascript
GET    /api/users/profile    // Get user info
PUT    /api/users/profile    // Update profile
GET    /api/chat/sessions    // Get chat history