import React, { useState } from 'react';
import Button from '../../atoms/Button/Button';
import PlusIcon from '../../atoms/PlusIcon';
import './DashboardLayout.css';

const menuItems = [
  { id: 'produtos', label: 'Produtos' },
  { id: 'pedidos', label: 'Pedidos' },
  { id: 'clientes', label: 'Clientes' },
  { id: 'estoque', label: 'Estoque' },
  { id: 'configuracoes', label: 'Configuracoes' }
];

const DashboardLayout = ({ children, onAddProduct }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const handleToggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev);
  };

  const handleCloseSidebar = () => {
    setIsSidebarOpen(false);
  };

  return (
    <div className={`dashboard-shell ${isSidebarOpen ? 'is-sidebar-open' : ''}`}>
      <aside className="dashboard-sidebar">
        <div className="sidebar-header">
          <span className="sidebar-brand">Menina Dourada</span>
          <button
            type="button"
            className="sidebar-toggle sidebar-toggle--sidebar"
            onClick={handleToggleSidebar}
            aria-label="Fechar menu"
          >
            <span className="sidebar-toggle-bar" />
            <span className="sidebar-toggle-bar" />
            <span className="sidebar-toggle-bar" />
          </button>
        </div>
        <nav className="sidebar-nav">
          {menuItems.map((item) => (
            <button
              key={item.id}
              type="button"
              className={`sidebar-item ${item.id === 'produtos' ? 'is-active' : ''}`}
            >
              {item.label}
            </button>
          ))}
        </nav>
      </aside>

      {isSidebarOpen && <div className="sidebar-overlay" onClick={handleCloseSidebar} />}

      <div className="dashboard-main">
        <header className="dashboard-topbar">
          <div className="topbar-left">
            {!isSidebarOpen && (
              <button
                type="button"
                className="sidebar-toggle"
                onClick={handleToggleSidebar}
                aria-label="Abrir menu"
              >
                <span className="sidebar-toggle-bar" />
                <span className="sidebar-toggle-bar" />
                <span className="sidebar-toggle-bar" />
              </button>
            )}
            <div className="brand-logo" aria-hidden="true" />
            <div>
              <h1 className="dashboard-title">Moda Praia Dashboard</h1>
              <p className="dashboard-subtitle">Gerencie seus produtos de moda praia</p>
            </div>
          </div>

          <div className="topbar-right">
            <div className="user-chip">
              <div className="user-name">Usuario Logado</div>
              <button type="button" className="logout-button">Sair</button>
            </div>
            <Button variant="primary" onClick={onAddProduct} icon={PlusIcon}>
              Adicionar Produto
            </Button>
          </div>
        </header>

        <div className="container">
          <main className="dashboard-content">{children}</main>
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;
