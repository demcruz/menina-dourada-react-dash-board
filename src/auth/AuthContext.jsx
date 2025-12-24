import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Hardcoded users for temporary authentication
const VALID_USERS = [
  { username: 'diego', password: 'md2025!' },
  { username: 'partner', password: 'md2025!' }
];

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing session on app load
    const checkAuth = () => {
      const isAuthenticated = sessionStorage.getItem('md_auth') === 'true';
      const username = sessionStorage.getItem('md_user');
      
      if (isAuthenticated && username) {
        setUser({ username });
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (username, password) => {
    // Validate credentials against hardcoded users
    const validUser = VALID_USERS.find(
      u => u.username === username && u.password === password
    );

    if (!validUser) {
      throw new Error('Invalid username or password');
    }

    // Set session storage as specified
    sessionStorage.setItem('md_auth', 'true');
    sessionStorage.setItem('md_user', username);

    const userData = { username };
    setUser(userData);
    return userData;
  };

  const logout = () => {
    // Clear session storage
    sessionStorage.removeItem('md_auth');
    sessionStorage.removeItem('md_user');
    
    setUser(null);
  };

  const isAuthenticated = () => {
    return sessionStorage.getItem('md_auth') === 'true';
  };

  const getToken = () => {
    // Return a fake token for API calls
    return isAuthenticated() ? `fake-bearer-token-${sessionStorage.getItem('md_user')}` : null;
  };

  const value = {
    user,
    login,
    logout,
    isAuthenticated,
    getToken,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};