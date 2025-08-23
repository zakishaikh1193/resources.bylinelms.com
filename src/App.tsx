import React from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import AdminDashboard from './components/AdminDashboard';
import SchoolDashboard from './components/SchoolDashboard';

// Main App Content (wrapped with authentication)
const AppContent: React.FC = () => {
  const { user } = useAuth();

  // Show admin dashboard for admin users, school dashboard for school users
  if (user?.role === 'admin') {
    return <AdminDashboard />;
  }

  return <SchoolDashboard />;
};

// Main App Component with Authentication Provider
function App() {
  return (
    <AuthProvider>
      <ProtectedRoute>
        <AppContent />
      </ProtectedRoute>
    </AuthProvider>
  );
}

export default App;