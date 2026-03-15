// src/pages/ProductDashboardPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import AppShell from '../components/layout/AppShell';
import ProductListingTemplate from '../templates/ProductListingTemplate/ProductListingTemplate';
import ProductFormModal from '../organisms/ProductFormModal/ProductFormModal';
import ConfirmationModal from '../organisms/ConfirmationModal/ConfirmationModal';
import { getProducts, getProductById, createProduct, updateProduct, deleteProduct } from '../api/productService';

const ProductDashboardPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [products, setProducts] = useState([]);
  const [editingProduct, setEditingProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState(null);

  const [page, setPage] = useState(0);
  // eslint-disable-next-line no-unused-vars
  const [pageSize, setPageSize] = useState(8);
  const [totalPages, setTotalPages] = useState(0);

  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);

  const [successMessage, setSuccessMessage] = useState(null);

  const showSuccessMessage = (message) => {
    setSuccessMessage(message);
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
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
      setError("Nao foi possivel carregar os produtos. Verifique se o backend Java esta rodando e o CORS esta configurado corretamente.");
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

  const handleEditProduct = async (productId) => {
    try {
      // Tenta buscar o produto completo por ID
      const productFromApi = await getProductById(productId);

      if (productFromApi) {
        setEditingProduct(productFromApi);
        setIsModalOpen(true);
      } else {
        // Fallback: usa os dados da listagem
        const productFromList = products.find(p => p.id === productId);
        if (productFromList) {
          setEditingProduct(productFromList);
          setIsModalOpen(true);
        } else {
          alert("Produto nao encontrado para edicao.");
        }
      }
    } catch (err) {
      console.error("Erro ao buscar produto por ID, usando dados da listagem:", err);
      // Fallback: usa os dados da listagem
      const productFromList = products.find(p => p.id === productId);
      if (productFromList) {
        setEditingProduct(productFromList);
        setIsModalOpen(true);
      } else {
        alert("Erro ao carregar produto para edição.");
      }
    }
  };

  const handleOpenConfirmDeleteModal = (productId) => {
    setProductToDelete(productId);
    setIsConfirmModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (productToDelete) {
      setIsDeleting(true);
      setError(null);
      try {
        await deleteProduct(productToDelete);
        showSuccessMessage('Produto excluido com sucesso!');
        fetchProducts();
        setIsConfirmModalOpen(false);
        setProductToDelete(null);
      } catch (err) {
        console.error("Erro ao excluir produto:", err);
        setError('Erro ao excluir produto. Verifique o console para mais detalhes.');
        setIsConfirmModalOpen(false);
        setProductToDelete(null);
      } finally {
        setIsDeleting(false);
      }
    }
  };

  const handleSaveProduct = async (productData, files = []) => {
    setIsSaving(true);
    setError(null);
    try {
      if (productData.id) {
        // Atualização - PUT com JSON completo
        await updateProduct(productData.id, productData, files);
        showSuccessMessage('Produto atualizado com sucesso!');
      } else {
        // Criação - POST com FormData
        await createProduct(productData, files);
        showSuccessMessage('Produto cadastrado com sucesso!');
      }
      setIsModalOpen(false);
      fetchProducts();
    } catch (err) {
      console.error("Erro ao salvar produto:", err.response?.data || err.message || err);
      setError(err.response?.data?.message || 'Falha ao salvar produto.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <AppShell
      pageTitle="Dashboard - MD"
      pageSubtitle="Gerencie seus produtos de moda praia"
      onAddProduct={handleAddProduct}
    >
      {successMessage && (
        <div className="alert alert-success" role="status">
          {successMessage}
        </div>
      )}

      {isLoading && (
        <div className="text-center" style={{ padding: 'var(--space-8)' }}>
          <div className="loading-spinner" style={{ margin: '0 auto' }}></div>
          <p className="text-secondary" style={{ marginTop: 'var(--space-2)' }}>
            Carregando produtos...
          </p>
        </div>
      )}

      {isDeleting && (
        <div className="text-center" style={{ padding: 'var(--space-8)' }}>
          <div className="loading-spinner" style={{ margin: '0 auto' }}></div>
          <p className="text-secondary" style={{ marginTop: 'var(--space-2)' }}>
            Excluindo produto...
          </p>
        </div>
      )}

      {error && (
        <div className="alert alert-error" role="alert">
          {error}
        </div>
      )}

      {!error && (
        <ProductListingTemplate
          products={products}
          isLoading={isLoading}
          onEditProduct={handleEditProduct}
          onDeleteProduct={handleOpenConfirmDeleteModal}
        />
      )}

      {!isLoading && !error && products.length > 0 && (
        <div className="pagination-controls">
          <button
            className="button secondary"
            onClick={() => setPage(prev => Math.max(0, prev - 1))}
            disabled={page === 0}
          >
            Anterior
          </button>
          <span className="pagination-info">
            Pagina {page + 1} de {totalPages}
          </span>
          <button
            className="button secondary"
            onClick={() => setPage(prev => Math.min(totalPages - 1, prev + 1))}
            disabled={page >= totalPages - 1}
          >
            Próximo
          </button>
        </div>
      )}

      <ProductFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSaveProduct}
        initialData={editingProduct}
        isSaving={isSaving}
      />

      <ConfirmationModal
        isOpen={isConfirmModalOpen}
        isProcessing={isDeleting}
        onClose={() => setIsConfirmModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Confirmar Exclusao"
        message="Tem certeza que deseja excluir este produto? Esta acao e irreversivel."
        confirmText="Excluir"
        confirmVariant="danger"
      />
    </AppShell>
  );
};

export default ProductDashboardPage;


