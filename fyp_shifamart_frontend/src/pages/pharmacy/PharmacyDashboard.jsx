import { useNavigate } from 'react-router-dom';
import { Package, TrendingUp, DollarSign, ShoppingBag, Plus } from 'lucide-react';
import useAuthStore from '@stores/authStore';
import Card, { CardHeader, CardBody } from '@components/ui/Card';
import Button from '@components/ui/Button';
import Badge from '@components/ui/Badge';
import LineChart from '@components/charts/LineChart';
import BarChart from '@components/charts/BarChart';

const PharmacyDashboard = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();

  const stats = [
    { label: 'Total Revenue', value: 'Rs. 45,200', change: '+12%', icon: DollarSign, color: 'bg-green-100 text-green-600' },
    { label: 'Active Orders', value: '18', change: '+5', icon: ShoppingBag, color: 'bg-blue-100 text-blue-600' },
    { label: 'Low Stock Items', value: '12', change: '-2', icon: Package, color: 'bg-orange-100 text-orange-600' },
    { label: 'Daily Views', value: '156', change: '+24%', icon: TrendingUp, color: 'bg-purple-100 text-purple-600' },
  ];

  const recentOrders = [
    { id: '#ORD-001', customer: 'Ali Khan', items: 3, total: 1250, status: 'pending', time: '10 mins ago' },
    { id: '#ORD-002', customer: 'Sara Ahmed', items: 1, total: 450, status: 'completed', time: '1 hour ago' },
    { id: '#ORD-003', customer: 'John Doe', items: 5, total: 3200, status: 'processing', time: '2 hours ago' },
  ];

  const revenueData = [
    { name: 'Mon', revenue: 4000 },
    { name: 'Tue', revenue: 3000 },
    { name: 'Wed', revenue: 5000 },
    { name: 'Thu', revenue: 4500 },
    { name: 'Fri', revenue: 6000 },
    { name: 'Sat', revenue: 7500 },
    { name: 'Sun', revenue: 5500 },
  ];

  const topProducts = [
    { name: 'Panadol', sales: 120 },
    { name: 'Brufen', sales: 95 },
    { name: 'Augmentin', sales: 85 },
    { name: 'Cac-1000', sales: 70 },
    { name: 'Arinac', sales: 65 },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Pharmacy Dashboard</h1>
          <p className="text-neutral-500">Manage your inventory and track performance</p>
        </div>
        <Button onClick={() => navigate('/pharmacy/inventory')} leftIcon={<Plus className="w-4 h-4" />}>
          Add Medicine
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
                  {stat.change} from last week
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
        {/* Revenue Chart */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader title="Revenue Overview" />
            <CardBody>
              <LineChart 
                data={revenueData} 
                categories={['revenue']} 
                index="name" 
                colors={['#0067B8']} 
              />
            </CardBody>
          </Card>
        </div>

        {/* Top Products */}
        <Card>
          <CardHeader title="Top Selling Products" />
          <CardBody>
            <BarChart 
              data={topProducts} 
              categories={['sales']} 
              index="name" 
              colors={['#00A884']} 
            />
          </CardBody>
        </Card>
      </div>

      {/* Recent Orders */}
      <Card>
        <CardHeader 
          title="Recent Orders" 
          action={<Button variant="ghost" size="sm">View All</Button>}
        />
        <CardBody>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-neutral-50 text-neutral-500">
                <tr>
                  <th className="px-6 py-3 font-medium">Order ID</th>
                  <th className="px-6 py-3 font-medium">Customer</th>
                  <th className="px-6 py-3 font-medium">Items</th>
                  <th className="px-6 py-3 font-medium">Total</th>
                  <th className="px-6 py-3 font-medium">Status</th>
                  <th className="px-6 py-3 font-medium">Time</th>
                  <th className="px-6 py-3 font-medium">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200">
                {recentOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-neutral-50">
                    <td className="px-6 py-4 font-medium">{order.id}</td>
                    <td className="px-6 py-4">{order.customer}</td>
                    <td className="px-6 py-4">{order.items} items</td>
                    <td className="px-6 py-4">Rs. {order.total}</td>
                    <td className="px-6 py-4">
                      <Badge 
                        variant={
                          order.status === 'completed' ? 'success' : 
                          order.status === 'processing' ? 'info' : 'warning'
                        }
                        size="sm"
                        dot
                      >
                        {order.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-neutral-500">{order.time}</td>
                    <td className="px-6 py-4">
                      <Button size="sm" variant="outline">Details</Button>
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

export default PharmacyDashboard;
