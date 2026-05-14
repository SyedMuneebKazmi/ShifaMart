import { Menu, Transition } from '@headlessui/react';
import { Fragment, useState } from 'react';
import { ChevronDown, LogOut, User, Menu as MenuIcon, X as XIcon } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import useAuthStore from '@stores/authStore';
import clsx from 'clsx';

const PublicNav = () => {
  const { user, isAuthenticated, logout } = useAuthStore();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <nav className="sticky top-0 z-50 bg-gradient-to-r from-primary-600 via-primary-700 to-accent-600 shadow-lg">
      <div className="container-custom">
        <div className="flex h-20 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm text-white font-bold text-2xl transform transition-transform group-hover:scale-110">
              S+
            </div>
            <div className="hidden sm:block">
              <span className="text-2xl font-bold text-white">ShifaMart+</span>
              <p className="text-xs text-primary-100">AI-Powered Healthcare</p>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-6">
            <button
              onClick={() => scrollToSection('features')}
              className="text-white hover:text-primary-100 font-medium transition-colors"
            >
              Features
            </button>
            <Link
              to="/doctors"
              className="text-white hover:text-primary-100 font-medium transition-colors"
            >
              Doctors
            </Link>
            <Link
              to="/pharmacies"
              className="text-white hover:text-primary-100 font-medium transition-colors"
            >
              Pharmacies
            </Link>
            <Link
              to="/first-aid"
              className="text-white hover:text-primary-100 font-medium transition-colors"
            >
              First Aid
            </Link>
          </div>

          {/* Right Side - Auth Buttons or User Menu */}
          <div className="flex items-center gap-4">
            {!isAuthenticated ? (
              <>
                <Link
                  to="/login"
                  className="hidden sm:inline-flex btn-base px-6 py-2 text-white border-2 border-white/50 hover:bg-white/10 hover:border-white transition-all"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="btn-base px-6 py-2 bg-white text-primary-700 hover:bg-primary-50 shadow-lg transition-all"
                >
                  Get Started
                </Link>
              </>
            ) : (
              <Menu as="div" className="relative">
                <Menu.Button className="flex items-center gap-2 rounded-lg px-3 py-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm transition-colors">
                  <div className="h-9 w-9 rounded-full bg-white/90 flex items-center justify-center text-primary-700 font-bold">
                    {user?.name?.[0] || 'U'}
                  </div>
                  <div className="hidden md:block text-left">
                    <p className="text-sm font-medium text-white">{user?.name}</p>
                    <p className="text-xs text-primary-100 capitalize">{user?.role}</p>
                  </div>
                  <ChevronDown className="w-4 h-4 text-white" />
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
                  <Menu.Items className="absolute right-0 mt-2 w-56 origin-top-right rounded-lg bg-white py-2 shadow-xl ring-1 ring-black ring-opacity-5 focus:outline-none">
                    <Menu.Item>
                      {({ active }) => (
                        <button
                          onClick={() => navigate(`/${user?.role}/dashboard`)}
                          className={clsx(
                            active ? 'bg-neutral-50' : '',
                            'flex w-full items-center gap-3 px-4 py-3 text-sm text-neutral-700'
                          )}
                        >
                          <User className="w-5 h-5" />
                          <div className="text-left">
                            <div className="font-medium">Go to Dashboard</div>
                            <div className="text-xs text-neutral-500 capitalize">{user?.role} Portal</div>
                          </div>
                        </button>
                      )}
                    </Menu.Item>
                    
                    <div className="my-1 border-t border-neutral-100" />
                    
                    <Menu.Item>
                      {({ active }) => (
                        <button
                          onClick={handleLogout}
                          className={clsx(
                            active ? 'bg-red-50' : '',
                            'flex w-full items-center gap-3 px-4 py-3 text-sm text-red-600'
                          )}
                        >
                          <LogOut className="w-5 h-5" />
                          Sign out
                        </button>
                      )}
                    </Menu.Item>
                  </Menu.Items>
                </Transition>
              </Menu>
            )}

            {/* Mobile menu button */}
            <button
              type="button"
              onClick={() => setMobileOpen((v) => !v)}
              aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileOpen}
              className="md:hidden p-2 text-white hover:bg-white/10 rounded-lg"
            >
              {mobileOpen ? <XIcon className="w-6 h-6" /> : <MenuIcon className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Drawer */}
        {mobileOpen && (
          <div className="md:hidden pb-4 pt-1 space-y-1 border-t border-white/10">
            <button
              onClick={() => { scrollToSection('features'); setMobileOpen(false); }}
              className="w-full text-left px-3 py-2 rounded-lg text-white hover:bg-white/10 font-medium"
            >
              Features
            </button>
            <Link
              to="/doctors"
              onClick={() => setMobileOpen(false)}
              className="block px-3 py-2 rounded-lg text-white hover:bg-white/10 font-medium"
            >
              Doctors
            </Link>
            <Link
              to="/pharmacies"
              onClick={() => setMobileOpen(false)}
              className="block px-3 py-2 rounded-lg text-white hover:bg-white/10 font-medium"
            >
              Pharmacies
            </Link>
            <Link
              to="/first-aid"
              onClick={() => setMobileOpen(false)}
              className="block px-3 py-2 rounded-lg text-white hover:bg-white/10 font-medium"
            >
              First Aid
            </Link>
            {!isAuthenticated && (
              <Link
                to="/login"
                onClick={() => setMobileOpen(false)}
                className="block px-3 py-2 rounded-lg text-white hover:bg-white/10 font-medium sm:hidden"
              >
                Sign In
              </Link>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default PublicNav;
