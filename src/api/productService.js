import axios from 'axios';

// API base URL (configurable via REACT_APP_API_BASE_URL).
// Prefer the env var in any environment, fallback to proxy in development.
const rawApiBaseUrl = process.env.REACT_APP_API_BASE_URL;
const API_BASE_URL = rawApiBaseUrl
  ? rawApiBaseUrl.replace(/\/+$/, '')
  : (process.env.NODE_ENV === 'development' ? '' : 'https://api.meninadourada.shop');





const normalizeProductId = (product) => product.id || product.productId || product._id || null;

const normalizeProduct = (product) => {
  if (!product || typeof product !== 'object') {
    return null;
  }

  const id = normalizeProductId(product);
  if (!id) {
    return null;
  }

  return {
    ...product,
    id,
    variacoes: Array.isArray(product.variacoes) ? product.variacoes : []
  };
};

const normalizeProductsResponse = (data) => {
  const content = Array.isArray(data?.content)
    ? data.content.map(normalizeProduct).filter(Boolean)
    : [];

  return {
    ...data,
    content
  };
};

// Função para buscar todos os produtos com paginação
export const getProducts = async (page = 0, size = 8) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/produtos/all`, {
      params: { page, size }
    });
    return normalizeProductsResponse(response.data);
  } catch (error) {
    console.error('Erro ao buscar produtos:', error);
    throw error;
  }
};

// Função para criar um novo produto (agora com suporte a FormData para imagens)
// productData: objeto JSON com nome, descricao, ativo, variacoes (sem imagens)
export const createProduct = async (productData, files = []) => {
  try {
    const formData = new FormData();
    // Adiciona o objeto JSON do produto como uma String
    formData.append('productData', JSON.stringify(productData));

    // CORREA�A�O AQUI: aceita File direto ou { file: File, colorName: '...' }
    files.forEach((fileEntry) => {
      const file = fileEntry instanceof File ? fileEntry : fileEntry?.file;
      if (file) {
        formData.append('files', file);
      }
    });

    const response = await axios.post(`${API_BASE_URL}/produtos`, formData, {
      headers: {
        // O Content-Type serA� automaticamente definido como multipart/form-data pelo navegador ao usar FormData
      }
    });
    return response.data;
  } catch (error) {
    console.error('Erro ao criar produto:', error);
    throw error;
  }
};

// Função para buscar um produto por ID
export const getProductById = async (productId) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/produtos/${productId}`);
    return normalizeProduct(response.data);
  } catch (error) {
    console.error(`Erro ao buscar produto com ID ${productId}:`, error);
    throw error;
  }
};

// Funcao para atualizar um produto existente
// productId: o ID do produto a ser atualizado
// updatedProductData: objeto JSON com nome, descricao, ativo, variacoes (sem imagens)
export const updateProduct = async (productId, updatedProductData) => {
  try {
    const response = await axios.put(`${API_BASE_URL}/produtos/${productId}`, updatedProductData, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    return response.data;
  } catch (error) {
    console.error(`Erro ao atualizar produto com ID ${productId}:`, error);
    throw error;
  }
};


// Funcao para deletar um produto
export const deleteProduct = async (productId) => {
  try {
    await axios.delete(`${API_BASE_URL}/produtos/${productId}`);
    return true;
  } catch (error) {
    console.error(`Erro ao deletar produto com ID ${productId}:`, error);
    throw error;
  }
};

// Funções para upload/delete de imagens avulsas (S3) - Mantidas caso precise no futuro
export const uploadImageToS3 = async (file) => {
  try {
    const formData = new FormData();
    formData.append('file', file);

    const response = await axios.post(`${API_BASE_URL}/images/upload`, formData, {
      headers: {}
    });
    return response.data;
  } catch (error) {
    console.error('Erro ao fazer upload da imagem para o S3:', error);
    throw error;
  }
};

export const deleteImageFromS3 = async (imageUrl) => {
  try {
    await axios.delete(`${API_BASE_URL}/images/delete`, {
      params: { imageUrl: imageUrl }
    });
    return true;
  } catch (error) {
    console.error(`Erro ao deletar imagem do S3 com URL ${imageUrl}:`, error);
    throw error;
  }
};







