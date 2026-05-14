import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Users, Store, Activity, AlertTriangle, TrendingUp, CheckCircle } from 'lucide-react';
import useAuthStore from '@stores/authStore';
import adminService from '@services/admin';
import Card, { CardHeader, CardBody } from '@components/ui/Card';
import Button from '@components/ui/Button';
import Badge from '@components/ui/Badge';
import LineChart from '@components/charts/LineChart';
import BarChart from '@components/charts/BarChart';

const AdminDashboard = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [reports, setReports] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const statsData = await adminService.getStats();
        const reportsData = await adminService.getReports();
        setStats(statsData);
        setReports(reportsData);
      } catch (error) {
        console.error('Error fetching admin data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  const statCards = [
    { label: 'Total Users', value: stats?.totalUsers || 0, change: '+12%', icon: Users, color: 'bg-blue-100 text-blue-600' },
    { label: 'Doctors', value: stats?.totalDoctors || 0, change: '+3', icon: Activity, color: 'bg-green-100 text-green-600' },
    { label: 'Pharmacies', value: stats?.totalPharmacies || 0, change: '+2', icon: Store, color: 'bg-purple-100 text-purple-600' },
    { label: 'Patients', value: stats?.totalPatients || 0, change: '+8%', icon: Users, color: 'bg-orange-100 text-orange-600' },
  ];

  const userGrowthData = stats?.userGrowth || [
    { name: 'Jan', users: 0 },
    { name: 'Feb', users: 0 },
    { name: 'Mar', users: 0 },
    { name: 'Apr', users: 0 },
    { name: 'May', users: 0 },
    { name: 'Jun', users: 0 },
    { name: 'Jul', users: 0 },
  ];

  const roleDistributionData = reports?.roleDistribution?.map(role => ({
    name: role.role.charAt(0).toUpperCase() + role.role.slice(1),
    count: role.count
  })) || [
    { name: 'Patients', count: 0 },
    { name: 'Doctors', count: 0 },
    { name: 'Pharmacies', count: 0 },
    { name: 'Admins', count: 0 }
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
        {statCards.map((stat) => (
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

        {/* Role Distribution */}
        <Card>
          <CardHeader title="User Distribution" />
          <CardBody>
            <BarChart 
              data={roleDistributionData} 
              categories={['count']} 
              index="name" 
              colors={['#00A884']} 
            />
          </CardBody>
        </Card>
      </div>

      {/* Recent Users */}
      <Card>
        <CardHeader
          title="Recent User Registrations"
        />
        <CardBody>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-neutral-50 text-neutral-500">
                <tr>
                  <th className="px-6 py-3 font-medium">User Name</th>
                  <th className="px-6 py-3 font-medium">Email</th>
                  <th className="px-6 py-3 font-medium">Role</th>
                  <th className="px-6 py-3 font-medium">Joined</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200">
                {reports?.recentUsers?.slice(0, 5).map((item) => (
                  <tr key={item._id} className="hover:bg-neutral-50">
                    <td className="px-6 py-4 font-medium">{item.name}</td>
                    <td className="px-6 py-4">{item.email}</td>
                    <td className="px-6 py-4">
                      <Badge 
                        variant={item.role === 'admin' ? 'danger' : item.role === 'doctor' ? 'success' : 'info'}
                        size="sm"
                        dot
                      >
                        {item.role}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">{new Date(item.createdAt).toLocaleDateString()}</td>
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
