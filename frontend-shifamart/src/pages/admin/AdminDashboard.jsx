import { useNavigate } from 'react-router-dom';
import { Users, Store, Activity, AlertTriangle, TrendingUp, CheckCircle } from 'lucide-react';
import useAuthStore from '@stores/authStore';
import Card, { CardHeader, CardBody } from '@components/ui/Card';
import Button from '@components/ui/Button';
import Badge from '@components/ui/Badge';
import LineChart from '@components/charts/LineChart';
import BarChart from '@components/charts/BarChart';

const AdminDashboard = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();

  const stats = [
    { label: 'Total Users', value: '15,234', change: '+12%', icon: Users, color: 'bg-blue-100 text-blue-600' },
    { label: 'Pharmacies', value: '145', change: '+3', icon: Store, color: 'bg-green-100 text-green-600' },
    { label: 'Pending Approvals', value: '8', change: '-2', icon: AlertTriangle, color: 'bg-orange-100 text-orange-600' },
    { label: 'Platform Revenue', value: 'Rs. 1.2M', change: '+8%', icon: TrendingUp, color: 'bg-purple-100 text-purple-600' },
  ];

  const userGrowthData = [
    { name: 'Jan', users: 1000 },
    { name: 'Feb', users: 2500 },
    { name: 'Mar', users: 4000 },
    { name: 'Apr', users: 5500 },
    { name: 'May', users: 8000 },
    { name: 'Jun', users: 12000 },
    { name: 'Jul', users: 15234 },
  ];

  const pharmacyActivityData = [
    { name: 'North', orders: 450 },
    { name: 'South', orders: 320 },
    { name: 'East', orders: 280 },
    { name: 'West', orders: 390 },
    { name: 'Central', orders: 560 },
  ];

  const pendingApprovals = [
    { id: 1, name: 'HealthCare Pharmacy', license: 'PH-2023-001', date: '2023-10-25', status: 'pending' },
    { id: 2, name: 'City Medical Store', license: 'PH-2023-045', date: '2023-10-24', status: 'pending' },
    { id: 3, name: 'Wellness Chemist', license: 'PH-2023-089', date: '2023-10-23', status: 'reviewing' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Admin Dashboard</h1>
          <p className="text-neutral-500">Platform overview and management</p>
        </div>
        <Button onClick={() => navigate('/admin/approvals')} leftIcon={<CheckCircle className="w-4 h-4" />}>
          Review Approvals
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardBody className="flex items-center justify-between p-4">
              <div>
                <p className="text-sm text-neutral-500 font-medium">{stat.label}</p>
                <h3 className="text-2xl font-bold text-neutral-900 mt-1">{stat.value}</h3>
                <span className={`text-xs font-medium ${stat.change.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                  {stat.change} from last month
                </span>
              </div>
              <div className={`p-3 rounded-xl ${stat.color}`}>
                <stat.icon className="w-6 h-6" />
              </div>
            </CardBody>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* User Growth Chart */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader title="User Growth" />
            <CardBody>
              <LineChart 
                data={userGrowthData} 
                categories={['users']} 
                index="name" 
                colors={['#0067B8']} 
              />
            </CardBody>
          </Card>
        </div>

        {/* Pharmacy Activity */}
        <Card>
          <CardHeader title="Orders by Region" />
          <CardBody>
            <BarChart 
              data={pharmacyActivityData} 
              categories={['orders']} 
              index="name" 
              colors={['#00A884']} 
            />
          </CardBody>
        </Card>
      </div>

      {/* Pending Approvals */}
      <Card>
        <CardHeader 
          title="Pending Pharmacy Approvals" 
          action={<Button variant="ghost" size="sm" onClick={() => navigate('/admin/approvals')}>View All</Button>}
        />
        <CardBody>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-neutral-50 text-neutral-500">
                <tr>
                  <th className="px-6 py-3 font-medium">Pharmacy Name</th>
                  <th className="px-6 py-3 font-medium">License No.</th>
                  <th className="px-6 py-3 font-medium">Application Date</th>
                  <th className="px-6 py-3 font-medium">Status</th>
                  <th className="px-6 py-3 font-medium">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200">
                {pendingApprovals.map((item) => (
                  <tr key={item.id} className="hover:bg-neutral-50">
                    <td className="px-6 py-4 font-medium">{item.name}</td>
                    <td className="px-6 py-4">{item.license}</td>
                    <td className="px-6 py-4">{item.date}</td>
                    <td className="px-6 py-4">
                      <Badge 
                        variant={item.status === 'reviewing' ? 'info' : 'warning'}
                        size="sm"
                        dot
                      >
                        {item.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <Button size="sm" variant="outline">Review</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardBody>
      </Card>
    </div>
  );
};

export default AdminDashboard;
