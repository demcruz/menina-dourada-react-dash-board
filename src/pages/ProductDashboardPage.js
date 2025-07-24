// src/pages/ProductDashboardPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import DashboardLayout from '../templates/DashboardLayout/DashboardLayout';
import ProductListingTemplate from '../templates/ProductListingTemplate/ProductListingTemplate';
import ProductFormModal from '../organisms/ProductFormModal/ProductFormModal';
import ConfirmationModal from '../organisms/ConfirmationModal/ConfirmationModal';
// Removendo uploadImageToS3 e deleteImageFromS3 daqui, pois o backend fará isso
import { getProducts, createProduct, updateProduct, deleteProduct } from '../api/productService'; // <<<< deleteImageFromS3 removido
import Button from '../atoms/Button/Button';

const ProductDashboardPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [products, setProducts] = useState([]);
  const [editingProduct, setEditingProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [page, setPage] = useState(0);
  // eslint-disable-next-line no-unused-vars
  const [pageSize, setPageSize] = useState(8);
  const [totalPages, setTotalPages] = useState(0); // Renomeado para evitar conflito

  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);

  const [successMessage, setSuccessMessage] = useState(null);

  const showSuccessMessage = (message) => {
    setSuccessMessage(message);
    const timer = setTimeout(() => {
      setSuccessMessage(null);
    }, 3000);
    return () => clearTimeout(timer);
  };

  const fetchProducts = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await getProducts(page, pageSize);
      setProducts(response.content);
      setTotalPages(response.totalPages);
    } catch (err) {
      console.error("Falha ao carregar produtos:", err);
      setError("Não foi possível carregar os produtos. Verifique se o backend Java está rodando e o CORS está configurado corretamente.");
    } finally {
      setIsLoading(false);
    }
  }, [page, pageSize]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleAddProduct = () => {
    setEditingProduct(null);
    setIsModalOpen(true);
  };

  const handleEditProduct = (productId) => {
    const productFromApi = products.find(p => p.id === productId);

    if (productFromApi) {
      const transformedProduct = {
        id: productFromApi.id,
        name: productFromApi.nome,
        // description: productFromApi.descricao || '', // COMENTADO: Descomentar quando a API estiver pronta
        price: productFromApi.variacoes?.[0]?.preco || 0,
        images: productFromApi.variacoes.map(variation => ({
          src: variation.imagens?.find(img => img.isPrincipal)?.url || variation.imagens?.[0]?.url || '',
          alt: variation.imagens?.find(img => img.isPrincipal)?.altText || variation.imagens?.[0]?.altText || '',
          colorName: variation.cor,
          file: null // Para imagens existentes, não há um objeto File novo
        }))
      };
      setEditingProduct(transformedProduct);
      setIsModalOpen(true);
    } else {
      alert("Produto não encontrado para edição.");
    }
  };

  const handleOpenConfirmDeleteModal = (productId) => {
    setProductToDelete(productId);
    setIsConfirmModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (productToDelete) {
      setIsLoading(true);
      setError(null);
      try {
        // A API de backend é responsável por deletar as imagens do S3 ao deletar o produto.
        // Não precisamos chamar deleteImageFromS3 aqui no frontend para cada imagem.
        // Apenas chamamos a API de exclusão do produto.
        await deleteProduct(productToDelete); 
        showSuccessMessage('Produto excluído com sucesso!');
        fetchProducts();
        setIsConfirmModalOpen(false);
        setProductToDelete(null);
      } catch (err) {
        console.error("Erro ao excluir produto:", err);
        setError('Erro ao excluir produto. Verifique o console para mais detalhes.');
        setIsConfirmModalOpen(false);
        setProductToDelete(null);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleSaveProduct = async (productDataFromForm) => {
    setIsLoading(true);
    setError(null);
    try {
      const imagesToProcess = productDataFromForm.images || [];
      // Filtra APENAS os objetos File reais que foram selecionados pelo usuário
      const filesToUpload = imagesToProcess.filter(img => img.file); 

      // Mapeia as imagens do formulário para o formato de variações que a API espera.
      // Para novas imagens (com 'file'), a URL será null/vazia aqui, pois o backend irá gerá-la.
      // Para imagens existentes (sem 'file'), a URL original será mantida.
      const transformedVariationsForApi = imagesToProcess.map((imgData, index) => {
        const originalVariation = editingProduct?.variacoes?.[index];
        return {
          id: originalVariation?.id || null, // Reusa o ID da variação existente se houver
          cor: imgData.colorName,
          tamanho: "Único", // Pode precisar ser dinâmico no futuro
          preco: productDataFromForm.price,
          estoque: 100, // Pode precisar ser dinâmico no futuro
          imagens: [
            {
              // Se for um novo arquivo, a URL será gerada pelo backend.
              // Se for uma imagem existente, usamos a URL original.
              url: imgData.file ? null : (imgData.src || null), 
              altText: imgData.alt || `${productDataFromForm.name} - Cor ${imgData.colorName}`,
              isPrincipal: true
            }
          ]
        };
      });

      const productDataJson = {
        id: productDataFromForm.id,
        nome: productDataFromForm.name,
        // descricao: productDataFromForm.description, // COMENTADO: Descomentar quando a API estiver pronta
        ativo: true,
        variacoes: transformedVariationsForApi // <<<< Variável usada corretamente aqui
      };

      // 1. Chama a API de produto (create ou update)
      // Passa o JSON do produto E os arquivos reais (File objects)
      if (productDataJson.id) {
        // Para atualização (PUT), o ID é passado na URL, e o JSON e arquivos no corpo
        await updateProduct(productDataJson.id, productDataJson, filesToUpload);
        showSuccessMessage('Produto atualizado com sucesso!');
      } else {
        // Para criação (POST), o JSON e arquivos no corpo
        await createProduct(productDataJson, filesToUpload);
        showSuccessMessage('Produto cadastrado com sucesso!');
      }
      setIsModalOpen(false);
      fetchProducts();
    } catch (err) {
      console.error("Erro ao salvar produto:", err.response?.data || err.message || err);
      setError(err.response?.data?.message || 'Falha ao salvar produto.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DashboardLayout onAddProduct={handleAddProduct}>
      {successMessage && <p className="success-message">{successMessage}</p>}

      {isLoading && <p className="loading-message">Carregando produtos...</p>}
      {error && <p className="error-message">{error}</p>}
      
      {!isLoading && !error && (
        <ProductListingTemplate
          products={products}
          onEditProduct={handleEditProduct}
          onDeleteProduct={handleOpenConfirmDeleteModal}
        />
      )}
      
      {!isLoading && !error && products.length > 0 && (
        <div className="pagination-controls">
          <Button
            onClick={() => setPage(prev => Math.max(0, prev - 1))}
            disabled={page === 0}
            variant="secondary"
          >
            Anterior
          </Button>
          <span className="pagination-info">Página {page + 1} de {totalPages}</span>
          <Button
            onClick={() => setPage(prev => Math.min(totalPages - 1, prev + 1))}
            disabled={page >= totalPages - 1}
            variant="secondary"
          >
            Próximo
          </Button>
        </div>
      )}

      <ProductFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSaveProduct}
        initialData={editingProduct}
      />

      <ConfirmationModal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Confirmar Exclusão"
        message="Tem certeza que deseja excluir este produto? Esta ação é irreversível."
        confirmText="Excluir"
        confirmVariant="danger"
      />
    </DashboardLayout>
  );
};

export default ProductDashboardPage;
