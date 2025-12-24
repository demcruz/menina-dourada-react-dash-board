import React, { useState, useEffect } from 'react';
import { useAuth } from '../../auth/AuthContext';
import Header from './Header';
import Sidebar from './Sidebar';
import './AppShell.css';

const AppShell = ({ children, pageTitle = "Dashboard", pageSubtitle, onAddProduct }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { user } = useAuth();

  // Close sidebar on mobile when clicking outside
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsSidebarOpen(true);
      } else {
        setIsSidebarOpen(false);
      }
    };

    // Set initial state
    handleResize();
    
    // Listen for resize events
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const closeSidebar = () => {
    if (window.innerWidth < 1024) {
      setIsSidebarOpen(false);
    }
  };

  return (
    <div className="app-shell">
      <Sidebar 
        isOpen={isSidebarOpen} 
        onClose={closeSidebar}
        onToggle={toggleSidebar}
      />
      
      <div className={`app-shell__main ${isSidebarOpen ? 'app-shell__main--sidebar-open' : ''}`}>
        <Header 
          pageTitle={pageTitle}
          pageSubtitle={pageSubtitle}
          user={user}
          onToggleSidebar={toggleSidebar}
          onAddProduct={onAddProduct}
          showSidebarToggle={!isSidebarOpen || window.innerWidth < 1024}
        />
        
        <main className="app-shell__content">
          <div className="container">
            {children}
          </div>
        </main>
      </div>

      {/* Mobile overlay */}
      {isSidebarOpen && window.innerWidth < 1024 && (
        <div 
          className="app-shell__overlay" 
          onClick={closeSidebar}
          aria-hidden="true"
        />
      )}
    </div>
  );
};

export default AppShell;