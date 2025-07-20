import React from 'react';
import Button from '../../atoms/Button/Button'; // Reutilizamos o átomo Button
import PlusIcon from '../../atoms/PlusIcon';   // Reutilizamos o átomo PlusIcon
import './DashboardLayout.css'; // Importa os estilos do template

const DashboardLayout = ({ children, onAddProduct }) => {
  return (
    <div className="container"> {/* O container já está no index.css */}
      <header className="dashboard-header">
        <div>
          <h1 className="dashboard-title">Moda Praia Dashboard</h1>
          <p className="dashboard-subtitle">Gerencie seus produtos de moda praia</p>
        </div>
        <Button
          variant="primary"
          onClick={onAddProduct}
          icon={PlusIcon}
        >
          Adicionar Produto
        </Button>
      </header>

      {/* A área onde o conteúdo específico (listagem de produtos, outros formulários) será renderizado */}
      <main className="dashboard-content">
        {children}
      </main>
    </div>
  );
};

export default DashboardLayout;