// src/pages/ProductDashboardPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import DashboardLayout from '../templates/DashboardLayout/DashboardLayout';
import ProductListingTemplate from '../templates/ProductListingTemplate/ProductListingTemplate';
import ProductFormModal from '../organisms/ProductFormModal/ProductFormModal';
import ConfirmationModal from '../organisms/ConfirmationModal/ConfirmationModal';
import { getProducts, createProduct, updateProduct, deleteProduct } from '../api/productService';
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
  const [totalPages, setTotalPages] = useState(0);

  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);

  const [successMessage, setSuccessMessage] = useState(null);

  // Função para exibir mensagem de sucesso temporária
  const showSuccessMessage = (message) => {
    setSuccessMessage(message);
    const timer = setTimeout(() => {
      setSuccessMessage(null);
    }, 3000); // Mensagem desaparece após 3 segundos
    return () => clearTimeout(timer); // Limpa o timer se o componente for desmontado
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
      setError("Não foi possível carregar os produtos. Verifique se o backend Java está rodando e o CORS está configurado.");
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
      // Transforma a estrutura da API (aninhada) para o formato "plano" que o formulário espera
      const transformedProduct = {
        id: productFromApi.id,
        name: productFromApi.nome,
        description: productFromApi.descricao,
        price: productFromApi.variacoes?.[0]?.preco || 0, // Pega o preço da primeira variação
        images: productFromApi.variacoes.map(variation => ({
          // Pega a URL da imagem principal ou a primeira imagem da variação
          src: variation.imagens?.find(img => img.isPrincipal)?.url || variation.imagens?.[0]?.url || '',
          // Pega o texto alternativo da imagem principal ou da primeira imagem
          alt: variation.imagens?.find(img => img.isPrincipal)?.altText || variation.imagens?.[0]?.altText || '',
          colorName: variation.cor,
          file: null // Não há arquivo real, apenas a URL da imagem existente
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
      setIsLoading(true); // Ativa loading para a exclusão
      setError(null); // Limpa erros anteriores
      try {
        await deleteProduct(productToDelete);
        showSuccessMessage('Produto excluído com sucesso!'); // Exibe mensagem de sucesso
        fetchProducts(); // Recarrega a lista
        setIsConfirmModalOpen(false);
        setProductToDelete(null);
      } catch (err) {
        console.error("Erro ao excluir produto:", err);
        setError('Erro ao excluir produto. Verifique o console para mais detalhes.');
        setIsConfirmModalOpen(false);
        setProductToDelete(null);
      } finally {
        setIsLoading(false); // Desativa loading
      }
    }
  };

  const handleSaveProduct = async (productDataFromForm) => {
    setIsLoading(true); // Ativa loading para salvar
    setError(null);
    try {
      // --- INÍCIO DA MUDANÇA PARA TRATAR O ERRO "CANNOT READ PROPERTIES OF UNDEFINED (READING 'MAP')" ---
      // Garante que productDataFromForm.images é um array.
      // Se for undefined ou null, ele se torna um array vazio, evitando o erro .map().
      const imagesToProcess = productDataFromForm.images || [];
      // --- FIM DA MUDANÇA ---

      const transformedDataForApi = {
        id: productDataFromForm.id,
        nome: productDataFromForm.name,
        descricao: productDataFromForm.description || 'Descrição padrão do produto.',
        ativo: true,
        // Agora usamos 'imagesToProcess' que é garantidamente um array
        variacoes: imagesToProcess.map((img, index) => {
          // Lógica para mapear variações existentes para edição
          // Acessa as variações do 'editingProduct' original para tentar reutilizar IDs
          const originalVariation = editingProduct?.variacoes?.[index];
          return {
            id: originalVariation?.id || null, // Reusa o ID da variação existente se houver
            cor: img.colorName,
            tamanho: "Único", // Valor padrão, pode ser um campo no formulário futuramente
            preco: productDataFromForm.price, // Usa o preço do formulário para todas as variações criadas
            estoque: 100, // Valor padrão de estoque, pode ser um campo no formulário futuramente
            imagens: [
              {
                url: img.filePreviewUrl || img.src, // Usa a URL de preview (para novos arquivos) ou a URL existente (para edição)
                altText: img.alt || `${productDataFromForm.name} - Cor ${img.colorName}`,
                isPrincipal: true // Define como principal por padrão para simplificar
              }
            ]
          };
        })
      };

      if (transformedDataForApi.id) {
        // Se for edição, o ID já está no objeto transformedDataForApi
        const { id, ...dataToUpdate } = transformedDataForApi; // Extrai o ID para passar na URL
        await updateProduct(id, dataToUpdate);
        showSuccessMessage('Produto atualizado com sucesso!'); // Mensagem de sucesso
      } else {
        // Se for criação, não há ID no objeto (será gerado pelo backend)
        await createProduct(transformedDataForApi);
        showSuccessMessage('Produto cadastrado com sucesso!'); // Mensagem de sucesso
      }
      setIsModalOpen(false); // Fecha o modal após salvar
      fetchProducts(); // Recarrega a lista de produtos para ver as alterações
    } catch (err) {
      console.error("Erro ao salvar produto:", err.response?.data || err.message || err);
      // Exibe a mensagem de erro da API ou uma genérica
      setError(err.response?.data?.message || 'Falha ao salvar produto.');
    } finally {
      setIsLoading(false); // Desativa loading
    }
  };

  return (
    <DashboardLayout onAddProduct={handleAddProduct}>
      {/* Mensagem de sucesso */}
      {successMessage && <p className="success-message">{successMessage}</p>}

      {isLoading && <p className="loading-message">Carregando produtos...</p>}
      {error && <p className="error-message">{error}</p>}
      
      {/* Exibir a listagem de produtos SOMENTE se não estiver carregando E não houver erro */}
      {!isLoading && !error && (
        <ProductListingTemplate
          products={products}
          onEditProduct={handleEditProduct}
          onDeleteProduct={handleOpenConfirmDeleteModal}
        />
      )}
      
      {/* Controles de Paginação (visíveis apenas se não estiver carregando, sem erro e tiver produtos) */}
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
