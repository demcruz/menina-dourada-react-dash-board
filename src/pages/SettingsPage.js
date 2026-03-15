import React from 'react';
import AppShell from '../components/layout/AppShell';

const SettingsPage = () => {
  return (
    <AppShell
      pageTitle="Configuracoes"
      pageSubtitle="Preferencias e ajustes do painel"
    >
      <div className="card" style={{ padding: 'var(--space-6)' }}>
        <h2 className="text-xl font-semibold">Em configuracao</h2>
        <p className="text-secondary" style={{ marginTop: 'var(--space-2)' }}>
          Esta pagina esta pronta para receber as configuracoes do sistema.
        </p>
      </div>
    </AppShell>
  );
};

export default SettingsPage;
