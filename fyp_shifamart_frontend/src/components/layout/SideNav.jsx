import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Stethoscope, 
  Upload, 
  Pill, 
  Store, 
  Package, 
  Users, 
  FileCheck, 
  AlertCircle,
  Activity,
  MessageSquare,
  Brain
} from 'lucide-react';
import useAuthStore from '@stores/authStore';
import useUIStore from '@stores/uiStore';
import clsx from 'clsx';

const SideNav = () => {
  const { user } = useAuthStore();
  const { sidebarOpen, mobileMenuOpen, setMobileMenuOpen } = useUIStore();

  const role = user?.role || 'patient';

  const menuItems = {
    patient: [
      { icon: LayoutDashboard, label: 'Dashboard', path: '/patient/dashboard' },
      { icon: Brain, label: 'AI Assistant', path: '/patient/ai-assistant', highlight: true },
      { icon: Activity, label: 'Symptom Checker', path: '/patient/symptoms' },
      { icon: Upload, label: 'Upload Prescription', path: '/patient/upload' },
      { icon: Pill, label: 'Compare Medicines', path: '/patient/medicines' },
      { icon: AlertCircle, label: 'First Aid', path: '/first-aid' },
    ],
    pharmacy: [
      { icon: LayoutDashboard, label: 'Dashboard', path: '/pharmacy/dashboard' },
      { icon: Package, label: 'Inventory', path: '/pharmacy/inventory' },
    ],
    doctor: [
      { icon: LayoutDashboard, label: 'Dashboard', path: '/doctor/dashboard' },
    ],
    admin: [
      { icon: LayoutDashboard, label: 'Dashboard', path: '/admin/dashboard' },
      { icon: FileCheck, label: 'Approvals', path: '/admin/approvals' },
    ],
  };

  const currentMenu = menuItems[role] || [];

  const NavItem = ({ item }) => (
    <NavLink
      to={item.path}
      onClick={() => setMobileMenuOpen(false)}
      className={({ isActive }) =>
        clsx(
          'flex items-center gap-3 px-3 py-2 rounded-lg transition-colors mb-1',
          isActive
            ? 'bg-primary-50 text-primary-600 font-medium'
            : item.highlight
              ? 'text-primary-600 bg-primary-50/50 hover:bg-primary-100'
              : 'text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900'
        )
      }
    >
      <item.icon className={clsx('w-5 h-5', item.highlight && 'text-primary-500')} />
      <span className={clsx(!sidebarOpen && 'lg:hidden')}>{item.label}</span>
      {item.highlight && (
        <span className="ml-auto text-xs bg-primary-500 text-white px-1.5 py-0.5 rounded-full">AI</span>
      )}
    </NavLink>
  );

  return (
    <>
      {/* Mobile Overlay */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={clsx(
          'fixed lg:static inset-y-0 left-0 z-40 bg-white border-r border-neutral-200 transition-all duration-300 ease-in-out',
          sidebarOpen ? 'w-64' : 'w-20',
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        <div className="flex flex-col h-full">
          {/* Mobile Header */}
          <div className="h-16 flex items-center px-6 border-b border-neutral-200 lg:hidden">
            <span className="text-xl font-bold text-primary-600">ShifaMart+</span>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 overflow-y-auto">
            <div className="space-y-1">
              {currentMenu.map((item) => (
                <NavItem key={item.path} item={item} />
              ))}
            </div>

            {/* AI Chat Link (Available for all roles) */}
            <div className="mt-8 pt-4 border-t border-neutral-200">
              <NavLink
                to="/ai-assistant"
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) =>
                  clsx(
                    'flex items-center gap-3 px-3 py-2 rounded-lg transition-colors',
                    isActive
                      ? 'bg-primary-100 text-primary-700 font-medium'
                      : 'text-primary-600 bg-primary-50/50 hover:bg-primary-100'
                  )
                }
              >
                <Brain className="w-5 h-5" />
                <span className={clsx(!sidebarOpen && 'lg:hidden')}>AI Assistant</span>
                <span className="ml-auto text-xs bg-green-500 text-white px-1.5 py-0.5 rounded-full animate-pulse">Live</span>
              </NavLink>
            </div>
          </nav>

          {/* User Info (Collapsed state) */}
          {!sidebarOpen && (
            <div className="p-4 border-t border-neutral-200 hidden lg:flex justify-center">
              <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-medium text-sm">
                {user?.name?.[0] || 'U'}
              </div>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};

export default SideNav;
