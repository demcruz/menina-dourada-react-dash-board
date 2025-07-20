import axios from 'axios';

// URL base da sua API Java
const API_BASE_URL = 'http://localhost:9090/api/produtos'; // <<<<<<< CORRIGIDO PARA A API JAVA

// Função para buscar todos os produtos com paginação
export const getProducts = async (page = 0, size = 10) => { // Adicionado page e size como parâmetros
  try {
    const response = await axios.get(`${API_BASE_URL}/all`, {
      params: { page, size } // Passa os parâmetros de paginação
    });
    return response.data; // Retorna o objeto de paginação (content, totalPages, etc.)
  } catch (error) {
    console.error('Erro ao buscar produtos:', error);
    throw error;
  }
};

// Função para criar um novo produto
export const createProduct = async (productData) => {
  try {
    // Para o Java, o corpo da requisição pode precisar ser formatado de acordo com o que o seu ProductDTO/Entity espera.
    // Se você tiver um array de objetos de imagem, certifique-se de que o backend Java consegue deserializar.
    const response = await axios.post(`${API_BASE_URL}/insert`, productData); // <<<<<<< ENDPOINT CORRETO
    return response.data; // Retorna o produto criado
  } catch (error) {
    console.error('Erro ao criar produto:', error);
    throw error;
  }
};

// Função para buscar um produto por ID (se necessário no futuro para detalhes)
export const getProductById = async (productId) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/findById/${productId}`); // <<<<<<< ENDPOINT CORRETO
    return response.data;
  } catch (error) {
    console.error(`Erro ao buscar produto com ID ${productId}:`, error);
    throw error;
  }
};

// Função para atualizar um produto existente
export const updateProduct = async (productId, updatedProductData) => {
  try {
    const response = await axios.put(`${API_BASE_URL}/update/${productId}`, updatedProductData); // <<<<<<< ENDPOINT CORRETO
    return response.data; // Retorna o produto atualizado
  } catch (error) {
    console.error(`Erro ao atualizar produto com ID ${productId}:`, error);
    throw error;
  }
};

// Função para deletar um produto
export const deleteProduct = async (productId) => {
  try {
    await axios.delete(`${API_BASE_URL}/delete/${productId}`); // <<<<<<< ENDPOINT CORRETO
    return true;
  } catch (error) {
    console.error(`Erro ao deletar produto com ID ${productId}:`, error);
    throw error;
  }
};

// NOTA: O endpoint 'batch-insert' não será usado diretamente no CRUD do dashboard por enquanto, mas está disponível.