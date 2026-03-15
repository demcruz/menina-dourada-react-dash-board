import axios from './axiosClient';

const rawApiBaseUrl = process.env.REACT_APP_API_BASE_URL;
const API_BASE_URL = rawApiBaseUrl
  ? rawApiBaseUrl.replace(/\/+$/, '')
  : (process.env.NODE_ENV === 'development' ? '' : 'https://api.meninadourada.shop');

// Buscar todos os pedidos
export const getOrders = async (cursor = null) => {
  try {
    const params = cursor ? { cursor } : {};
    const response = await axios.get(`${API_BASE_URL}/pedidos`, { params });
    return response.data;
  } catch (error) {
    console.error('Erro ao buscar pedidos:', error);
    throw error;
  }
};

// Buscar pedido por ID
export const getOrderById = async (orderId) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/pedidos/${orderId}`);
    return response.data;
  } catch (error) {
    console.error(`Erro ao buscar pedido ${orderId}:`, error);
    throw error;
  }
};

// Atualizar pedido com código de rastreio (muda status para SHIPPED)
export const updateOrderTracking = async (orderId, trackingCode, carrier) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/pedidos/${orderId}/rastreio`, {
      trackingCode,
      carrier
    });
    return response.data;
  } catch (error) {
    console.error(`Erro ao atualizar rastreio do pedido ${orderId}:`, error);
    throw error;
  }
};

// Atualizar status do pedido
export const updateOrderStatus = async (orderId, status) => {
  try {
    const response = await axios.patch(`${API_BASE_URL}/pedidos/${orderId}`, { status });
    return response.data;
  } catch (error) {
    console.error(`Erro ao atualizar pedido ${orderId}:`, error);
    throw error;
  }
};
