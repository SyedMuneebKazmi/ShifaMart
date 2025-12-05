import { Menu, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { Bell, ChevronDown, LogOut, Menu as MenuIcon, User } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import useAuthStore from '@stores/authStore';
import useUIStore from '@stores/uiStore';
import clsx from 'clsx';

const TopNav = () => {
  const { user, logout } = useAuthStore();
  const { toggleSidebar, toggleMobileMenu } = useUIStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-30 h-16 border-b border-neutral-200 bg-white px-4 lg:px-6">
      <div className="flex h-full items-center justify-between">
        <div className="flex items-center gap-4">
          {/* Mobile Menu Button */}
          <button
            onClick={toggleMobileMenu}
            className="lg:hidden p-2 text-neutral-500 hover:bg-neutral-100 rounded-lg"
          >
            <MenuIcon className="w-6 h-6" />
          </button>

          {/* Desktop Sidebar Toggle */}
          <button
            onClick={toggleSidebar}
            className="hidden lg:block p-2 text-neutral-500 hover:bg-neutral-100 rounded-lg"
          >
            <MenuIcon className="w-5 h-5" />
          </button>

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-500 text-white font-bold text-xl">
              S+
            </div>
            <span className="text-xl font-bold text-neutral-900 hidden sm:block">
              ShifaMart+
            </span>
          </Link>
        </div>

        <div className="flex items-center gap-4">
          {/* Notifications */}
          <button className="relative p-2 text-neutral-500 hover:bg-neutral-100 rounded-lg">
            <Bell className="w-5 h-5" />
            <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-danger border-2 border-white" />
          </button>

          {/* User Menu */}
          <Menu as="div" className="relative">
            <Menu.Button className="flex items-center gap-2 rounded-lg p-1 hover:bg-neutral-50">
              <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-medium">
                {user?.name?.[0] || 'U'}
              </div>
              <div className="hidden md:block text-left">
                <p className="text-sm font-medium text-neutral-900">{user?.name}</p>
                <p className="text-xs text-neutral-500 capitalize">{user?.role}</p>
              </div>
              <ChevronDown className="w-4 h-4 text-neutral-400" />
            </Menu.Button>

            <Transition
              as={Fragment}
              enter="transition ease-out duration-100"
              enterFrom="transform opacity-0 scale-95"
              enterTo="transform opacity-100 scale-100"
              leave="transition ease-in duration-75"
              leaveFrom="transform opacity-100 scale-100"
              leaveTo="transform opacity-0 scale-95"
            >
              <Menu.Items className="absolute right-0 mt-2 w-48 origin-top-right rounded-lg bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                <Menu.Item>
                  {({ active }) => (
                    <button
                      className={clsx(
                        active ? 'bg-neutral-50' : '',
                        'flex w-full items-center gap-2 px-4 py-2 text-sm text-neutral-700'
                      )}
                    >
                      <User className="w-4 h-4" />
                      Profile
                    </button>
                  )}
                </Menu.Item>
                <Menu.Item>
                  {({ active }) => (
                    <button
                      onClick={handleLogout}
                      className={clsx(
                        active ? 'bg-neutral-50' : '',
                        'flex w-full items-center gap-2 px-4 py-2 text-sm text-danger'
                      )}
                    >
                      <LogOut className="w-4 h-4" />
                      Sign out
                    </button>
                  )}
                </Menu.Item>
              </Menu.Items>
            </Transition>
          </Menu>
        </div>
      </div>
    </header>
  );
};

export default TopNav;
