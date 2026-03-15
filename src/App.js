import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './auth/AuthContext';
import RequireAuth from './auth/RequireAuth';
import Login from './pages/Login';
import Logout from './pages/Logout';
import AuthCallback from './pages/AuthCallback';
import ProductDashboardPage from './pages/ProductDashboardPage';
import OrdersPage from './pages/OrdersPage';
import CustomersPage from './pages/CustomersPage';
import InventoryPage from './pages/InventoryPage';
import SettingsPage from './pages/SettingsPage';
import CostMarginPage from './pages/CostMarginPage';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/logout" element={<Logout />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
          
          {/* Protected routes */}
          <Route 
            path="/dashboard" 
            element={
              <RequireAuth>
                <ProductDashboardPage />
              </RequireAuth>
            } 
          />

          <Route 
            path="/pedidos" 
            element={
              <RequireAuth>
                <OrdersPage />
              </RequireAuth>
            } 
          />

          <Route 
            path="/clientes" 
            element={
              <RequireAuth>
                <CustomersPage />
              </RequireAuth>
            } 
          />

          <Route 
            path="/estoque" 
            element={
              <RequireAuth>
                <InventoryPage />
              </RequireAuth>
            } 
          />

          <Route 
            path="/configuracoes" 
            element={
              <RequireAuth>
                <SettingsPage />
              </RequireAuth>
            } 
          />

          <Route 
            path="/custos" 
            element={
              <RequireAuth>
                <CostMarginPage />
              </RequireAuth>
            } 
          />
          
          {/* Redirect root to dashboard */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          
          {/* Catch all - redirect to dashboard */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
