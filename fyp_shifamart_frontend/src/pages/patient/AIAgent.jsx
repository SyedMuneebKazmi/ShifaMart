import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Send, Mic, MicOff, Trash2, AlertTriangle, CheckCircle, 
  Activity, Thermometer, HeadphonesIcon, Stethoscope,
  Heart, Brain, Pill, MapPin, Phone, Clock, ChevronRight
} from 'lucide-react';
import aiService from '@services/ai';
import Card from '@components/ui/Card';
import Button from '@components/ui/Button';
import Badge from '@components/ui/Badge';
import Alert from '@components/ui/Alert';

// Quick symptom buttons
const QUICK_SYMPTOMS = [
  { icon: '🤒', label: 'Fever', symptom: 'fever' },
  { icon: '🤕', label: 'Headache', symptom: 'headache' },
  { icon: '😷', label: 'Cough', symptom: 'cough' },
  { icon: '🤢', label: 'Nausea', symptom: 'nausea' },
  { icon: '😴', label: 'Fatigue', symptom: 'fatigue' },
  { icon: '💪', label: 'Body Ache', symptom: 'body_ache' },
  { icon: '🤮', label: 'Vomiting', symptom: 'vomiting' },
  { icon: '😵', label: 'Dizziness', symptom: 'dizziness' },
  { icon: '🔴', label: 'Skin Rash', symptom: 'skin_rash' },
  { icon: '💔', label: 'Chest Pain', symptom: 'chest_pain' },
  { icon: '😮‍💨', label: 'Breathing', symptom: 'breathlessness' },
  { icon: '🦴', label: 'Joint Pain', symptom: 'joint_pain' },
];

// Suggested prompts
const SUGGESTED_PROMPTS = [
  "I have fever and headache for 2 days",
  "I feel tired and weak",
  "I have stomach pain and nausea",
  "I have skin rash and itching",
];

// Severity colors
const SEVERITY_COLORS = {
  MILD: 'bg-green-100 text-green-800 border-green-200',
  MODERATE: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  SEVERE: 'bg-orange-100 text-orange-800 border-orange-200',
  EMERGENCY: 'bg-red-100 text-red-800 border-red-200',
};

// Convert backend fields (probability 0-1, confidence_percent "29.6%") to 0-100
const getPredictionPercent = (pred) => {
  if (!pred) return 0;
  if (typeof pred.confidence_percent === 'string') {
    const n = parseFloat(pred.confidence_percent);
    if (Number.isFinite(n)) return Math.max(0, Math.min(100, n));
  }
  const raw =
    pred.probability ?? pred.confidence ?? pred.score ?? pred.percentage ?? 0;
  const n = typeof raw === 'string' ? parseFloat(raw) : raw;
  if (!Number.isFinite(n)) return 0;
  // Treat 0-1 as fraction, anything >1 as already-percentage
  const pct = n <= 1 ? n * 100 : n;
  return Math.max(0, Math.min(100, pct));
};

// Severity score from backend is 0-10, convert to 0-100 percentage
const getSeverityPercent = (sev) => {
  if (!sev) return null;
  const raw = sev.score ?? sev.percentage ?? sev.confidence;
  if (raw === null || raw === undefined) return null;
  const n = typeof raw === 'string' ? parseFloat(raw) : raw;
  if (!Number.isFinite(n)) return null;
  // score is 0-10, confidence/percentage may be 0-1 or 0-100
  let pct;
  if (sev.score !== undefined && sev.score !== null) pct = n * 10;
  else if (n <= 1) pct = n * 100;
  else pct = n;
  return Math.max(0, Math.min(100, Math.round(pct)));
};

const AIAgent = () => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [selectedSymptoms, setSelectedSymptoms] = useState([]);
  const [aiStatus, setAiStatus] = useState('checking');
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Deep-link the user to the Doctors page filtered by the AI-recommended
  // specialist. Accepts either a specialist object (from the API) or a name.
  const handleFindSpecialist = (specialist) => {
    if (!specialist) return;
    const name = typeof specialist === 'string'
      ? specialist
      : (specialist.name || '');
    if (!name) return;
    navigate(`/doctors?specialty=${encodeURIComponent(name)}`);
  };

  // Generate session ID
  useEffect(() => {
    const newSessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    setSessionId(newSessionId);
    
    // Add welcome message
    setMessages([{
      id: 1,
      role: 'assistant',
      content: "Hello! I'm your **ShifaMart+ AI Health Assistant**. 👋\n\nI'm here to help you understand your symptoms and provide guidance.\n\n**Please describe your symptoms in your own words.** For example:\n- \"I have had fever and headache for 2 days\"\n- \"I feel tired and have body aches\"",
      timestamp: new Date(),
      type: 'welcome'
    }]);

    // Check AI health
    checkAIHealth();
  }, []);

  // Check AI service health
  const checkAIHealth = async () => {
    try {
      await aiService.checkHealth();
      setAiStatus('ready');
    } catch (error) {
      console.error('AI health check failed:', error);
      setAiStatus('offline');
    }
  };

  // Scroll to bottom
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Toggle symptom selection
  const toggleSymptom = (symptom) => {
    setSelectedSymptoms(prev => 
      prev.includes(symptom) 
        ? prev.filter(s => s !== symptom)
        : [...prev, symptom]
    );
  };

  // Send message
  const handleSend = async (messageText = inputValue) => {
    if (!messageText.trim() && selectedSymptoms.length === 0) return;

    // Combine text with selected symptoms
    let fullMessage = messageText.trim();
    if (selectedSymptoms.length > 0) {
      const symptomText = selectedSymptoms.map(s => s.replace('_', ' ')).join(', ');
      fullMessage = fullMessage 
        ? `${fullMessage}. I also have: ${symptomText}`
        : `I have the following symptoms: ${symptomText}`;
    }

    const userMsg = {
      id: Date.now(),
      role: 'user',
      content: fullMessage,
      timestamp: new Date(),
      symptoms: [...selectedSymptoms]
    };

    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setSelectedSymptoms([]);
    setLoading(true);

    try {
      const response = await aiService.chat(fullMessage, sessionId);
      
      const aiData = response.data || response;
      
      const aiMsg = {
        id: Date.now() + 1,
        role: 'assistant',
        content: aiData.response || "I'm processing your request...",
        timestamp: new Date(),
        state: aiData.state,
        suggestions: aiData.suggestions || [],
        predictions: aiData.predictions,
        severity: aiData.severity,
        firstAid: aiData.first_aid,
        specialist: aiData.recommended_specialist,
        isEmergency: aiData.is_emergency,
        collectedSymptoms: aiData.collected_symptoms,
        googleMapsUrl: response.googleMapsUrl,
        marhamUrl: response.marhamUrl,
      };
      
      setMessages(prev => [...prev, aiMsg]);
    } catch (error) {
      console.error('AI Chat error:', error);
      
      const errorMsg = {
        id: Date.now() + 1,
        role: 'assistant',
        content: "I'm sorry, I'm having trouble connecting right now. Please try again in a moment.",
        timestamp: new Date(),
        isError: true
      };
      
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  // Handle suggestion click
  const handleSuggestionClick = (suggestion) => {
    handleSend(suggestion);
  };

  // Clear chat
  const clearChat = async () => {
    if (sessionId) {
      try {
        await aiService.endSession(sessionId);
      } catch (e) {
        console.warn('Failed to end session:', e);
      }
    }
    
    const newSessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    setSessionId(newSessionId);
    setSelectedSymptoms([]);
    setMessages([{
      id: 1,
      role: 'assistant',
      content: "Chat cleared! 🔄\n\nHow can I help you today? Please describe your symptoms.",
      timestamp: new Date(),
      type: 'welcome'
    }]);
  };

  // Analyze selected symptoms
  const analyzeSymptoms = async () => {
    if (selectedSymptoms.length === 0) return;
    handleSend('');
  };

  // Render message content
  const renderMessageContent = (msg) => {
    if (msg.role === 'user') {
      return (
        <div className="bg-primary-500 text-white rounded-2xl rounded-br-md px-4 py-3 max-w-[80%] ml-auto">
          <p className="whitespace-pre-wrap">{msg.content}</p>
          {msg.symptoms && msg.symptoms.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {msg.symptoms.map((s, i) => (
                <span key={i} className="text-xs bg-white/20 px-2 py-0.5 rounded-full">
                  {s.replace('_', ' ')}
                </span>
              ))}
            </div>
          )}
        </div>
      );
    }

    return (
      <div className="max-w-[85%]">
        <div className={`bg-neutral-100 rounded-2xl rounded-bl-md px-4 py-3 ${msg.isError ? 'bg-red-50 border border-red-200' : ''}`}>
          {/* Main response */}
          <p className="whitespace-pre-wrap text-neutral-800" 
             dangerouslySetInnerHTML={{ __html: msg.content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} 
          />

          {/* Emergency Alert */}
          {msg.isEmergency && (
            <div className="mt-3 p-3 bg-red-100 border border-red-300 rounded-lg flex items-start gap-2">
              <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-red-800">Emergency Detected!</p>
                <p className="text-sm text-red-700">Please seek immediate medical attention or call emergency services.</p>
              </div>
            </div>
          )}

          {/* Severity Badge */}
          {msg.severity && (() => {
            const sevPct = getSeverityPercent(msg.severity);
            const reason = msg.severity.recommendation || msg.severity.reason;
            return (
              <div className={`mt-3 p-3 rounded-lg border ${SEVERITY_COLORS[msg.severity.level] || SEVERITY_COLORS.MILD}`}>
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4" />
                  <span className="font-medium">Severity: {msg.severity.level}</span>
                  {sevPct !== null && (
                    <span className="text-sm">({sevPct}%)</span>
                  )}
                </div>
                {reason && (
                  <p className="text-sm mt-1">{reason}</p>
                )}
              </div>
            );
          })()}

          {/* Predictions */}
          {msg.predictions && msg.predictions.length > 0 && (
            <div className="mt-3 space-y-2">
              <p className="font-medium text-neutral-700 flex items-center gap-2">
                <Stethoscope className="w-4 h-4" />
                Possible Conditions:
              </p>
              {msg.predictions.slice(0, 3).map((pred, i) => {
                const pct = getPredictionPercent(pred);
                const isHigh = pct >= 70;
                return (
                  <div key={i} className="bg-white p-2 rounded-lg border border-neutral-200">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-neutral-800">{pred.disease}</span>
                      <Badge variant={isHigh ? 'success' : 'warning'} size="sm">
                        {pct.toFixed(1)}%
                      </Badge>
                    </div>
                    <div className="mt-1 w-full bg-neutral-200 rounded-full h-1.5">
                      <div
                        className={`h-1.5 rounded-full ${isHigh ? 'bg-green-500' : 'bg-yellow-500'}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Specialist Recommendation — clickable, deep-links to /doctors?specialty= */}
          {msg.specialist && (() => {
            const specName = typeof msg.specialist === 'string'
              ? msg.specialist
              : (msg.specialist.name || 'Specialist');
            const specDesc = typeof msg.specialist === 'object'
              ? msg.specialist.description
              : null;
            const specIcon = typeof msg.specialist === 'object'
              ? msg.specialist.icon
              : null;

            return (
              <div className="mt-3 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg">
                <button
                  type="button"
                  onClick={() => handleFindSpecialist(msg.specialist)}
                  className="w-full text-left group"
                  aria-label={`Find ${specName} doctors`}
                >
                  <p className="font-medium text-blue-800 flex items-center gap-2">
                    <HeadphonesIcon className="w-4 h-4" />
                    Recommended Specialist:&nbsp;
                    <span className="font-semibold flex items-center gap-1">
                      {specIcon && <span>{specIcon}</span>}
                      {specName}
                    </span>
                  </p>
                  {specDesc && (
                    <p className="text-sm text-blue-700 mt-1">{specDesc}</p>
                  )}
                  <div className="mt-2 inline-flex items-center gap-1 text-sm font-semibold text-blue-700 group-hover:text-blue-900">
                    <Stethoscope className="w-4 h-4" />
                    View {specName}s in ShifaMart+
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </button>

                {msg.googleMapsUrl && (
                  <a
                    href={msg.googleMapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 text-sm text-blue-600 hover:underline flex items-center gap-1"
                  >
                    <MapPin className="w-3 h-3" />
                    Or find nearby on Google Maps
                  </a>
                )}
              </div>
            );
          })()}

          {/* First Aid */}
          {msg.firstAid && (
            <div className="mt-3 p-3 bg-orange-50 border border-orange-200 rounded-lg">
              <p className="font-medium text-orange-800 flex items-center gap-2">
                <Heart className="w-4 h-4" />
                First Aid Instructions
              </p>
              {msg.firstAid.steps && (
                <ol className="text-sm text-orange-700 mt-2 list-decimal list-inside space-y-1">
                  {msg.firstAid.steps.slice(0, 5).map((step, i) => (
                    <li key={i}>{step}</li>
                  ))}
                </ol>
              )}
            </div>
          )}
        </div>

        {/* Suggestions */}
        {msg.suggestions && msg.suggestions.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {msg.suggestions.map((suggestion, i) => (
              <button
                key={i}
                onClick={() => handleSuggestionClick(suggestion)}
                className="text-sm px-3 py-1.5 bg-white border border-neutral-300 rounded-full hover:bg-neutral-50 hover:border-primary-300 transition-colors"
              >
                {suggestion}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary-100 text-primary-600 rounded-xl">
            <Brain className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-neutral-900">AI Health Assistant</h1>
            <p className="text-sm text-neutral-500">Powered by ShifaMart+ AI</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          {/* AI Status */}
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm ${
            aiStatus === 'ready' ? 'bg-green-100 text-green-700' :
            aiStatus === 'offline' ? 'bg-red-100 text-red-700' :
            'bg-yellow-100 text-yellow-700'
          }`}>
            <div className={`w-2 h-2 rounded-full ${
              aiStatus === 'ready' ? 'bg-green-500 animate-pulse' :
              aiStatus === 'offline' ? 'bg-red-500' :
              'bg-yellow-500 animate-pulse'
            }`} />
            {aiStatus === 'ready' ? 'AI Ready' : aiStatus === 'offline' ? 'AI Offline' : 'Checking...'}
          </div>
          
          <Button variant="outline" size="sm" onClick={clearChat}>
            <Trash2 className="w-4 h-4 mr-1" />
            Clear Chat
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex gap-4 min-h-0">
        {/* Symptom Sidebar */}
        <div className="w-64 flex-shrink-0 bg-white rounded-xl border border-neutral-200 p-4 overflow-y-auto">
          <h3 className="font-semibold text-neutral-800 mb-3 flex items-center gap-2">
            <Thermometer className="w-4 h-4" />
            Quick Symptoms
          </h3>
          <div className="grid grid-cols-2 gap-2">
            {QUICK_SYMPTOMS.map((item) => (
              <button
                key={item.symptom}
                onClick={() => toggleSymptom(item.symptom)}
                className={`p-2 text-xs rounded-lg border transition-all ${
                  selectedSymptoms.includes(item.symptom)
                    ? 'bg-primary-100 border-primary-300 text-primary-700'
                    : 'bg-neutral-50 border-neutral-200 hover:border-primary-200'
                }`}
              >
                <span className="text-lg">{item.icon}</span>
                <p className="mt-1">{item.label}</p>
              </button>
            ))}
          </div>
          
          {selectedSymptoms.length > 0 && (
            <Button 
              className="w-full mt-4" 
              onClick={analyzeSymptoms}
              disabled={loading}
            >
              Analyze ({selectedSymptoms.length})
            </Button>
          )}
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col bg-white rounded-xl border border-neutral-200 overflow-hidden">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg) => (
              <div 
                key={msg.id} 
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {renderMessageContent(msg)}
              </div>
            ))}
            
            {loading && (
              <div className="flex justify-start">
                <div className="bg-neutral-100 rounded-2xl rounded-bl-md px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-primary-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="w-2 h-2 bg-primary-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="w-2 h-2 bg-primary-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                    <span className="text-sm text-neutral-500">AI is thinking...</span>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Suggested Prompts */}
          {messages.length <= 1 && (
            <div className="px-4 pb-2">
              <p className="text-xs text-neutral-500 mb-2">Try these:</p>
              <div className="flex flex-wrap gap-2">
                {SUGGESTED_PROMPTS.map((prompt, i) => (
                  <button
                    key={i}
                    onClick={() => handleSend(prompt)}
                    className="text-sm px-3 py-1.5 bg-neutral-100 rounded-full hover:bg-primary-100 hover:text-primary-700 transition-colors"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input Area */}
          <div className="p-4 border-t border-neutral-200 bg-neutral-50">
            <div className="flex items-center gap-2">
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && !loading && handleSend()}
                placeholder="Describe your symptoms..."
                disabled={loading || aiStatus === 'offline'}
                className="flex-1 bg-white border border-neutral-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:bg-neutral-100"
              />
              <Button 
                onClick={() => handleSend()} 
                disabled={(!inputValue.trim() && selectedSymptoms.length === 0) || loading || aiStatus === 'offline'}
                className="!p-3"
              >
                <Send className="w-5 h-5" />
              </Button>
            </div>
            
            <p className="text-xs text-neutral-400 mt-2 text-center">
              ⚠️ This is for informational purposes only and does not replace professional medical advice.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIAgent;
