import axios from 'axios';

// URL base da API (configuravel por REACT_APP_API_BASE_URL)
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://api.meninadourada.shop';





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
// files: array de objetos que contêm o File real (ex: [{ file: File, colorName: '...' }])
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

// Função para atualizar um produto existente (agora com suporte a FormData para imagens)
// productId: o ID do produto a ser atualizado
// updatedProductData: objeto JSON com nome, descricao, ativo, variacoes (sem imagens)
// files: array de objetos que contêm o File real (ex: [{ file: File, colorName: '...' }])
export const updateProduct = async (productId, updatedProductData, files = []) => {
  try {
    const formData = new FormData();
    // Adiciona o objeto JSON do produto atualizado como uma String
    formData.append('productData', JSON.stringify(updatedProductData));

    // CORREA�A�O AQUI: aceita File direto ou { file: File, colorName: '...' }
    files.forEach((fileEntry) => {
      const file = fileEntry instanceof File ? fileEntry : fileEntry?.file;
      if (file) {
        formData.append('files', file);
      }
    });

    const response = await axios.put(`${API_BASE_URL}/produtos/${productId}`, formData, {
      headers: {
        // Deixe o navegador definir o Content-Type automaticamente para FormData
      }
    });
    return response.data;
  } catch (error) {
    console.error(`Erro ao atualizar produto com ID ${productId}:`, error);
    throw error;
  }
};

// Funcao para atualizar uma variacao existente de um produto (com suporte a FormData para imagens)
// productId: ID do produto
// variationId: ID da variacao
// updatedVariationData: objeto JSON com cor, tamanho, preco, estoque, imagens
// files: array de objetos que contem o File real (ex: [File] ou [{ file: File }])
export const updateProductVariation = async (productId, variationId, updatedVariationData, files = []) => {
  try {
    const formData = new FormData();
    formData.append('variationData', JSON.stringify(updatedVariationData));

    files.forEach((fileEntry) => {
      const file = fileEntry instanceof File ? fileEntry : fileEntry?.file;
      if (file) {
        formData.append('files', file);
      }
    });

    const response = await axios.put(`${API_BASE_URL}/produtos/${productId}/variacoes/${variationId}`, formData, {
      headers: {}
    });
    return response.data;
  } catch (error) {
    console.error(`Erro ao atualizar variacao ${variationId} do produto ${productId}:`, error);
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







