import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';
import Button from '../../atoms/Button/Button';
import PlusIcon from '../../atoms/PlusIcon';
import './Header.css';

const Header = ({ 
  pageTitle, 
  pageSubtitle, 
  onToggleSidebar, 
  onAddProduct, 
  showSidebarToggle = true 
}) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="header">
      <div className="header__left">
        {showSidebarToggle && (
          <button
            type="button"
            className="header__sidebar-toggle"
            onClick={onToggleSidebar}
            aria-label="Toggle sidebar"
          >
            <span className="header__sidebar-toggle-bar" />
            <span className="header__sidebar-toggle-bar" />
            <span className="header__sidebar-toggle-bar" />
          </button>
        )}
        
        <div className="header__brand">
          <div className="header__logo">MD</div>
          <span className="header__brand-text">Menina Dourada</span>
        </div>
        
        <div className="header__page-info">
          <h1 className="header__title">{pageTitle}</h1>
          {pageSubtitle && (
            <p className="header__subtitle">{pageSubtitle}</p>
          )}
        </div>
      </div>

      <div className="header__right">
        <div className="header__user">
          <span className="header__username">{user?.username}</span>
          <button 
            type="button" 
            className="header__logout"
            onClick={handleLogout}
          >
            Sair
          </button>
        </div>
        
        {onAddProduct && (
          <Button 
            variant="primary" 
            onClick={onAddProduct}
            icon={PlusIcon}
            className="header__cta"
          >
            <span className="header__cta-text">Adicionar Produto</span>
            <span className="header__cta-text-short">Adicionar</span>
          </Button>
        )}
      </div>
    </header>
  );
};

export default Header;