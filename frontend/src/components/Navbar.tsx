import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LogOut, User, Plus, Settings, Shield } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-white shadow-lg fixed top-0 left-0 right-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/dashboard" className="text-xl font-bold text-blue-600">
              Fotol Jaay
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            <Link
              to="/create-ad"
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center space-x-2"
            >
              <Plus size={16} />
              <span>Nouvelle annonce</span>
            </Link>

            {(user?.role === 'admin' || user?.role === 'moderator') && (
              <Link
                to="/moderation"
                className="bg-orange-600 text-white px-4 py-2 rounded-md hover:bg-orange-700 flex items-center space-x-2"
              >
                <Shield size={16} />
                <span>Modération</span>
              </Link>
            )}

            {user?.role === 'admin' && (
              <Link
                to="/admin/categories"
                className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 flex items-center space-x-2"
              >
                <Settings size={16} />
                <span>Admin</span>
              </Link>
            )}

            <div className="flex items-center space-x-2 text-gray-700">
              <User size={16} />
              <span>{user?.name}</span>
            </div>

            <button
              onClick={handleLogout}
              className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 flex items-center space-x-2"
            >
              <LogOut size={16} />
              <span>Déconnexion</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;