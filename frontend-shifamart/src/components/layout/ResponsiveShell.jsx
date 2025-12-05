import { Outlet } from 'react-router-dom';
import TopNav from './TopNav';
import SideNav from './SideNav';

const ResponsiveShell = () => {
  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col">
      <TopNav />
      
      <div className="flex flex-1 overflow-hidden">
        <SideNav />
        
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <div className="container-custom py-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default ResponsiveShell;
