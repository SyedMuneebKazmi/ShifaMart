import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm, useFieldArray } from 'react-hook-form';
import { User, FileText, Plus, Trash2, Send, Save } from 'lucide-react';
import Card, { CardHeader, CardBody } from '@components/ui/Card';
import Button from '@components/ui/Button';
import Input from '@components/ui/Input';
import Badge from '@components/ui/Badge';

const PatientConsult = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);

  // Mock patient data
  const patient = {
    id,
    name: 'Fatima Ali',
    age: 28,
    gender: 'Female',
    bloodGroup: 'O+',
    allergies: ['Penicillin', 'Peanuts'],
    lastVisit: '2023-10-15',
    history: 'Hypertension, Asthma'
  };

  const { register, control, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      diagnosis: '',
      notes: '',
      medicines: [{ name: '', dosage: '', frequency: '', duration: '' }]
    }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'medicines'
  });

  const onSubmit = async (data) => {
    setSaving(true);
    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      console.log('Prescription data:', data);
      navigate('/doctor/dashboard');
    } catch (error) {
      console.error('Failed to save prescription:', error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Patient Consultation</h1>
          <p className="text-neutral-500">Consultation ID: #CNS-{id || 'NEW'}</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => navigate('/doctor/dashboard')}>
            Cancel
          </Button>
          <Button onClick={handleSubmit(onSubmit)} loading={saving} leftIcon={<Send className="w-4 h-4" />}>
            Issue Prescription
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Patient Info Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader title="Patient Details" />
            <CardBody>
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 font-bold text-2xl">
                  {patient.name.charAt(0)}
                </div>
                <div>
                  <h3 className="font-bold text-lg text-neutral-900">{patient.name}</h3>
                  <p className="text-neutral-500">{patient.age} yrs • {patient.gender}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="p-3 bg-neutral-50 rounded-lg">
                  <p className="text-xs text-neutral-500 uppercase font-semibold mb-1">Blood Group</p>
                  <p className="font-medium">{patient.bloodGroup}</p>
                </div>
                
                <div className="p-3 bg-neutral-50 rounded-lg">
                  <p className="text-xs text-neutral-500 uppercase font-semibold mb-1">Allergies</p>
                  <div className="flex flex-wrap gap-2">
                    {patient.allergies.map(allergy => (
                      <Badge key={allergy} variant="danger" size="sm">{allergy}</Badge>
                    ))}
                  </div>
                </div>

                <div className="p-3 bg-neutral-50 rounded-lg">
                  <p className="text-xs text-neutral-500 uppercase font-semibold mb-1">Medical History</p>
                  <p className="text-sm text-neutral-700">{patient.history}</p>
                </div>

                <div className="p-3 bg-neutral-50 rounded-lg">
                  <p className="text-xs text-neutral-500 uppercase font-semibold mb-1">Last Visit</p>
                  <p className="text-sm text-neutral-700">{patient.lastVisit}</p>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Consultation Form */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader title="Diagnosis & Notes" />
            <CardBody>
              <div className="space-y-4">
                <div>
                  <label className="label-base">Diagnosis</label>
                  <input
                    {...register('diagnosis', { required: 'Diagnosis is required' })}
                    className="input-base"
                    placeholder="e.g. Acute Bronchitis"
                  />
                  {errors.diagnosis && <p className="text-sm text-danger mt-1">{errors.diagnosis.message}</p>}
                </div>

                <div>
                  <label className="label-base">Clinical Notes</label>
                  <textarea
                    {...register('notes')}
                    rows={4}
                    className="input-base py-2"
                    placeholder="Enter detailed clinical notes, symptoms, and observations..."
                  />
                </div>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardHeader 
              title="Prescription" 
              action={
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={() => append({ name: '', dosage: '', frequency: '', duration: '' })}
                  leftIcon={<Plus className="w-4 h-4" />}
                >
                  Add Medicine
                </Button>
              }
            />
            <CardBody>
              <div className="space-y-4">
                {fields.map((field, index) => (
                  <div key={field.id} className="flex gap-3 items-start p-4 bg-neutral-50 rounded-lg border border-neutral-200">
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="md:col-span-2">
                        <Input
                          placeholder="Medicine Name"
                          {...register(`medicines.${index}.name`, { required: true })}
                          className="bg-white"
                        />
                      </div>
                      <Input
                        placeholder="Dosage (e.g. 500mg)"
                        {...register(`medicines.${index}.dosage`, { required: true })}
                        className="bg-white"
                      />
                      <Input
                        placeholder="Frequency (e.g. 1-0-1)"
                        {...register(`medicines.${index}.frequency`, { required: true })}
                        className="bg-white"
                      />
                      <Input
                        placeholder="Duration (e.g. 5 days)"
                        {...register(`medicines.${index}.duration`, { required: true })}
                        className="bg-white"
                      />
                      <Input
                        placeholder="Instructions (Optional)"
                        {...register(`medicines.${index}.instructions`)}
                        className="bg-white"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => remove(index)}
                      className="p-2 text-neutral-400 hover:text-danger hover:bg-white rounded-lg transition-colors"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PatientConsult;
