import { useState } from 'react';
import { Phone, Heart, Activity, Flame, AlertCircle, ChevronRight, Search } from 'lucide-react';
import Card, { CardBody } from '@components/ui/Card';
import Button from '@components/ui/Button';
import Input from '@components/ui/Input';
import Modal from '@components/ui/Modal';
import emergencyService from '@services/emergency';

const FirstAid = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEmergency, setSelectedEmergency] = useState(null);
  const [ambulanceLoading, setAmbulanceLoading] = useState(false);
  const [ambulanceRequested, setAmbulanceRequested] = useState(false);

  const emergencies = [
    {
      id: 'cpr',
      title: 'Cardiac Arrest (CPR)',
      icon: Heart,
      color: 'bg-red-100 text-red-600',
      steps: [
        'Check for responsiveness and breathing.',
        'Call emergency services immediately.',
        'Place hands on center of chest.',
        'Push hard and fast (100-120 compressions/min).',
        'Allow chest to recoil completely between compressions.'
      ]
    },
    {
      id: 'burns',
      title: 'Severe Burns',
      icon: Flame,
      color: 'bg-orange-100 text-orange-600',
      steps: [
        'Cool the burn with cool (not cold) running water for 10-20 mins.',
        'Remove tight items before swelling occurs.',
        'Cover with sterile, non-fluffy dressing or cling film.',
        'Do not apply ice, creams, or burst blisters.',
        'Seek medical help for severe burns.'
      ]
    },
    {
      id: 'stroke',
      title: 'Stroke (FAST)',
      icon: Activity,
      color: 'bg-purple-100 text-purple-600',
      steps: [
        'Face: Ask them to smile. Does one side droop?',
        'Arms: Ask them to raise both arms. Does one drift down?',
        'Speech: Ask them to repeat a phrase. Is it slurred?',
        'Time: If you see these signs, call ambulance immediately.'
      ]
    },
    {
      id: 'choking',
      title: 'Choking',
      icon: AlertCircle,
      color: 'bg-blue-100 text-blue-600',
      steps: [
        'Encourage them to cough.',
        'Give 5 back blows between shoulder blades.',
        'Give 5 abdominal thrusts (Heimlich maneuver).',
        'Repeat cycle until object clears or help arrives.',
        'If unconscious, start CPR.'
      ]
    }
  ];

  const filteredEmergencies = emergencies.filter(e => 
    e.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCallAmbulance = async () => {
    setAmbulanceLoading(true);
    try {
      // Mock API call
      // await emergencyService.triggerAmbulance({ location: 'Current Location' });
      await new Promise(resolve => setTimeout(resolve, 2000));
      setAmbulanceRequested(true);
    } catch (error) {
      console.error('Failed to call ambulance:', error);
    } finally {
      setAmbulanceLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="text-center space-y-4">
        <div className="inline-flex p-4 bg-red-100 text-red-600 rounded-full mb-2">
          <AlertCircle className="w-12 h-12" />
        </div>
        <h1 className="text-3xl font-bold text-neutral-900">Emergency First Aid</h1>
        <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
          Quick guides for medical emergencies. In life-threatening situations, always call for professional help first.
        </p>
        
        <div className="flex justify-center pt-4">
          <Button 
            size="lg" 
            variant="danger" 
            className="text-lg px-8 py-4 shadow-lg shadow-red-200 animate-pulse"
            onClick={handleCallAmbulance}
            loading={ambulanceLoading}
            disabled={ambulanceRequested}
            leftIcon={<Phone className="w-6 h-6" />}
          >
            {ambulanceRequested ? 'Ambulance on the way!' : 'Call Ambulance Now'}
          </Button>
        </div>
        
        {ambulanceRequested && (
          <div className="bg-green-50 border border-green-200 text-green-800 p-4 rounded-lg max-w-md mx-auto mt-4">
            <p className="font-bold">Help is on the way!</p>
            <p className="text-sm">Estimated arrival: 8-10 minutes. Stay on the line if connected.</p>
          </div>
        )}
      </div>

      <div className="max-w-md mx-auto">
        <Input
          placeholder="Search for emergency type..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          leftIcon={<Search className="w-5 h-5" />}
          className="shadow-sm"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredEmergencies.map((emergency) => (
          <Card 
            key={emergency.id} 
            hover 
            onClick={() => setSelectedEmergency(emergency)}
            className="cursor-pointer border-l-4 border-l-transparent hover:border-l-primary-500 transition-all"
          >
            <CardBody className="flex items-start gap-4 p-6">
              <div className={`p-3 rounded-xl ${emergency.color}`}>
                <emergency.icon className="w-8 h-8" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-neutral-900 mb-2">{emergency.title}</h3>
                <p className="text-sm text-neutral-500 line-clamp-2">
                  {emergency.steps[0]} {emergency.steps[1]}
                </p>
                <div className="mt-4 flex items-center text-primary-600 font-medium text-sm">
                  View Steps <ChevronRight className="w-4 h-4 ml-1" />
                </div>
              </div>
            </CardBody>
          </Card>
        ))}
      </div>

      <Modal
        isOpen={!!selectedEmergency}
        onClose={() => setSelectedEmergency(null)}
        title={selectedEmergency?.title}
        size="lg"
      >
        {selectedEmergency && (
          <div className="space-y-6">
            <div className="flex justify-center mb-6">
              <div className={`p-6 rounded-full ${selectedEmergency.color}`}>
                <selectedEmergency.icon className="w-12 h-12" />
              </div>
            </div>

            <div className="space-y-4">
              {selectedEmergency.steps.map((step, index) => (
                <div key={index} className="flex gap-4 p-4 bg-neutral-50 rounded-xl border border-neutral-100">
                  <div className="flex-shrink-0 w-8 h-8 bg-neutral-900 text-white rounded-full flex items-center justify-center font-bold">
                    {index + 1}
                  </div>
                  <p className="text-lg text-neutral-800 pt-0.5">{step}</p>
                </div>
              ))}
            </div>

            <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg mt-6">
              <div className="flex gap-3">
                <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0" />
                <p className="text-sm text-yellow-800">
                  These instructions are for immediate first aid only. Professional medical attention should be sought as soon as possible.
                </p>
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <Button onClick={() => setSelectedEmergency(null)}>
                Close Guide
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default FirstAid;
