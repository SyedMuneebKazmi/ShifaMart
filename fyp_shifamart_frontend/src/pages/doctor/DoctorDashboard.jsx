import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Calendar, Clock, Activity, MessageSquare, X, CheckCircle } from 'lucide-react';
import useAuthStore from '@stores/authStore';
import Card, { CardHeader, CardBody } from '@components/ui/Card';
import Button from '@components/ui/Button';
import Badge from '@components/ui/Badge';
import Table from '@components/ui/Table';

// ─── Modal: Add New Patient ──────────────────────────────────────────────────
const AddPatientModal = ({ isOpen, onClose }) => {
  const [form, setForm] = useState({ name: '', phone: '', age: '', concern: '' });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    // Simulated save — replace with a real API call when the backend is ready
    await new Promise((r) => setTimeout(r, 900));
    setLoading(false);
    setSubmitted(true);
  };

  const handleClose = () => {
    setForm({ name: '', phone: '', age: '', concern: '' });
    setSubmitted(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100">
          <h2 className="text-lg font-bold text-neutral-900">Add New Patient</h2>
          <button onClick={handleClose} className="text-neutral-400 hover:text-neutral-700 p-1 rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {submitted ? (
          <div className="p-8 text-center space-y-3">
            <div className="mx-auto w-14 h-14 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-7 h-7 text-green-600" />
            </div>
            <h3 className="text-base font-semibold text-neutral-900">Patient Added!</h3>
            <p className="text-sm text-neutral-500">
              <strong>{form.name}</strong> has been registered. You can now schedule a consultation.
            </p>
            <Button onClick={handleClose} className="mt-2">Done</Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Patient Name *</label>
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                required
                className="w-full px-4 py-2.5 rounded-xl border-2 border-neutral-200 focus:border-primary-500 outline-none transition-all"
                placeholder="Full name"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Phone</label>
                <input
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-xl border-2 border-neutral-200 focus:border-primary-500 outline-none transition-all"
                  placeholder="+92 3xx xxxxxxx"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Age</label>
                <input
                  name="age"
                  type="number"
                  value={form.age}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-xl border-2 border-neutral-200 focus:border-primary-500 outline-none transition-all"
                  placeholder="e.g. 35"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Chief Complaint</label>
              <textarea
                name="concern"
                value={form.concern}
                onChange={handleChange}
                rows={2}
                className="w-full px-4 py-2.5 rounded-xl border-2 border-neutral-200 focus:border-primary-500 outline-none transition-all resize-none"
                placeholder="Briefly describe the patient's primary concern…"
              />
            </div>
            <div className="flex gap-3 justify-end pt-2">
              <Button variant="outline" type="button" onClick={handleClose}>Cancel</Button>
              <Button type="submit" loading={loading}>Add Patient</Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

// ─── Modal: Schedule Appointment ─────────────────────────────────────────────
const ScheduleModal = ({ isOpen, onClose }) => {
  const [form, setForm] = useState({ patientName: '', date: '', time: '', type: 'Consultation' });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    await new Promise((r) => setTimeout(r, 900));
    setLoading(false);
    setSubmitted(true);
  };

  const handleClose = () => {
    setForm({ patientName: '', date: '', time: '', type: 'Consultation' });
    setSubmitted(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100">
          <h2 className="text-lg font-bold text-neutral-900">Schedule Appointment</h2>
          <button onClick={handleClose} className="text-neutral-400 hover:text-neutral-700 p-1 rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {submitted ? (
          <div className="p-8 text-center space-y-3">
            <div className="mx-auto w-14 h-14 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-7 h-7 text-green-600" />
            </div>
            <h3 className="text-base font-semibold text-neutral-900">Appointment Scheduled!</h3>
            <p className="text-sm text-neutral-500">
              Appointment for <strong>{form.patientName}</strong> on{' '}
              <strong>{form.date}</strong> at <strong>{form.time}</strong> has been booked.
            </p>
            <Button onClick={handleClose} className="mt-2">Done</Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Patient Name *</label>
              <input
                name="patientName"
                value={form.patientName}
                onChange={handleChange}
                required
                className="w-full px-4 py-2.5 rounded-xl border-2 border-neutral-200 focus:border-primary-500 outline-none transition-all"
                placeholder="Patient's full name"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Date *</label>
                <input
                  name="date"
                  type="date"
                  value={form.date}
                  onChange={handleChange}
                  required
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-4 py-2.5 rounded-xl border-2 border-neutral-200 focus:border-primary-500 outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Time *</label>
                <input
                  name="time"
                  type="time"
                  value={form.time}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2.5 rounded-xl border-2 border-neutral-200 focus:border-primary-500 outline-none transition-all"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Type</label>
              <select
                name="type"
                value={form.type}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-xl border-2 border-neutral-200 focus:border-primary-500 outline-none transition-all bg-white"
              >
                {['Consultation', 'Follow-up', 'New Visit', 'Emergency', 'Check-up'].map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
            <div className="flex gap-3 justify-end pt-2">
              <Button variant="outline" type="button" onClick={handleClose}>Cancel</Button>
              <Button type="submit" loading={loading}>Schedule</Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

// ─── Doctor Dashboard ─────────────────────────────────────────────────────────
const DoctorDashboard = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [showAddPatient, setShowAddPatient] = useState(false);
  const [showSchedule, setShowSchedule] = useState(false);

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
    <>
      {/* Modals */}
      <AddPatientModal isOpen={showAddPatient} onClose={() => setShowAddPatient(false)} />
      <ScheduleModal isOpen={showSchedule} onClose={() => setShowSchedule(false)} />

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
                action={<Button variant="ghost" size="sm" onClick={() => setShowSchedule(true)}>View Calendar</Button>}
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
                  <Button
                    id="btn-add-patient"
                    className="w-full justify-start"
                    variant="outline"
                    leftIcon={<Users className="w-4 h-4" />}
                    onClick={() => setShowAddPatient(true)}
                  >
                    Add New Patient
                  </Button>
                  <Button
                    id="btn-schedule-appointment"
                    className="w-full justify-start"
                    variant="outline"
                    leftIcon={<Calendar className="w-4 h-4" />}
                    onClick={() => setShowSchedule(true)}
                  >
                    Schedule Appointment
                  </Button>
                  <Button
                    id="btn-patient-messages"
                    className="w-full justify-start"
                    variant="outline"
                    leftIcon={<MessageSquare className="w-4 h-4" />}
                    onClick={() => navigate('/doctor/consult/2')}
                  >
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
    </>
  );
};

export default DoctorDashboard;
