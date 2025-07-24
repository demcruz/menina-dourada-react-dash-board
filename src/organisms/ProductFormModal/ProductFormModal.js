// src/organisms/ProductFormModal/ProductFormModal.jsx
import React, { useState, useEffect } from 'react';
import Modal from '../../atoms/Modal/Modal';
import Button from '../../atoms/Button/Button';
import FormField from '../../molecules/FormField/FormField';
import ImageUploadGroup from '../../molecules/ImageUploadGroup/ImageUploadGroup';
import PlusIcon from '../../atoms/PlusIcon';
import './ProductFormModal.css';

const ProductFormModal = ({ isOpen, onClose, onSubmit, initialData = null }) => {
  const [productName, setProductName] = useState('');
  const [productPrice, setProductPrice] = useState('');
  // const [productDescription, setProductDescription] = useState(''); // CAMPO DE DESCRIÇÃO COMENTADO

  const [productImages, setProductImages] = useState([{ file: null, colorName: '', filePreviewUrl: null }]);

  useEffect(() => {
    if (isOpen && initialData) {
      setProductName(initialData.name || '');
      setProductPrice(initialData.price !== undefined && initialData.price !== null ? String(initialData.price) : '');
      // setProductDescription(initialData.description || ''); // CAMPO DE DESCRIÇÃO COMENTADO

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
      // setProductDescription(''); // CAMPO DE DESCRIÇÃO COMENTADO
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

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!productName.trim()) {
      alert('O nome do produto é obrigatório.');
      return;
    }
    const priceValue = parseFloat(productPrice);
    if (isNaN(priceValue) || priceValue <= 0) {
      alert('O preço do produto deve ser um número válido e maior que zero.');
      return;
    }
    // if (!productDescription.trim()) { // CAMPO DE DESCRIÇÃO COMENTADO
    //     alert('A descrição do produto é obrigatória.');
    //     return;
    // }
    if (productImages.length === 0 || productImages.some(img => (!img.filePreviewUrl && !img.file) || !img.colorName.trim())) {
      alert('Você deve adicionar pelo menos uma imagem e sua cor para cada.');
      return;
    }

    const productDataForParent = {
      id: initialData ? initialData.id : null,
      name: productName,
      price: priceValue,
      // description: productDescription, // CAMPO DE DESCRIÇÃO COMENTADO
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
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="modal-header">
        <h3 className="modal-title">{initialData ? 'Editar Produto' : 'Adicionar Novo Produto'}</h3>
        <Button onClick={onClose} className="icon-only close-modal-button" icon={() => (
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
        {/* NOVO CAMPO: Descrição do Produto - COMENTADO */}
        {/*
        <FormField
          label="Descrição do Produto"
          id="productDescription"
          value={productDescription}
          onChange={(e) => setProductDescription(e.target.value)}
          required
        />
        */}

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
                // Passa 'true' se houver mais de um campo de imagem ou se for um campo existente com URL
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
          <Button type="button" onClick={onClose} variant="secondary">Cancelar</Button>
          <Button type="submit" variant="primary">Salvar Produto</Button>
        </div>
      </form>
    </Modal>
  );
};

export default ProductFormModal;
