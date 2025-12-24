import React, { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

const Logout = () => {
  const { logout, isAuthenticated } = useAuth();

  useEffect(() => {
    // Perform logout when component mounts
    logout();
  }, [logout]);

  // If not authenticated, redirect to login
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  // Show loading state while logging out
  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100vh',
      flexDirection: 'column',
      gap: '20px'
    }}>
      <div>Signing out...</div>
      <div style={{ fontSize: '14px', color: '#666' }}>
        You will be redirected to the login page shortly.
      </div>
    </div>
  );
};

export default Logout;