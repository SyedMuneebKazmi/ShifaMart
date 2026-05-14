import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText, Check, AlertCircle, Trash2, Edit2, Search, Pill } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Card, { CardHeader, CardBody } from '@components/ui/Card';
import Button from '@components/ui/Button';
import Alert from '@components/ui/Alert';
import { formatFileSize } from '@utils/validators';
import Tesseract from 'tesseract.js';

// Simple in-memory dictionary of medicine names to check against extracted text
const MEDICINE_DICTIONARY = [
  'panadol', 'paracetamol', 'augmentin', 'amoxicillin', 'brufen', 'ibuprofen',
  'cetirizine', 'claritin', 'azithromycin', 'flagyl', 'omeprazole', 'esomoc',
  'aspirin', 'disprin', 'voltaren', 'diclofenac', 'metformin', 'glucophage',
  'atorvastatin', 'lipitor', 'amlodipine', 'norvasc', 'losartan', 'cozaar',
  'cefspan', 'moxifloxacin', 'levofloxacin', 'doxycycline', 'loperamide'
];

const PrescriptionUpload = () => {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  const [medicines, setMedicines] = useState([]);
  const [analysisError, setAnalysisError] = useState(null);

  const onDrop = useCallback((acceptedFiles) => {
    const selectedFile = acceptedFiles[0];
    if (selectedFile) {
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
      setResult(null);
      setMedicines([]);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png']
    },
    maxFiles: 1,
    multiple: false
  });

  const handleAnalyze = async () => {
    if (!file) return;
    
    setAnalyzing(true);
    setAnalysisError(null);
    try {
      // Run client-side OCR using Tesseract.js
      const { data } = await Tesseract.recognize(file, 'eng', { logger: () => {} });
      const extractedText = (data?.text || '').trim();
      const confidence = data?.confidence ? data.confidence / 100 : 0.85;

      // Match against dictionary (case-insensitive)
      const lowerText = extractedText.toLowerCase();
      const matchedNames = MEDICINE_DICTIONARY.filter((name) => lowerText.includes(name));

      const detectedMeds = matchedNames.map((name, idx) => ({
        id: idx + 1,
        name: name.charAt(0).toUpperCase() + name.slice(1),
        dosage: '—',
        quantity: '—',
        type: 'Detected',
        inStock: true
      }));

      setMedicines(detectedMeds);
      setResult({
        text: extractedText || 'No text detected.',
        confidence,
        matches: matchedNames
      });
    } catch (error) {
      console.error('Analysis failed:', error);
      setAnalysisError('Could not extract text from the image. Please try another photo or retake a clearer picture.');
    } finally {
      setAnalyzing(false);
    }
  };

  const removeFile = () => {
    setFile(null);
    setPreview(null);
    setResult(null);
    setMedicines([]);
    setAnalysisError(null);
  };

  const handleComparePrices = () => {
    // Navigate to comparison page with medicines
    navigate('/patient/medicines', { state: { medicines } });
  };

  const removeMedicine = (id) => {
    setMedicines((prev) => prev.filter((m) => m.id !== id));
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-accent-100 text-accent-600 rounded-xl">
          <Upload className="w-8 h-8" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Upload Prescription</h1>
          <p className="text-neutral-500">Scan your prescription to find medicines and compare prices</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upload Section */}
        <div className="space-y-6">
          <Card>
            <CardHeader title="Prescription Image" />
            <CardBody>
              {!file ? (
                <div 
                  {...getRootProps()} 
                  className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
                    isDragActive ? 'border-primary-500 bg-primary-50' : 'border-neutral-300 hover:border-primary-400 hover:bg-neutral-50'
                  }`}
                >
                  <input {...getInputProps()} />
                  <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-4 text-neutral-400">
                    <Upload className="w-8 h-8" />
                  </div>
                  <h3 className="text-lg font-medium text-neutral-900 mb-1">
                    Click to upload or drag and drop
                  </h3>
                  <p className="text-sm text-neutral-500 mb-4">
                    SVG, PNG, JPG or GIF (max. 5MB)
                  </p>
                  <Button variant="outline" size="sm">Select File</Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="relative rounded-lg overflow-hidden border border-neutral-200 bg-neutral-50">
                    <img 
                      src={preview} 
                      alt="Prescription preview" 
                      className="w-full h-64 object-contain"
                    />
                    <button 
                      onClick={removeFile}
                      className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-md text-danger hover:bg-red-50 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg border border-neutral-200">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-white rounded border border-neutral-200">
                        <FileText className="w-5 h-5 text-primary-500" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-neutral-900 truncate max-w-[200px]">
                          {file.name}
                        </p>
                        <p className="text-xs text-neutral-500">
                          {formatFileSize(file.size)}
                        </p>
                      </div>
                    </div>
                    {!result && (
                      <Button 
                        onClick={handleAnalyze} 
                        loading={analyzing}
                        size="sm"
                      >
                        Analyze Image
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </CardBody>
          </Card>

          {result && (
            <Card>
              <CardHeader title="Extracted Text" />
              <CardBody>
                <div className="p-4 bg-neutral-50 rounded-lg border border-neutral-200 font-mono text-sm text-neutral-700 whitespace-pre-wrap">
                  {result.text}
                </div>
                <div className="mt-2 flex items-center gap-2 text-xs text-neutral-500">
                  <Check className="w-3 h-3 text-success" />
                  <span>AI Confidence: {Math.round(result.confidence * 100)}%</span>
                </div>
                {result.matches && (
                  <div className="mt-3 text-sm">
                    {result.matches.length > 0 ? (
                      <div className="flex items-center gap-2 text-success">
                        <Check className="w-4 h-4" />
                        <span>
                          Found {result.matches.length} medicine{result.matches.length > 1 ? 's' : ''} from stock dictionary.
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-neutral-600">
                        <AlertCircle className="w-4 h-4" />
                        <span>No known medicine names detected in the image.</span>
                      </div>
                    )}
                  </div>
                )}
              </CardBody>
            </Card>
          )}
          {analysisError && (
            <Alert variant="danger">
              {analysisError}
            </Alert>
          )}
        </div>

        {/* Results Section */}
        <div className="space-y-6">
          {medicines.length > 0 ? (
            <Card className="h-full">
              <CardHeader
                title="Detected Medicines"
                action={
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setMedicines([])}
                    leftIcon={<Edit2 className="w-4 h-4" />}
                  >
                    Clear List
                  </Button>
                }
              />
              <CardBody>
                <div className="space-y-4">
                  <Alert variant="info">
                    Please verify the medicines and dosages below before proceeding.
                  </Alert>

                  <div className="space-y-3">
                    {medicines.map((med) => (
                      <div key={med.id} className="flex items-center justify-between p-4 bg-white rounded-lg border border-neutral-200 shadow-sm">
                        <div>
                          <h4 className="font-medium text-neutral-900">{med.name}</h4>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs px-2 py-0.5 bg-neutral-100 rounded text-neutral-600">
                              {med.dosage}
                            </span>
                            <span className="text-xs px-2 py-0.5 bg-neutral-100 rounded text-neutral-600">
                              Qty: {med.quantity}
                            </span>
                            <span className="text-xs text-neutral-400">• {med.type}</span>
                            <span className={`text-xs px-2 py-0.5 rounded ${med.inStock ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                              {med.inStock ? 'Available in stock' : 'Out of stock'}
                            </span>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-neutral-400 hover:text-red-500"
                          onClick={() => removeMedicine(med.id)}
                          aria-label={`Remove ${med.name}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>

                  <div className="pt-4 border-t border-neutral-200 mt-4">
                    <Button 
                      className="w-full" 
                      size="lg"
                      onClick={handleComparePrices}
                      leftIcon={<Search className="w-4 h-4" />}
                    >
                      Compare Prices & Availability
                    </Button>
                  </div>
                </div>
              </CardBody>
            </Card>
          ) : (
            <div className="h-full flex items-center justify-center p-8 border-2 border-dashed border-neutral-200 rounded-2xl bg-neutral-50 text-center">
              <div className="max-w-xs">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                  <Pill className="w-8 h-8 text-neutral-300" />
                </div>
                <h3 className="text-lg font-medium text-neutral-900 mb-2">
                  No medicines detected yet
                </h3>
                <p className="text-neutral-500">
                  Upload a prescription image and click "Analyze" to see the list of medicines here.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PrescriptionUpload;
