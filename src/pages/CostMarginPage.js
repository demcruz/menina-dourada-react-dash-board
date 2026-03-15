import React, { useState, useEffect, useMemo } from 'react';
import AppShell from '../components/layout/AppShell';
import { getProducts } from '../api/productService';
import './CostMarginPage.css';

const DEFAULT_COSTS = {
  taxaPix: 2.00,
  custoAnuncios: 6.00,
  embalagem: 0.00,
  reservaImprevistos: 3,
  impostoVenda: 0,
  simularImposto: true,
  margemMinima: 25,
  margemIdeal: 40,
  bloquearAbaixoMinima: false,
  exigirConfirmacaoAlerta: true
};

const CostMarginPage = () => {
  // Custos fixos
  const [taxaPix, setTaxaPix] = useState(DEFAULT_COSTS.taxaPix);
  const [custoAnuncios, setCustoAnuncios] = useState(DEFAULT_COSTS.custoAnuncios);
  const [embalagem, setEmbalagem] = useState(DEFAULT_COSTS.embalagem);
  
  // Percentuais
  const [reservaImprevistos, setReservaImprevistos] = useState(DEFAULT_COSTS.reservaImprevistos);
  const [impostoVenda, setImpostoVenda] = useState(DEFAULT_COSTS.impostoVenda);
  const [simularImposto, setSimularImposto] = useState(DEFAULT_COSTS.simularImposto);
  
  // Regras
  const [margemMinima, setMargemMinima] = useState(DEFAULT_COSTS.margemMinima);
  const [margemIdeal, setMargemIdeal] = useState(DEFAULT_COSTS.margemIdeal);
  const [bloquearAbaixoMinima, setBloquearAbaixoMinima] = useState(DEFAULT_COSTS.bloquearAbaixoMinima);
  const [exigirConfirmacaoAlerta, setExigirConfirmacaoAlerta] = useState(DEFAULT_COSTS.exigirConfirmacaoAlerta);
  
  // Simulador
  const [custoProduto, setCustoProduto] = useState(25);
  const [precoVenda, setPrecoVenda] = useState(109);
  
  // Produtos
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);

  // Carrega configurações salvas
  useEffect(() => {
    const saved = localStorage.getItem('costMarginConfig');
    if (saved) {
      try {
        const config = JSON.parse(saved);
        setTaxaPix(config.taxaPix ?? DEFAULT_COSTS.taxaPix);
        setCustoAnuncios(config.custoAnuncios ?? DEFAULT_COSTS.custoAnuncios);
        setEmbalagem(config.embalagem ?? DEFAULT_COSTS.embalagem);
        setReservaImprevistos(config.reservaImprevistos ?? DEFAULT_COSTS.reservaImprevistos);
        setImpostoVenda(config.impostoVenda ?? DEFAULT_COSTS.impostoVenda);
        setSimularImposto(config.simularImposto ?? DEFAULT_COSTS.simularImposto);
        setMargemMinima(config.margemMinima ?? DEFAULT_COSTS.margemMinima);
        setMargemIdeal(config.margemIdeal ?? DEFAULT_COSTS.margemIdeal);
        setBloquearAbaixoMinima(config.bloquearAbaixoMinima ?? DEFAULT_COSTS.bloquearAbaixoMinima);
        setExigirConfirmacaoAlerta(config.exigirConfirmacaoAlerta ?? DEFAULT_COSTS.exigirConfirmacaoAlerta);
      } catch (e) {
        console.error('Erro ao carregar configurações:', e);
      }
    }
  }, []);

  // Salva configurações
  useEffect(() => {
    const config = {
      taxaPix, custoAnuncios, embalagem,
      reservaImprevistos, impostoVenda, simularImposto,
      margemMinima, margemIdeal, bloquearAbaixoMinima, exigirConfirmacaoAlerta
    };
    localStorage.setItem('costMarginConfig', JSON.stringify(config));
  }, [taxaPix, custoAnuncios, embalagem, reservaImprevistos, impostoVenda, simularImposto, margemMinima, margemIdeal, bloquearAbaixoMinima, exigirConfirmacaoAlerta]);

  // Carrega produtos
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await getProducts(0, 100);
        setProducts(response.content || []);
      } catch (e) {
        console.error('Erro ao carregar produtos:', e);
      } finally {
        setLoadingProducts(false);
      }
    };
    fetchProducts();
  }, []);

  // Cálculo do simulador
  const impostoEfetivo = simularImposto ? (impostoVenda || 5) : impostoVenda;
  
  const calcularMargem = (custo, preco) => {
    if (!preco || preco <= 0) return { custoTotal: 0, lucro: 0, margem: 0 };
    
    const custosFixos = taxaPix + custoAnuncios + embalagem;
    const custosPercentuais = preco * ((reservaImprevistos + impostoEfetivo) / 100);
    const custoTotal = custo + custosFixos + custosPercentuais;
    const lucro = preco - custoTotal;
    const margem = (lucro / preco) * 100;
    
    return { custoTotal, lucro, margem };
  };

  const simulacao = useMemo(() => {
    return calcularMargem(custoProduto, precoVenda);
  }, [custoProduto, precoVenda, taxaPix, custoAnuncios, embalagem, reservaImprevistos, impostoEfetivo]);

  const getMargemStatus = (margem) => {
    if (margem >= margemIdeal) return { color: 'green', label: 'Margem saudável para escalar anúncios', icon: '🟢' };
    if (margem >= margemMinima) return { color: 'yellow', label: 'Venda com atenção', icon: '🟡' };
    return { color: 'red', label: 'Preço inviável', icon: '🔴' };
  };

  const margemStatus = getMargemStatus(simulacao.margem);

  // Análise dos produtos
  const analiseProducts = useMemo(() => {
    let abaixoMinima = 0;
    let emAtencao = 0;
    let saudaveis = 0;

    products.forEach(product => {
      const variacoes = product.variacoes || [];
      variacoes.forEach(v => {
        const custo = v.custoUnitario || 0;
        const preco = v.precoVenda || v.preco || 0;
        const { margem } = calcularMargem(custo, preco);
        
        if (margem < margemMinima) abaixoMinima++;
        else if (margem < margemIdeal) emAtencao++;
        else saudaveis++;
      });
    });

    return { abaixoMinima, emAtencao, saudaveis };
  }, [products, taxaPix, custoAnuncios, embalagem, reservaImprevistos, impostoEfetivo, margemMinima, margemIdeal]);

  return (
    <AppShell
      pageTitle="Custos & Margens"
      pageSubtitle="Defina os custos globais e veja o impacto na margem dos produtos"
    >
      <div className="cost-margin-container">
        {/* SEÇÃO 1 - Custos Fixos */}
        <div className="cost-card">
          <div className="card-header">
            <h3>💰 Custos Fixos por Venda</h3>
            <span className="card-subtitle">Custos que acontecem sempre que uma venda ocorre</span>
          </div>
          <div className="card-body">
            <div className="form-row-cost">
              <div className="form-group-cost">
                <label>Taxa PIX (R$)</label>
                <input
                  type="number"
                  step="0.01"
                  value={taxaPix}
                  onChange={(e) => setTaxaPix(parseFloat(e.target.value) || 0)}
                />
                <span className="field-hint">Cobrança fixa por transação</span>
              </div>
              <div className="form-group-cost">
                <label>Custo médio de anúncios (R$)</label>
                <input
                  type="number"
                  step="0.01"
                  value={custoAnuncios}
                  onChange={(e) => setCustoAnuncios(parseFloat(e.target.value) || 0)}
                />
                <span className="field-hint">Média estimada por venda</span>
              </div>
              <div className="form-group-cost">
                <label>Embalagem média (R$)</label>
                <input
                  type="number"
                  step="0.01"
                  value={embalagem}
                  onChange={(e) => setEmbalagem(parseFloat(e.target.value) || 0)}
                />
                <span className="field-hint">Opcional</span>
              </div>
            </div>
            <div className="tooltip-info">
              💡 Esses valores são aplicados automaticamente a todos os produtos.
            </div>
          </div>
        </div>

        {/* SEÇÃO 2 - Percentuais */}
        <div className="cost-card">
          <div className="card-header">
            <h3>📊 Percentuais sobre o Preço</h3>
            <span className="card-subtitle">Custos que variam conforme o valor da venda</span>
          </div>
          <div className="card-body">
            <div className="form-row-cost">
              <div className="form-group-cost">
                <label>Reserva para imprevistos (%)</label>
                <input
                  type="number"
                  step="0.5"
                  value={reservaImprevistos}
                  onChange={(e) => setReservaImprevistos(parseFloat(e.target.value) || 0)}
                />
                <span className="field-hint">Trocas, cupons, perdas</span>
              </div>
              <div className="form-group-cost">
                <label>Imposto sobre venda (%)</label>
                <input
                  type="number"
                  step="0.5"
                  value={impostoVenda}
                  onChange={(e) => setImpostoVenda(parseFloat(e.target.value) || 0)}
                />
                <span className="field-hint">0% (Autônomo) / 5% (CNPJ)</span>
              </div>
            </div>
            <div className="toggle-group">
              <label className="toggle-label">
                <input
                  type="checkbox"
                  checked={simularImposto}
                  onChange={(e) => setSimularImposto(e.target.checked)}
                />
                <span className="toggle-text">Simular imposto mesmo como autônomo (recomendado)</span>
              </label>
            </div>
          </div>
        </div>

        {/* SEÇÃO 3 - Simulador */}
        <div className="cost-card simulator-card">
          <div className="card-header">
            <h3>🔥 Simulador de Margem</h3>
            <span className="card-subtitle">Teste diferentes cenários em tempo real</span>
          </div>
          <div className="card-body">
            <div className="simulator-inputs">
              <div className="form-group-cost">
                <label>Custo do produto (R$)</label>
                <input
                  type="number"
                  step="0.01"
                  value={custoProduto}
                  onChange={(e) => setCustoProduto(parseFloat(e.target.value) || 0)}
                />
              </div>
              <div className="form-group-cost">
                <label>Preço de venda (R$)</label>
                <input
                  type="number"
                  step="0.01"
                  value={precoVenda}
                  onChange={(e) => setPrecoVenda(parseFloat(e.target.value) || 0)}
                />
              </div>
            </div>

            <div className="simulator-results">
              <div className="result-item">
                <span className="result-label">Custo total estimado:</span>
                <span className="result-value">R$ {simulacao.custoTotal.toFixed(2)}</span>
              </div>
              <div className="result-item">
                <span className="result-label">Lucro por venda:</span>
                <span className="result-value highlight">R$ {simulacao.lucro.toFixed(2)}</span>
              </div>
              <div className="result-item">
                <span className="result-label">Margem:</span>
                <span className={`result-value margin-${margemStatus.color}`}>
                  {simulacao.margem.toFixed(1)}%
                </span>
              </div>
            </div>

            <div className="margin-bar-container">
              <div className="margin-bar">
                <div 
                  className={`margin-fill margin-${margemStatus.color}`}
                  style={{ width: `${Math.min(100, Math.max(0, simulacao.margem))}%` }}
                />
              </div>
              <div className="margin-labels">
                <span>0%</span>
                <span className="label-red">{margemMinima}%</span>
                <span className="label-yellow">{margemIdeal}%</span>
                <span>100%</span>
              </div>
            </div>

            <div className={`margin-message margin-msg-${margemStatus.color}`}>
              {margemStatus.icon} {margemStatus.label}
            </div>
          </div>
        </div>

        {/* SEÇÃO 4 - Regras */}
        <div className="cost-card">
          <div className="card-header">
            <h3>⚙️ Regras de Margem</h3>
            <span className="card-subtitle">Configure alertas e bloqueios automáticos</span>
          </div>
          <div className="card-body">
            <div className="form-row-cost">
              <div className="form-group-cost">
                <label>Margem mínima permitida (%)</label>
                <input
                  type="number"
                  step="1"
                  value={margemMinima}
                  onChange={(e) => setMargemMinima(parseFloat(e.target.value) || 0)}
                />
              </div>
              <div className="form-group-cost">
                <label>Margem ideal (%)</label>
                <input
                  type="number"
                  step="1"
                  value={margemIdeal}
                  onChange={(e) => setMargemIdeal(parseFloat(e.target.value) || 0)}
                />
              </div>
            </div>
            <div className="checkbox-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={bloquearAbaixoMinima}
                  onChange={(e) => setBloquearAbaixoMinima(e.target.checked)}
                />
                <span>Bloquear cadastro de produto abaixo da margem mínima</span>
              </label>
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={exigirConfirmacaoAlerta}
                  onChange={(e) => setExigirConfirmacaoAlerta(e.target.checked)}
                />
                <span>Exigir confirmação ao salvar produto em alerta</span>
              </label>
            </div>
          </div>
        </div>

        {/* SEÇÃO 5 - Impacto */}
        <div className="cost-card impact-card">
          <div className="card-header">
            <h3>📈 Impacto Atual</h3>
            <span className="card-subtitle">Visão executiva dos seus produtos</span>
          </div>
          <div className="card-body">
            {loadingProducts ? (
              <div className="loading-impact">Carregando produtos...</div>
            ) : (
              <>
                <div className="impact-stats">
                  <div className="impact-item impact-red">
                    <span className="impact-icon">🔴</span>
                    <span className="impact-number">{analiseProducts.abaixoMinima}</span>
                    <span className="impact-label">produtos abaixo da margem mínima</span>
                  </div>
                  <div className="impact-item impact-yellow">
                    <span className="impact-icon">🟡</span>
                    <span className="impact-number">{analiseProducts.emAtencao}</span>
                    <span className="impact-label">produtos em atenção</span>
                  </div>
                  <div className="impact-item impact-green">
                    <span className="impact-icon">🟢</span>
                    <span className="impact-number">{analiseProducts.saudaveis}</span>
                    <span className="impact-label">produtos saudáveis</span>
                  </div>
                </div>
                <button className="btn-view-products">
                  Ver produtos afetados →
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
};

export default CostMarginPage;
