import React from 'react';
import './Sidebar.css';

const menuItems = [
  { id: 'produtos', label: 'Produtos', icon: '📦' },
  { id: 'pedidos', label: 'Pedidos', icon: '📋' },
  { id: 'clientes', label: 'Clientes', icon: '👥' },
  { id: 'estoque', label: 'Estoque', icon: '📊' },
  { id: 'configuracoes', label: 'Configurações', icon: '⚙️' }
];

const Sidebar = ({ isOpen, onClose, onToggle }) => {
  const handleItemClick = (itemId) => {
    // Handle navigation here
    console.log('Navigate to:', itemId);
    
    // Close sidebar on mobile after navigation
    if (window.innerWidth < 1024) {
      onClose();
    }
  };

  return (
    <aside className={`sidebar ${isOpen ? 'sidebar--open' : ''}`}>
      <div className="sidebar__header">
        <div className="sidebar__brand">
          <div className="sidebar__logo">MD</div>
          <span className="sidebar__brand-text">Menina Dourada</span>
        </div>
        
        <button
          type="button"
          className="sidebar__close"
          onClick={onToggle}
          aria-label="Close sidebar"
        >
          <span className="sidebar__close-bar" />
          <span className="sidebar__close-bar" />
          <span className="sidebar__close-bar" />
        </button>
      </div>

      <nav className="sidebar__nav" role="navigation">
        <ul className="sidebar__menu">
          {menuItems.map((item) => (
            <li key={item.id} className="sidebar__menu-item">
              <button
                type="button"
                className={`sidebar__menu-link ${item.id === 'produtos' ? 'sidebar__menu-link--active' : ''}`}
                onClick={() => handleItemClick(item.id)}
              >
                <span className="sidebar__menu-icon" aria-hidden="true">
                  {item.icon}
                </span>
                <span className="sidebar__menu-text">{item.label}</span>
              </button>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;