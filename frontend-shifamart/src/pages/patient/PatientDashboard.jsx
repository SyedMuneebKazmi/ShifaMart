import { useNavigate } from 'react-router-dom';
import { Activity, Upload, Pill, AlertCircle, ArrowRight } from 'lucide-react';
import useAuthStore from '@stores/authStore';
import Card, { CardHeader, CardBody } from '@components/ui/Card';
import Button from '@components/ui/Button';
import Badge from '@components/ui/Badge';

const PatientDashboard = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();

  const quickActions = [
    {
      title: 'Check Symptoms',
      description: 'Get AI-powered health insights',
      icon: Activity,
      color: 'bg-blue-100 text-blue-600',
      path: '/patient/symptoms',
    },
    {
      title: 'Upload Prescription',
      description: 'Scan and order medicines',
      icon: Upload,
      color: 'bg-green-100 text-green-600',
      path: '/patient/upload',
    },
    {
      title: 'Compare Prices',
      description: 'Find best medicine deals',
      icon: Pill,
      color: 'bg-purple-100 text-purple-600',
      path: '/patient/medicines',
    },
    {
      title: 'First Aid',
      description: 'Emergency guides',
      icon: AlertCircle,
      color: 'bg-red-100 text-red-600',
      path: '/first-aid',
    },
  ];

  const recentPredictions = [
    { id: 1, disease: 'Acute Pharyngitis', confidence: 0.82, date: '2023-10-15', severity: 'mild' },
    { id: 2, disease: 'Seasonal Allergy', confidence: 0.95, date: '2023-10-10', severity: 'mild' },
  ];

  const savedPrescriptions = [
    { id: 1, name: 'Antibiotics Course', date: '2023-10-12', status: 'processed' },
    { id: 2, name: 'Monthly Meds', date: '2023-09-28', status: 'pending' },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900">
            Welcome back, {user?.name?.split(' ')[0]}!
          </h1>
          <p className="text-neutral-500 mt-1">
            Here's your health overview for today.
          </p>
        </div>
        <Button onClick={() => navigate('/patient/symptoms')}>
          New Health Check
        </Button>
      </div>

      {/* Quick Actions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {quickActions.map((action) => (
          <Card 
            key={action.title}
            hover
            onClick={() => navigate(action.path)}
            className="border-none shadow-sm hover:shadow-md transition-all"
          >
            <CardBody className="flex flex-col items-center text-center p-4">
              <div className={`p-3 rounded-xl mb-3 ${action.color}`}>
                <action.icon className="w-6 h-6" />
              </div>
              <h3 className="font-semibold text-neutral-900">{action.title}</h3>
              <p className="text-sm text-neutral-500 mt-1">{action.description}</p>
            </CardBody>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent AI Predictions */}
        <Card>
          <CardHeader 
            title="Recent Health Checks" 
            action={
              <Button variant="ghost" size="sm" onClick={() => navigate('/patient/symptoms')}>
                View All
              </Button>
            }
          />
          <CardBody>
            <div className="space-y-4">
              {recentPredictions.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white rounded-lg border border-neutral-200">
                      <Activity className="w-5 h-5 text-primary-500" />
                    </div>
                    <div>
                      <h4 className="font-medium text-neutral-900">{item.disease}</h4>
                      <p className="text-xs text-neutral-500">{item.date}</p>
                    </div>
                  </div>
                  <Badge 
                    variant={item.severity === 'high' ? 'danger' : item.severity === 'moderate' ? 'warning' : 'success'}
                    size="sm"
                  >
                    {item.severity}
                  </Badge>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>

        {/* Saved Prescriptions */}
        <Card>
          <CardHeader 
            title="Recent Prescriptions" 
            action={
              <Button variant="ghost" size="sm" onClick={() => navigate('/patient/upload')}>
                View All
              </Button>
            }
          />
          <CardBody>
            <div className="space-y-4">
              {savedPrescriptions.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white rounded-lg border border-neutral-200">
                      <Upload className="w-5 h-5 text-accent-500" />
                    </div>
                    <div>
                      <h4 className="font-medium text-neutral-900">{item.name}</h4>
                      <p className="text-xs text-neutral-500">{item.date}</p>
                    </div>
                  </div>
                  <Badge 
                    variant={item.status === 'processed' ? 'success' : 'warning'}
                    size="sm"
                    dot
                  >
                    {item.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
};

export default PatientDashboard;
