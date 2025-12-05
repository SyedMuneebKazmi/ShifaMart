import { useNavigate } from 'react-router-dom';
import { Users, Calendar, Clock, Activity, MessageSquare } from 'lucide-react';
import useAuthStore from '@stores/authStore';
import Card, { CardHeader, CardBody } from '@components/ui/Card';
import Button from '@components/ui/Button';
import Badge from '@components/ui/Badge';
import Table from '@components/ui/Table';

const DoctorDashboard = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();

  const stats = [
    { label: 'Patients Today', value: '12', icon: Users, color: 'bg-blue-100 text-blue-600' },
    { label: 'Pending Consults', value: '4', icon: Clock, color: 'bg-orange-100 text-orange-600' },
    { label: 'Total Patients', value: '1,250', icon: Activity, color: 'bg-green-100 text-green-600' },
    { label: 'Messages', value: '8', icon: MessageSquare, color: 'bg-purple-100 text-purple-600' },
  ];

  const appointments = [
    { id: 1, patient: 'Ahmed Khan', time: '09:00 AM', type: 'Follow-up', status: 'completed' },
    { id: 2, patient: 'Fatima Ali', time: '09:30 AM', type: 'New Visit', status: 'in-progress' },
    { id: 3, patient: 'John Doe', time: '10:00 AM', type: 'Consultation', status: 'scheduled' },
    { id: 4, patient: 'Sarah Smith', time: '10:30 AM', type: 'Follow-up', status: 'scheduled' },
    { id: 5, patient: 'Bilal Ahmed', time: '11:00 AM', type: 'Emergency', status: 'scheduled' },
  ];

  const columns = [
    { key: 'time', header: 'Time' },
    { 
      key: 'patient', 
      header: 'Patient Name',
      render: (row) => <span className="font-medium">{row.patient}</span>
    },
    { key: 'type', header: 'Type' },
    { 
      key: 'status', 
      header: 'Status',
      render: (row) => (
        <Badge 
          variant={
            row.status === 'completed' ? 'success' : 
            row.status === 'in-progress' ? 'info' : 'neutral'
          }
          size="sm"
          dot
        >
          {row.status}
        </Badge>
      )
    },
    {
      key: 'actions',
      header: 'Action',
      render: (row) => (
        <Button 
          size="sm" 
          variant={row.status === 'in-progress' ? 'primary' : 'outline'}
          onClick={() => navigate(`/doctor/consult/${row.id}`)}
        >
          {row.status === 'in-progress' ? 'Continue' : 'View'}
        </Button>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Doctor Dashboard</h1>
          <p className="text-neutral-500">Welcome back, Dr. {user?.name?.split(' ')[0]}</p>
        </div>
        <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg border border-neutral-200 text-sm font-medium text-neutral-600">
          <Calendar className="w-4 h-4" />
          <span>{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardBody className="flex items-center justify-between p-4">
              <div>
                <p className="text-sm text-neutral-500 font-medium">{stat.label}</p>
                <h3 className="text-2xl font-bold text-neutral-900 mt-1">{stat.value}</h3>
              </div>
              <div className={`p-3 rounded-xl ${stat.color}`}>
                <stat.icon className="w-6 h-6" />
              </div>
            </CardBody>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Schedule */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader 
              title="Today's Appointments" 
              action={<Button variant="ghost" size="sm">View Calendar</Button>}
            />
            <CardBody>
              <Table columns={columns} data={appointments} />
            </CardBody>
          </Card>
        </div>

        {/* Quick Actions & Notifications */}
        <div className="space-y-6">
          <Card>
            <CardHeader title="Quick Actions" />
            <CardBody>
              <div className="space-y-3">
                <Button className="w-full justify-start" variant="outline" leftIcon={<Users className="w-4 h-4" />}>
                  Add New Patient
                </Button>
                <Button className="w-full justify-start" variant="outline" leftIcon={<Calendar className="w-4 h-4" />}>
                  Schedule Appointment
                </Button>
                <Button className="w-full justify-start" variant="outline" leftIcon={<MessageSquare className="w-4 h-4" />}>
                  Patient Messages
                </Button>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="Recent Activity" />
            <CardBody>
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex gap-3 text-sm">
                    <div className="w-2 h-2 mt-1.5 rounded-full bg-primary-500 flex-shrink-0" />
                    <div>
                      <p className="text-neutral-900">Prescription issued to <span className="font-medium">Ali Khan</span></p>
                      <p className="text-neutral-500 text-xs">2 hours ago</p>
                    </div>
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

export default DoctorDashboard;
