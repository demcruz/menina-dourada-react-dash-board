// src/pages/ProductDashboardPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import DashboardLayout from '../templates/DashboardLayout/DashboardLayout';
import ProductListingTemplate from '../templates/ProductListingTemplate/ProductListingTemplate';
import ProductFormModal from '../organisms/ProductFormModal/ProductFormModal';
import ConfirmationModal from '../organisms/ConfirmationModal/ConfirmationModal';
// Removendo uploadImageToS3 e deleteImageFromS3 daqui, pois o backend fará isso
import { getProducts, createProduct, updateProduct, updateProductVariation, deleteProduct } from '../api/productService'; // <<<< deleteImageFromS3 removido
import Button from '../atoms/Button/Button';
import { pickImageUrl } from '../utils/imageUtils';

const ProductDashboardPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [products, setProducts] = useState([]);
  const [editingProduct, setEditingProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const [isSaving, setIsSaving] = useState(false);
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
    } finally {   setIsLoading(false);   }
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
      const variations = Array.isArray(productFromApi.variacoes) ? productFromApi.variacoes : [];
      const transformedProduct = {
        id: productFromApi.id,
        name: productFromApi.nome || productFromApi.name,
        description: productFromApi.descricao || productFromApi.description || '',
        price: variations[0]?.preco || 0,
        variacoes: variations,
        images: variations.map(variation => {
          const principalImage = variation.imagens?.find(img => img.isPrincipal) || variation.imagens?.[0];
          return {
            src: pickImageUrl(principalImage),
            alt: principalImage?.altText || '',
            colorName: variation.cor,
            file: null // Para imagens existentes, nAso hA� um objeto File novo
          };
        })
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
    setIsSaving(true);
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
      } finally {      setIsSaving(false);   }
    }
  };

  const handleSaveProduct = async (productDataFromForm) => {
    setIsSaving(true);
    setError(null);
    try {
      const imagesToProcess = productDataFromForm.images || [];

      const variationPayloads = imagesToProcess.map((imgData, index) => {
        const originalVariation = editingProduct?.variacoes?.[index];
        const variationId = originalVariation?.id || null;

        const variationData = {
          id: variationId,
          cor: imgData.colorName,
          tamanho: "Unico",
          preco: productDataFromForm.price,
          estoque: 100,
          imagens: [
            {
              url: imgData.file ? null : (imgData.src || null),
              altText: imgData.alt || `${productDataFromForm.name} - Cor ${imgData.colorName}`,
              isPrincipal: true
            }
          ]
        };

        return {
          id: variationId,
          data: variationData,
          file: imgData.file || null
        };
      });

      const productDataJson = {
        id: productDataFromForm.id,
        nome: productDataFromForm.name,
        descricao: productDataFromForm.description,
        ativo: true
      };

      const filesForCreate = variationPayloads.map((payload) => payload.file).filter(Boolean);

      if (productDataJson.id) {
        const newVariations = variationPayloads.filter((payload) => !payload.id);
        const newVariationFiles = newVariations.map((payload) => payload.file).filter(Boolean);
        const updatePayload = {
          ...productDataJson,
          ...(newVariations.length > 0 ? { variacoes: newVariations.map((payload) => payload.data) } : {})
        };

        await updateProduct(productDataJson.id, updatePayload, newVariationFiles);

        const existingVariations = variationPayloads.filter((payload) => payload.id);
        await Promise.all(existingVariations.map((payload) => (
          updateProductVariation(
            productDataJson.id,
            payload.id,
            payload.data,
            payload.file ? [payload.file] : []
          )
        )));
        showSuccessMessage('Produto atualizado com sucesso!');
      } else {
        const createPayload = {
          ...productDataJson,
          variacoes: variationPayloads.map((payload) => payload.data)
        };

        await createProduct(createPayload, filesForCreate);
        showSuccessMessage('Produto cadastrado com sucesso!');
      }
      setIsModalOpen(false);
      fetchProducts();
    } catch (err) {
      console.error("Erro ao salvar produto:", err.response?.data || err.message || err);
      setError(err.response?.data?.message || 'Falha ao salvar produto.');
    } finally {    setIsSaving(false);   }
  };

  return (
    <DashboardLayout onAddProduct={handleAddProduct}>
      {successMessage && <p className="success-message" role="status">{successMessage}</p>}

      {isLoading && <p className="loading-message">Carregando produtos...</p>}
      {error && <p className="error-message" role="alert">{error}</p>}
      
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
        isSaving={isSaving}
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


