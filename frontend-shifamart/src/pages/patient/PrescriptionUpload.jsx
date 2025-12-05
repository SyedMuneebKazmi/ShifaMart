import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText, Check, AlertCircle, Trash2, Edit2, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Card, { CardHeader, CardBody } from '@components/ui/Card';
import Button from '@components/ui/Button';
import Alert from '@components/ui/Alert';
import ocrService from '@services/ocr';
import { formatFileSize } from '@utils/validators';

const PrescriptionUpload = () => {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  const [medicines, setMedicines] = useState([]);

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
    try {
      // Mock API call
      // const response = await ocrService.analyzePrescription(file);
      
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock result
      const mockMedicines = [
        { id: 1, name: 'Amoxicillin', dosage: '500mg', quantity: '20', type: 'Antibiotic' },
        { id: 2, name: 'Paracetamol', dosage: '500mg', quantity: '10', type: 'Painkiller' },
        { id: 3, name: 'Cetirizine', dosage: '10mg', quantity: '10', type: 'Antihistamine' }
      ];
      
      setMedicines(mockMedicines);
      setResult({
        text: "Rx\nAmoxicillin 500mg - 1 tab twice daily x 10 days\nParacetamol 500mg - 1 tab SOS\nCetirizine 10mg - 1 tab at night",
        confidence: 0.92
      });
    } catch (error) {
      console.error('Analysis failed:', error);
    } finally {
      setAnalyzing(false);
    }
  };

  const removeFile = () => {
    setFile(null);
    setPreview(null);
    setResult(null);
    setMedicines([]);
  };

  const handleComparePrices = () => {
    // Navigate to comparison page with medicines
    navigate('/patient/medicines', { state: { medicines } });
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
              </CardBody>
            </Card>
          )}
        </div>

        {/* Results Section */}
        <div className="space-y-6">
          {medicines.length > 0 ? (
            <Card className="h-full">
              <CardHeader 
                title="Detected Medicines" 
                action={
                  <Button variant="ghost" size="sm" leftIcon={<Edit2 className="w-4 h-4" />}>
                    Edit List
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
                          </div>
                        </div>
                        <Button variant="ghost" size="sm" className="text-neutral-400">
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
