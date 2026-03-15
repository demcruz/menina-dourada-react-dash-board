import React from 'react';
import AppShell from '../components/layout/AppShell';

const CustomersPage = () => {
  return (
    <AppShell
      pageTitle="Clientes"
      pageSubtitle="Centralize informacoes e relacionamento"
    >
      <div className="card" style={{ padding: 'var(--space-6)' }}>
        <h2 className="text-xl font-semibold">Em configuracao</h2>
        <p className="text-secondary" style={{ marginTop: 'var(--space-2)' }}>
          Esta pagina esta pronta para receber o cadastro e o historico dos clientes.
        </p>
      </div>
    </AppShell>
  );
};

export default CustomersPage;
