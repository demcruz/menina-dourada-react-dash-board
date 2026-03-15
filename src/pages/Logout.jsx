import React, { useEffect } from 'react';
import { useAuth } from '../auth/AuthContext';

const Logout = () => {
  const { logout } = useAuth();

  useEffect(() => {
    logout();
  }, [logout]);

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
