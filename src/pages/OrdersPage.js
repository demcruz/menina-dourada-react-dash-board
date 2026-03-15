import React, { useState, useEffect, useCallback } from 'react';
import AppShell from '../components/layout/AppShell';
import { getOrders, updateOrderTracking } from '../api/orderService';
import './OrdersPage.css';

const STATUS_LABELS = {
  PAID: { label: 'Aguardando Envio', color: 'orange' },
  PENDING: { label: 'Pendente', color: 'yellow' },
  SHIPPED: { label: 'Enviado', color: 'green' },
  DELIVERED: { label: 'Entregue', color: 'teal' },
  CANCELLED: { label: 'Cancelado', color: 'red' }
};

const CARRIERS = [
  { value: 'Correios', label: 'Correios' },
  { value: 'Jadlog', label: 'Jadlog' }
];

const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [trackingCodes, setTrackingCodes] = useState({});
  const [carriers, setCarriers] = useState({});
  const [savingOrder, setSavingOrder] = useState(null);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
  };

  const fetchOrders = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await getOrders();
      setOrders(response.items || []);
    } catch (err) {
      console.error('Erro ao carregar pedidos:', err);
      setError('Não foi possível carregar os pedidos.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const toggleExpand = (orderId) => {
    setExpandedOrder(expandedOrder === orderId ? null : orderId);
  };

  const handleTrackingChange = (orderId, value) => {
    setTrackingCodes(prev => ({
      ...prev,
      [orderId]: value
    }));
  };

  const handleCarrierChange = (orderId, value) => {
    setCarriers(prev => ({
      ...prev,
      [orderId]: value
    }));
  };

  const handleSaveTracking = async (orderId) => {
    const trackingCode = trackingCodes[orderId];
    const carrier = carriers[orderId] || 'Correios';
    
    if (!trackingCode || !trackingCode.trim()) {
      showToast('Digite o código de rastreio', 'error');
      return;
    }

    setSavingOrder(orderId);
    
    try {
      await updateOrderTracking(orderId, trackingCode.trim(), carrier);
      
      // Atualiza localmente
      setOrders(prev => prev.map(order => 
        order.orderId === orderId 
          ? { ...order, status: 'SHIPPED', trackingCode: trackingCode.trim(), carrier }
          : order
      ));
      
      // Limpa os campos após salvar
      setTrackingCodes(prev => {
        const newCodes = { ...prev };
        delete newCodes[orderId];
        return newCodes;
      });
      setCarriers(prev => {
        const newCarriers = { ...prev };
        delete newCarriers[orderId];
        return newCarriers;
      });

      showToast(`Rastreio salvo! Enviado via ${carrier}.`, 'success');
    } catch (err) {
      console.error('Erro ao salvar rastreio:', err);
      showToast('Erro ao salvar código de rastreio.', 'error');
    } finally {
      setSavingOrder(null);
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status) => {
    const statusInfo = STATUS_LABELS[status] || { label: status, color: 'gray' };
    return (
      <span className={`order-status-badge status-${statusInfo.color}`}>
        {statusInfo.label}
      </span>
    );
  };

  return (
    <AppShell
      pageTitle="Pedidos"
      pageSubtitle="Acompanhe e gerencie seus pedidos"
    >
      {/* Toast Notification */}
      {toast.show && (
        <div className={`toast toast-${toast.type}`}>
          <span className="toast-icon">
            {toast.type === 'success' ? '✓' : '!'}
          </span>
          <span className="toast-message">{toast.message}</span>
        </div>
      )}
      {isLoading && (
        <div className="orders-loading">
          <div className="loading-spinner"></div>
          <p>Carregando pedidos...</p>
        </div>
      )}

      {error && (
        <div className="alert alert-error" role="alert">
          {error}
          <button onClick={fetchOrders} className="btn-retry">Tentar novamente</button>
        </div>
      )}

      {!isLoading && !error && orders.length === 0 && (
        <div className="orders-empty">
          <p>Nenhum pedido encontrado.</p>
        </div>
      )}

      {!isLoading && !error && orders.length > 0 && (
        <div className="orders-list">
          {orders.map((order) => (
            <div key={order.orderId} className={`order-card ${order.status === 'PAID' ? 'awaiting-shipment' : ''}`}>
              <div 
                className="order-header"
                onClick={() => toggleExpand(order.orderId)}
              >
                <div className="order-header-left">
                  <span className="order-id">#{order.orderId.slice(-8).toUpperCase()}</span>
                  {getStatusBadge(order.status)}
                  {order.customerName && (
                    <span className="order-customer">{order.customerName}</span>
                  )}
                </div>
                <div className="order-header-right">
                  <span className="order-value">{formatCurrency(order.value)}</span>
                  <span className="order-date">{formatDate(order.createdAt)}</span>
                  <span className={`order-expand-icon ${expandedOrder === order.orderId ? 'expanded' : ''}`}>
                    ▼
                  </span>
                </div>
              </div>

              {expandedOrder === order.orderId && (
                <div className="order-details">
                  <div className="order-section">
                    <h4>Itens do Pedido</h4>
                    <div className="order-items">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="order-item">
                          <span className="item-title">{item.title}</span>
                          {item.variant && <span className="item-variant">({item.variant})</span>}
                          <span className="item-qty">x{item.quantity}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="order-section">
                    <h4>Endereço de Entrega</h4>
                    <div className="order-shipping">
                      {order.shipping.map((line, idx) => (
                        <p key={idx}>{line}</p>
                      ))}
                    </div>
                  </div>

                  {/* Campo de Código de Rastreio */}
                  <div className="order-section">
                    <h4>Código de Rastreio</h4>
                    {order.status === 'SHIPPED' && order.trackingCode ? (
                      <div className="tracking-saved">
                        <span className="tracking-code">{order.trackingCode}</span>
                        <span className="tracking-carrier">{order.carrier || 'Correios'}</span>
                        <span className="tracking-status">✓ Enviado</span>
                      </div>
                    ) : (
                      <div className="tracking-form">
                        <div className="tracking-input-group">
                          <input
                            type="text"
                            className="tracking-input"
                            placeholder="Ex: BR123456789BR"
                            value={trackingCodes[order.orderId] || ''}
                            onChange={(e) => handleTrackingChange(order.orderId, e.target.value)}
                            disabled={savingOrder === order.orderId}
                          />
                          <select
                            className="carrier-select"
                            value={carriers[order.orderId] || 'Correios'}
                            onChange={(e) => handleCarrierChange(order.orderId, e.target.value)}
                            disabled={savingOrder === order.orderId}
                          >
                            {CARRIERS.map(c => (
                              <option key={c.value} value={c.value}>{c.label}</option>
                            ))}
                          </select>
                        </div>
                        <button
                          className="btn-save-tracking"
                          onClick={() => handleSaveTracking(order.orderId)}
                          disabled={savingOrder === order.orderId || !trackingCodes[order.orderId]?.trim()}
                        >
                          {savingOrder === order.orderId ? 'Salvando...' : 'Salvar e Enviar'}
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="order-section order-dates">
                    <div>
                      <span className="date-label">Criado em:</span>
                      <span>{formatDate(order.createdAt)}</span>
                    </div>
                    {order.paidAt && (
                      <div>
                        <span className="date-label">Pago em:</span>
                        <span>{formatDate(order.paidAt)}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </AppShell>
  );
};

export default OrdersPage;
