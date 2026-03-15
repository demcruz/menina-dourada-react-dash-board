import React from 'react';
import { NavLink } from 'react-router-dom';
import './Sidebar.css';

const menuItems = [
  { id: 'produtos', label: 'Produtos', icon: '📦', path: '/dashboard', end: true },
  { id: 'pedidos', label: 'Pedidos', icon: '🧾', path: '/pedidos' },
  { id: 'clientes', label: 'Clientes', icon: '👥', path: '/clientes' },
  { id: 'estoque', label: 'Estoque', icon: '📊', path: '/estoque' },
  { id: 'custos', label: 'Custos & Margens', icon: '💰', path: '/custos' },
  { id: 'configuracoes', label: 'Configuracoes', icon: '⚙️', path: '/configuracoes' }
];

const Sidebar = ({ isOpen, onClose, onToggle }) => {
  const handleItemClick = () => {
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
              <NavLink
                to={item.path}
                end={item.end}
                className={({ isActive }) =>
                  `sidebar__menu-link ${isActive ? 'sidebar__menu-link--active' : ''}`
                }
                onClick={handleItemClick}
              >
                <span className="sidebar__menu-icon" aria-hidden="true">
                  {item.icon}
                </span>
                <span className="sidebar__menu-text">{item.label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;
