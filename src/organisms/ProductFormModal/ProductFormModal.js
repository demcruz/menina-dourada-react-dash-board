// src/organisms/ProductFormModal/ProductFormModal.jsx
import React, { useState, useEffect } from 'react';
import Modal from '../../atoms/Modal/Modal';
import Button from '../../atoms/Button/Button';
import FormField from '../../molecules/FormField/FormField';
import ImageUploadGroup from '../../molecules/ImageUploadGroup/ImageUploadGroup';
import PlusIcon from '../../atoms/PlusIcon';
import './ProductFormModal.css';

const ProductFormModal = ({ isOpen, onClose, onSubmit, initialData = null, isSaving = false }) => {
  const [productName, setProductName] = useState('');
  const [productPrice, setProductPrice] = useState('');
  const [productDescription, setProductDescription] = useState('');

  const [productImages, setProductImages] = useState([{ file: null, colorName: '', filePreviewUrl: null }]);

  useEffect(() => {
    if (isOpen && initialData) {
      setProductName(initialData.name || '');
      setProductPrice(initialData.price !== undefined && initialData.price !== null ? String(initialData.price) : '');
      setProductDescription(initialData.description || '');

      if (initialData.images && initialData.images.length > 0) {
        setProductImages(initialData.images.map(img => ({
          file: null,
          colorName: img.colorName || '',
          filePreviewUrl: img.src || ''
        })));
      } else {
        setProductImages([{ file: null, colorName: '', filePreviewUrl: null }]);
      }
    } else if (isOpen && !initialData) {
      setProductName('');
      setProductPrice('');
      setProductDescription('');
      setProductImages([{ file: null, colorName: '', filePreviewUrl: null }]);
    }
  }, [isOpen, initialData]);

  const handleImageFileChange = (index, file) => {
    const newImages = [...productImages];
    newImages[index].file = file;
    newImages[index].filePreviewUrl = file ? URL.createObjectURL(file) : null;
    setProductImages(newImages);
  };

  const handleImageColorChange = (index, colorName) => {
    const newImages = [...productImages];
    newImages[index].colorName = colorName;
    setProductImages(newImages);
  };

  const addImageUploadField = () => {
    setProductImages([...productImages, { file: null, colorName: '', filePreviewUrl: null }]);
  };

  const removeImageUploadField = (indexToRemove) => {
    if (productImages.length > 1) {
      setProductImages(productImages.filter((_, index) => index !== indexToRemove));
    } else {
      alert('O produto deve ter pelo menos uma imagem.');
    }
  };
  const handleModalClose = () => {
    if (isSaving) {
      return;
    }
    onClose();
  };


  const handleSubmit = (e) => {
    if (isSaving) {
      return;
    }
    e.preventDefault();

    if (!productName.trim()) {
      alert('O nome do produto é obrigatório.');
      return;
    }
    const normalizedPrice = productPrice.replace(",", ".").trim();
    const priceValue = Number.parseFloat(normalizedPrice);
    const roundedPrice = Math.round(priceValue * 100) / 100;
    if (Number.isNaN(roundedPrice) || roundedPrice <= 0) {
      alert('O preço do produto deve ser um número válido e maior que zero.');
      return;
    }
    if (productImages.length === 0 || productImages.some(img => (!img.filePreviewUrl && !img.file) || !img.colorName.trim())) {
      alert('Você deve adicionar pelo menos uma imagem e sua cor para cada.');
      return;
    }

    const productDataForParent = {
      id: initialData ? initialData.id : null,
      name: productName,
      price: roundedPrice,
      description: productDescription.trim(),
      images: productImages.map((img) => ({
        src: img.filePreviewUrl || img.src,
        alt: img.alt || `${productName} - Cor ${img.colorName}`,
        colorName: img.colorName,
        file: img.file
      }))
    };

    onSubmit(productDataForParent);
  };
  return (
    <Modal isOpen={isOpen} onClose={handleModalClose}>
      <div className="product-form-modal">
        <div className="modal-header">
          <h3 className="modal-title">{initialData ? 'Editar Produto' : 'Adicionar Novo Produto'}</h3>
          <Button onClick={handleModalClose} className="icon-only close-modal-button" disabled={isSaving} icon={() => (
            <svg xmlns="http://www.w3.org/2000/svg" className="button-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          )} />
        </div>

        <form onSubmit={handleSubmit} className="product-form">
          <FormField
            label="Nome do Produto"
            id="productName"
            value={productName}
            onChange={(e) => setProductName(e.target.value)}
            required
          />
          <FormField
            label="Preço (R$)"
            id="productPrice"
            type="number"
            min="0"
            step="0.01"
            value={productPrice}
            onChange={(e) => setProductPrice(e.target.value)}
            required
          />
          <FormField
            label="Descrição do Produto"
            id="productDescription"
            value={productDescription}
            onChange={(e) => setProductDescription(e.target.value)}
          />

          <div className="form-images-section">
            <label className="form-images-label">Imagens do Produto</label>
            <div className="image-upload-groups-container">
              {productImages.map((img, index) => (
                <ImageUploadGroup
                  key={index}
                  index={index}
                  onRemove={removeImageUploadField}
                  onFileChange={handleImageFileChange}
                  onColorChange={handleImageColorChange}
                  colorValue={img.colorName}
                  filePreviewUrl={img.filePreviewUrl}
                  showRemoveButton={productImages.length > 1 || (img.filePreviewUrl && !img.file)}
                />
              ))}
            </div>
          </div>

          <Button
            type="button"
            onClick={addImageUploadField}
            className="add-image-button"
            icon={PlusIcon}
          >
            Adicionar outra imagem
          </Button>

          <div className="form-actions">
            <Button type="button" onClick={handleModalClose} variant="secondary" disabled={isSaving}>Cancelar</Button>
            <Button type="submit" variant="primary" disabled={isSaving}>
              {isSaving && <span className="button-spinner" aria-hidden="true" />}
              {isSaving ? 'Salvando...' : 'Salvar Produto'}
            </Button>
          </div>
        </form>

        {isSaving && (
          <div className="modal-saving-overlay" aria-live="polite">
            <div className="modal-saving-card">
              <span className="modal-spinner" aria-hidden="true" />
              Salvando produto...
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default ProductFormModal;
