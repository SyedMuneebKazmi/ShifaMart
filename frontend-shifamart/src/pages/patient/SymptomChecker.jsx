import { useState } from 'react';
import { Activity, AlertTriangle, ArrowRight, CheckCircle, Stethoscope } from 'lucide-react';
import aiService from '@services/ai';
import Card, { CardHeader, CardBody } from '@components/ui/Card';
import Button from '@components/ui/Button';
import Alert from '@components/ui/Alert';
import Badge from '@components/ui/Badge';

const SymptomChecker = () => {
  const [selectedSymptoms, setSelectedSymptoms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  
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

  const handlePredict = async () => {
    if (selectedSymptoms.length === 0) return;
    
    setLoading(true);
    try {
      // Mock API call
      // const response = await aiService.predictDisease(selectedSymptoms);
      
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Mock response based on inputs
      const mockResponse = {
        predictions: [
          { disease: 'Viral Upper Respiratory Infection', confidence: 0.85, severity: 'mild' },
          { disease: 'Acute Pharyngitis', confidence: 0.45, severity: 'moderate' }
        ],
        suggested_action: 'Rest and hydration. Consult a doctor if symptoms persist for more than 3 days.',
        urgent: selectedSymptoms.includes('Chest Pain') || selectedSymptoms.includes('Shortness of Breath')
      };
      
      setResult(mockResponse);
    } catch (error) {
      console.error('Prediction failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setSelectedSymptoms([]);
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
                  Common Symptoms
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

              {selectedSymptoms.length > 0 && (
                <div className="pt-4 border-t border-neutral-200">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-neutral-500">
                      {selectedSymptoms.length} symptoms selected
                    </p>
                    <Button 
                      onClick={handlePredict} 
                      loading={loading}
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
                <div>
                  <h3 className="text-lg font-semibold mb-4">Potential Conditions</h3>
                  <div className="space-y-3">
                    {result.predictions.map((pred, idx) => (
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

                {(result.predictions.some(p => p.severity === 'moderate' || p.severity === 'high') || result.urgent) && (
                  <div className="flex justify-end pt-2">
                    <Button size="lg" className="w-full sm:w-auto">
                      Escalate to Doctor
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
