import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Vote, BarChart3, Users, Settings, LogOut, Home } from 'lucide-react';
import toast from 'react-hot-toast';

const DashboardLayout = () => {
  const { userRole, logout } = useAuth();
  const location = useLocation();

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Logged out successfully');
    } catch (error) {
      toast.error('Error logging out');
    }
  };

  const navItems = [
    { path: '/dashboard', icon: Home, label: 'Home' },
    { path: '/vote', icon: Vote, label: 'Vote' },
    { path: '/results', icon: BarChart3, label: 'Results' },
    ...(userRole === 'admin' ? [
      { path: '/admin', icon: Settings, label: 'Admin' }
    ] : [])
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Desktop Sidebar - Hidden on Mobile */}
      <div className="hidden lg:flex lg:fixed lg:inset-y-0 lg:w-64 lg:bg-white lg:shadow-lg lg:z-40">
        <div className="flex flex-col w-full">
          <div className="p-6 border-b">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-2 rounded-lg">
                <Vote className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-xl font-bold text-gray-900">E-Voting</h1>
            </div>
          </div>

          <nav className="flex-1 mt-6">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center space-x-3 px-6 py-3 text-gray-700 hover:bg-gray-100 transition-colors ${
                    isActive ? 'bg-blue-50 text-blue-600 border-r-2 border-blue-600' : ''
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="p-6 border-t">
            <button
              onClick={handleLogout}
              className="flex items-center space-x-3 text-gray-700 hover:text-red-600 transition-colors w-full"
            >
              <LogOut className="w-5 h-5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="lg:ml-64 min-h-screen pb-16 lg:pb-0">
        <Outlet />
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50">
        <div className="grid grid-cols-4 h-16">
          {navItems.slice(0, 3).map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center justify-center space-y-1 transition-colors ${
                  isActive ? 'text-blue-600 bg-blue-50' : 'text-gray-600 hover:text-blue-600'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-xs font-medium">{item.label}</span>
              </Link>
            );
          })}
          
          {userRole === 'admin' && (
            <Link
              to="/admin"
              className={`flex flex-col items-center justify-center space-y-1 transition-colors ${
                location.pathname === '/admin' ? 'text-blue-600 bg-blue-50' : 'text-gray-600 hover:text-blue-600'
              }`}
            >
              <Settings className="w-5 h-5" />
              <span className="text-xs font-medium">Admin</span>
            </Link>
          )}
          
          {userRole !== 'admin' && (
            <button
              onClick={handleLogout}
              className="flex flex-col items-center justify-center space-y-1 text-gray-600 hover:text-red-600 transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span className="text-xs font-medium">Logout</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;