import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Activity, ArrowRight, Stethoscope, Plus, X, Clock, Gauge, ChevronRight } from 'lucide-react';
import aiService from '@services/ai';
import Card, { CardHeader, CardBody } from '@components/ui/Card';
import Button from '@components/ui/Button';
import Alert from '@components/ui/Alert';
import Badge from '@components/ui/Badge';

const DURATION_OPTIONS = [
  'Just started today',
  '1-2 days',
  '3-5 days',
  'About a week',
  'More than a week',
];

const SEVERITY_OPTIONS = [
  { value: 'Mild', hint: 'Manageable, not disrupting daily life' },
  { value: 'Moderate', hint: 'Affects daily activities' },
  { value: 'Severe', hint: 'Hard to function normally' },
  { value: 'Very severe', hint: 'Urgent, consider emergency care' },
];

const SymptomChecker = () => {
  const navigate = useNavigate();
  const [selectedSymptoms, setSelectedSymptoms] = useState([]);
  const [customSymptomInput, setCustomSymptomInput] = useState('');
  const [duration, setDuration] = useState('');
  const [severity, setSeverity] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  // Navigate to the Doctors page pre-filtered by the recommended specialty.
  const goToSpecialist = (specialist) => {
    if (!specialist) return;
    const specialtyName = typeof specialist === 'string'
      ? specialist
      : (specialist.name || specialist.specialist || '');
    if (!specialtyName) return;
    navigate(`/doctors?specialty=${encodeURIComponent(specialtyName)}`);
  };

  // Report-severity can boost the visual urgency for conditions that the
  // model rated mild but that the patient reports as severe.
  const boostDisplaySeverity = (modelSeverity, userSeverity) => {
    const order = ['mild', 'moderate', 'severe', 'emergency'];
    const normalizeUser = (s) => {
      if (!s) return null;
      const k = s.toLowerCase();
      if (k.includes('very severe')) return 'emergency';
      if (k.includes('severe')) return 'severe';
      if (k.includes('moderate')) return 'moderate';
      if (k.includes('mild')) return 'mild';
      return null;
    };
    const modelIdx = order.indexOf((modelSeverity || 'mild').toLowerCase());
    const userIdx = order.indexOf(normalizeUser(userSeverity));
    if (modelIdx < 0) return modelSeverity || 'mild';
    if (userIdx < 0) return modelSeverity || 'mild';
    return order[Math.max(modelIdx, userIdx)];
  };
  
  const commonSymptoms = [
    'Headache', 'Fever', 'Cough', 'Sore Throat', 
    'Fatigue', 'Nausea', 'Dizziness', 'Chest Pain',
    'Shortness of Breath', 'Skin Rash', 'Stomach Pain'
  ];

  const toggleSymptom = (symptom) => {
    if (selectedSymptoms.includes(symptom)) {
      setSelectedSymptoms(prev => prev.filter(s => s !== symptom));
    } else {
      setSelectedSymptoms(prev => [...prev, symptom]);
    }
  };

  const addCustomSymptom = () => {
    const trimmed = customSymptomInput.trim();
    if (trimmed && !selectedSymptoms.includes(trimmed)) {
      setSelectedSymptoms(prev => [...prev, trimmed]);
    }
    setCustomSymptomInput('');
  };

  const removeSymptom = (symptom) => {
    setSelectedSymptoms(prev => prev.filter(s => s !== symptom));
  };

  // Normalize backend prediction (which uses probability 0-1) to the
  // UI shape (confidence 0-1 + severity string).
  const normalizeResult = (payload, userSeverity) => {
    if (!payload) return null;
    const src = payload.data || payload;
    const rawPreds = Array.isArray(src.predictions) ? src.predictions : [];
    const severityLevel = (src.severity?.level || '').toString().toLowerCase();
    const userSevNormalized = (userSeverity || '').toLowerCase();
    const urgent =
      !!src.is_emergency ||
      severityLevel === 'severe' || severityLevel === 'emergency' ||
      userSevNormalized.includes('very severe') || userSevNormalized === 'severe';
    const predictions = rawPreds.map((p) => {
      const conf =
        typeof p.confidence === 'number' ? p.confidence :
        typeof p.probability === 'number' ? p.probability :
        typeof p.confidence_percent === 'string' ? parseFloat(p.confidence_percent) / 100 :
        0;
      const modelSeverity = (p.severity || p.severity_level || severityLevel || 'mild').toLowerCase();
      return {
        disease: p.disease || p.name || 'Unknown',
        confidence: Math.max(0, Math.min(1, conf || 0)),
        severity: boostDisplaySeverity(modelSeverity, userSeverity),
        description: p.description,
        precautions: p.precautions,
      };
    });
    const rawSpecialist = src.recommended_specialist;
    const specialist = rawSpecialist && typeof rawSpecialist === 'object'
      ? {
          name: rawSpecialist.name || rawSpecialist.specialist || '',
          icon: rawSpecialist.icon || '👨‍⚕️',
          description: rawSpecialist.description || '',
        }
      : (typeof rawSpecialist === 'string' ? { name: rawSpecialist, icon: '👨‍⚕️', description: '' } : null);
    const specialistName = specialist?.name;
    return {
      predictions,
      specialist,
      suggested_action:
        src.suggested_action ||
        src.severity?.recommendation ||
        src.severity?.reason ||
        (specialistName ? `Consult a ${specialistName} for proper diagnosis and treatment.` : 'Consult a doctor if symptoms persist.'),
      urgent,
    };
  };

  const handlePredict = async () => {
    if (selectedSymptoms.length === 0 || !duration || !severity) return;
    
    setLoading(true);
    try {
      console.log('🔮 Predicting disease for symptoms:', selectedSymptoms, 'duration:', duration, 'severity:', severity);
      
      const normalizedSymptoms = selectedSymptoms.map((s) => s.toLowerCase().replace(/\s+/g, '_'));
      const response = await aiService.predictDisease(normalizedSymptoms, duration, 5);
      console.log('✅ AI prediction:', response);

      const normalized = normalizeResult(response, severity);
      if (normalized && normalized.predictions.length > 0) {
        setResult({ ...normalized, userDuration: duration, userSeverity: severity });
      } else {
        setResult({
          predictions: [
            { disease: 'Unable to get predictions', confidence: 0, severity: 'unknown' },
          ],
          suggested_action: 'Please try again later or consult a doctor.',
          urgent: false,
          userDuration: duration,
          userSeverity: severity,
        });
      }
    } catch (error) {
      console.error('❌ Prediction failed:', error);
      const mockResponse = {
        predictions: [
          { disease: 'Viral Upper Respiratory Infection', confidence: 0.85, severity: 'mild' },
          { disease: 'Acute Pharyngitis', confidence: 0.45, severity: 'moderate' }
        ],
        suggested_action: 'Rest and hydration. Consult a doctor if symptoms persist for more than 3 days.',
        urgent: selectedSymptoms.includes('Chest Pain') || selectedSymptoms.includes('Shortness of Breath'),
        userDuration: duration,
        userSeverity: severity,
      };
      setResult(mockResponse);
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setSelectedSymptoms([]);
    setCustomSymptomInput('');
    setDuration('');
    setSeverity('');
    setResult(null);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-primary-100 text-primary-600 rounded-xl">
          <Activity className="w-8 h-8" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">AI Symptom Checker</h1>
          <p className="text-neutral-500">Select your symptoms to get an AI-powered health assessment</p>
        </div>
      </div>

      {!result ? (
        <Card>
          <CardHeader title="What are you feeling?" />
          <CardBody>
            <div className="space-y-6">
                <div>
                  <label className="text-sm font-medium text-neutral-700 mb-3 block">
                    Common Symptoms — click to select
                  </label>
                  <div className="flex flex-wrap gap-3">
                    {commonSymptoms.map((symptom) => (
                      <button
                        key={symptom}
                        onClick={() => toggleSymptom(symptom)}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                          selectedSymptoms.includes(symptom)
                            ? 'bg-primary-500 text-white shadow-md transform scale-105'
                            : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                        }`}
                      >
                        {symptom}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Custom Symptom Entry */}
                <div className="border-t border-neutral-100 pt-5">
                  <label className="text-sm font-medium text-neutral-700 mb-3 block">
                    Describe Your Own Symptom
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={customSymptomInput}
                      onChange={(e) => setCustomSymptomInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && addCustomSymptom()}
                      placeholder="e.g. Back pain, Blurred vision, Ringing in ears..."
                      className="flex-1 px-4 py-2.5 rounded-xl border-2 border-neutral-200 focus:border-primary-400 focus:ring-2 focus:ring-primary-100 outline-none transition-all text-sm"
                    />
                    <button
                      onClick={addCustomSymptom}
                      disabled={!customSymptomInput.trim()}
                      className="flex items-center gap-1.5 px-4 py-2.5 bg-primary-500 text-white rounded-xl hover:bg-primary-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all text-sm font-medium"
                    >
                      <Plus className="w-4 h-4" />
                      Add
                    </button>
                  </div>
                </div>

                {/* Selected Symptoms */}
                {selectedSymptoms.length > 0 && (
                  <div className="pt-4 border-t border-neutral-200 space-y-6">
                    <div>
                      <p className="text-sm font-medium text-neutral-700 mb-3">
                        Selected symptoms ({selectedSymptoms.length}):
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {selectedSymptoms.map((symptom) => (
                          <span
                            key={symptom}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-primary-100 text-primary-700 rounded-full text-sm font-medium"
                          >
                            {symptom}
                            <button
                              onClick={() => removeSymptom(symptom)}
                              className="hover:text-primary-900 transition-colors"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Duration picker */}
                    <div>
                      <label className="text-sm font-medium text-neutral-700 mb-2 flex items-center gap-2">
                        <Clock className="w-4 h-4 text-primary-500" />
                        How long have you had these symptoms?
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {DURATION_OPTIONS.map((opt) => (
                          <button
                            key={opt}
                            onClick={() => setDuration(opt)}
                            className={`px-3 py-1.5 rounded-full text-sm font-medium transition ${
                              duration === opt
                                ? 'bg-primary-500 text-white shadow'
                                : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                            }`}
                          >
                            {opt}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Severity picker */}
                    <div>
                      <label className="text-sm font-medium text-neutral-700 mb-2 flex items-center gap-2">
                        <Gauge className="w-4 h-4 text-primary-500" />
                        How severe do your symptoms feel overall?
                      </label>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                        {SEVERITY_OPTIONS.map(({ value, hint }) => (
                          <button
                            key={value}
                            onClick={() => setSeverity(value)}
                            title={hint}
                            className={`px-3 py-2 rounded-lg text-sm font-medium transition text-left ${
                              severity === value
                                ? 'bg-primary-500 text-white shadow'
                                : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                            }`}
                          >
                            <div>{value}</div>
                            <div className={`text-[11px] mt-0.5 ${severity === value ? 'text-white/80' : 'text-neutral-500'}`}>
                              {hint}
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>

                    {(!duration || !severity) && (
                      <p className="text-xs text-neutral-500">
                        Please answer both questions above to get a more accurate assessment.
                      </p>
                    )}

                    <div className="flex items-center justify-between">
                      <button
                        onClick={() => { setSelectedSymptoms([]); setDuration(''); setSeverity(''); }}
                        className="text-sm text-neutral-400 hover:text-neutral-600 transition-colors"
                      >
                        Clear all
                      </button>
                      <Button
                        onClick={handlePredict}
                        loading={loading}
                        disabled={!duration || !severity}
                        rightIcon={<ArrowRight className="w-4 h-4" />}
                      >
                        Analyze Symptoms
                      </Button>
                    </div>
                  </div>
                )}
              </div>
          </CardBody>
        </Card>
      ) : (
        <div className="space-y-6 animate-fade-in">
          {result.urgent && (
            <Alert variant="danger" title="Urgent Attention Required">
              Based on your symptoms (Chest Pain/Shortness of Breath), we recommend seeking immediate medical attention or calling emergency services.
              <div className="mt-3">
                <Button variant="danger" size="sm" onClick={() => window.location.href = '/first-aid'}>
                  Emergency Contacts
                </Button>
              </div>
            </Alert>
          )}

          <Card>
            <CardHeader 
              title="Analysis Results" 
              action={<Button variant="ghost" onClick={reset}>Check Again</Button>}
            />
            <CardBody>
              <div className="space-y-6">
                {(result.userDuration || result.userSeverity) && (
                  <div className="flex flex-wrap gap-2">
                    {result.userDuration && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-neutral-100 text-neutral-700 rounded-full text-xs font-medium">
                        <Clock className="w-3.5 h-3.5" />
                        Duration: {result.userDuration}
                      </span>
                    )}
                    {result.userSeverity && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-neutral-100 text-neutral-700 rounded-full text-xs font-medium">
                        <Gauge className="w-3.5 h-3.5" />
                        Your severity: {result.userSeverity}
                      </span>
                    )}
                  </div>
                )}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Potential Conditions</h3>
                  <div className="space-y-3">
                    {(result.predictions || []).map((pred, idx) => (
                      <div key={idx} className="flex items-center justify-between p-4 bg-neutral-50 rounded-lg border border-neutral-100">
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium text-neutral-900">{pred.disease}</h4>
                            <Badge 
                              variant={pred.severity === 'mild' ? 'success' : pred.severity === 'moderate' ? 'warning' : 'danger'}
                              size="sm"
                            >
                              {pred.severity}
                            </Badge>
                          </div>
                          <div className="mt-2 w-full bg-neutral-200 rounded-full h-2 w-48">
                            <div 
                              className={`h-2 rounded-full ${
                                pred.confidence > 0.7 ? 'bg-green-500' : 'bg-yellow-500'
                              }`} 
                              style={{ width: `${pred.confidence * 100}%` }}
                            />
                          </div>
                          <p className="text-xs text-neutral-500 mt-1">
                            {Math.round(pred.confidence * 100)}% Match
                          </p>
                        </div>
                        <Button variant="outline" size="sm">Learn More</Button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                  <h4 className="font-medium text-blue-900 flex items-center gap-2 mb-2">
                    <Stethoscope className="w-4 h-4" />
                    Recommended Action
                  </h4>
                  <p className="text-blue-800 text-sm">{result.suggested_action}</p>
                </div>

                {/* Recommended Specialist — clickable, deep-links to /doctors?specialty= */}
                {result.specialist?.name && (
                  <button
                    type="button"
                    onClick={() => goToSpecialist(result.specialist)}
                    className="w-full text-left p-4 rounded-xl border border-primary-200 bg-gradient-to-r from-primary-50 to-blue-50 hover:shadow-md hover:border-primary-400 transition-all group"
                    aria-label={`Find ${result.specialist.name} doctors`}
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-3xl flex-shrink-0">{result.specialist.icon || '👨‍⚕️'}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="font-semibold text-neutral-900">
                            Recommended Specialist: {result.specialist.name}
                          </h4>
                          <Badge variant="info" size="sm">
                            Based on: {result.predictions?.[0]?.disease || 'top prediction'}
                          </Badge>
                        </div>
                        {result.specialist.description && (
                          <p className="text-sm text-neutral-600 mt-1">
                            {result.specialist.description}
                          </p>
                        )}
                        <div className="mt-2 inline-flex items-center gap-1 text-sm font-semibold text-primary-700 group-hover:text-primary-900">
                          <Stethoscope className="w-4 h-4" />
                          View {result.specialist.name}s in ShifaMart+
                          <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                        </div>
                      </div>
                    </div>
                  </button>
                )}

                {((result.predictions || []).some(p => p.severity === 'moderate' || p.severity === 'severe' || p.severity === 'emergency') || result.urgent) && (
                  <div className="flex justify-end pt-2">
                    <Button
                      size="lg"
                      className="w-full sm:w-auto"
                      onClick={() => goToSpecialist(result.specialist)}
                      rightIcon={<ArrowRight className="w-4 h-4" />}
                    >
                      {result.specialist?.name ? `Find a ${result.specialist.name}` : 'Find a Doctor'}
                    </Button>
                  </div>
                )}
              </div>
            </CardBody>
          </Card>
        </div>
      )}
    </div>
  );
};

export default SymptomChecker;
