import axios from 'axios';

// Nova URL base da sua API Java (IP da EC2)
const API_BASE_URL = '/api';

// Função para buscar todos os produtos com paginação
export const getProducts = async (page = 0, size = 8) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/produtos/all`, {
      params: { page, size }
    });
    return response.data;
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

    // CORREÇÃO AQUI: Itera sobre o array de objetos 'files' e anexa APENAS o 'file' real
    files.forEach((fileObject) => { // 'fileObject' é o objeto { file: File, colorName: '...' }
      if (fileObject.file) { // Garante que é um objeto File real e não nulo/indefinido
        formData.append(`files`, fileObject.file); // Anexa APENAS o objeto File
      }
    });

    const response = await axios.post(`${API_BASE_URL}/produtos/insert`, formData, {
      headers: {
        // O Content-Type será automaticamente definido como multipart/form-data pelo navegador ao usar FormData
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
    const response = await axios.get(`${API_BASE_URL}/produtos/findById/${productId}`);
    return response.data;
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

    // CORREÇÃO AQUI: Itera sobre o array de objetos 'files' e anexa APENAS o 'file' real
    files.forEach((fileObject) => { // 'fileObject' é o objeto { file: File, colorName: '...' }
      if (fileObject.file) { // Garante que é um objeto File real e não nulo/indefinido
        formData.append(`files`, fileObject.file); // Anexa APENAS o objeto File
      }
    });

    const response = await axios.put(`${API_BASE_URL}/produtos/update/${productId}`, formData, {
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

// Função para deletar um produto
export const deleteProduct = async (productId) => {
  try {
    await axios.delete(`${API_BASE_URL}/produtos/delete/${productId}`);
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
