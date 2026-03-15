import React from 'react';
import AppShell from '../components/layout/AppShell';

const InventoryPage = () => {
  return (
    <AppShell
      pageTitle="Estoque"
      pageSubtitle="Visao geral das quantidades e movimentacoes"
    >
      <div className="card" style={{ padding: 'var(--space-6)' }}>
        <h2 className="text-xl font-semibold">Em configuracao</h2>
        <p className="text-secondary" style={{ marginTop: 'var(--space-2)' }}>
          Esta pagina esta pronta para receber alertas e controle de estoque.
        </p>
      </div>
    </AppShell>
  );
};

export default InventoryPage;
