import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import CreateAd from './pages/CreateAd';
import AdminCategories from './pages/AdminCategories';
import Moderation from './pages/Moderation';
import Navbar from './components/Navbar';

function AppContent() {
  const { isAuthenticated, user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      {isAuthenticated && <Navbar />}
      <main className={isAuthenticated ? 'pt-16' : ''}>
        <Routes>
          <Route
            path="/"
            element={
              isAuthenticated ? <Navigate to="/dashboard" /> : <Navigate to="/login" />
            }
          />
          <Route
            path="/login"
            element={isAuthenticated ? <Navigate to="/dashboard" /> : <Login />}
          />
          <Route
            path="/register"
            element={isAuthenticated ? <Navigate to="/dashboard" /> : <Register />}
          />
          <Route
            path="/dashboard"
            element={isAuthenticated ? <Dashboard /> : <Navigate to="/login" />}
          />
          <Route
            path="/create-ad"
            element={isAuthenticated ? <CreateAd /> : <Navigate to="/login" />}
          />
          <Route
            path="/admin/categories"
            element={
              isAuthenticated && user?.role === 'admin' ? (
                <AdminCategories />
              ) : (
                <Navigate to="/dashboard" />
              )
            }
          />
          <Route
            path="/moderation"
            element={
              isAuthenticated && (user?.role === 'admin' || user?.role === 'moderator') ? (
                <Moderation />
              ) : (
                <Navigate to="/dashboard" />
              )
            }
          />
        </Routes>
      </main>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
