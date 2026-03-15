import axios from './axiosClient';

// API base URL (configurable via REACT_APP_API_BASE_URL).
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

/**
 * Cria um novo produto com o novo formato JSON
 * @param {Object} productData - Dados do produto no novo formato:
 *   {
 *     nome, descricao, ativo, ufCadastro, categoria, marca, tags[],
 *     variacoes: [{ sku, cor, tamanho, estoque, custoUnitario, precoVenda, peso, dimensoes, imagens }]
 *   }
 * @param {Array} files - Array de objetos { file, variacaoIndex, imagemIndex }
 */
export const createProduct = async (productData, files = []) => {
  try {
    const formData = new FormData();
    
    // Adiciona o objeto JSON do produto
    formData.append('productData', JSON.stringify(productData));

    // Adiciona os arquivos de imagem
    files.forEach((fileEntry) => {
      const file = fileEntry instanceof File ? fileEntry : fileEntry?.file;
      if (file) {
        formData.append('files', file);
      }
    });

    const response = await axios.post(`${API_BASE_URL}/produtos`, formData, {
      headers: {
        // Content-Type será automaticamente definido como multipart/form-data
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

/**
 * Atualiza um produto existente com o novo formato JSON
 * @param {string} productId - ID do produto
 * @param {Object} updatedProductData - Dados atualizados no novo formato
 * @param {Array} files - Array de novos arquivos de imagem (opcional)
 */
export const updateProduct = async (productId, updatedProductData, files = []) => {
  try {
    // Se há novos arquivos, usa FormData
    if (files && files.length > 0) {
      const formData = new FormData();
      formData.append('productData', JSON.stringify(updatedProductData));
      
      files.forEach((fileEntry) => {
        const file = fileEntry instanceof File ? fileEntry : fileEntry?.file;
        if (file) {
          formData.append('files', file);
        }
      });

      const response = await axios.put(`${API_BASE_URL}/produtos/${productId}`, formData, {
        headers: {
          // Content-Type será automaticamente definido como multipart/form-data
        }
      });
      return response.data;
    }

    // Sem novos arquivos, envia JSON direto
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

// Função para deletar um produto
export const deleteProduct = async (productId) => {
  try {
    await axios.delete(`${API_BASE_URL}/produtos/${productId}`);
    return true;
  } catch (error) {
    console.error(`Erro ao deletar produto com ID ${productId}:`, error);
    throw error;
  }
};

// Funções para upload/delete de imagens avulsas (S3)
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
