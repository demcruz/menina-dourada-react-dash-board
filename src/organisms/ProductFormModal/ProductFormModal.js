// src/organisms/ProductFormModal/ProductFormModal.jsx
import React, { useState, useEffect } from 'react';
import Modal from '../../atoms/Modal/Modal';
import Button from '../../atoms/Button/Button';
import FormField from '../../molecules/FormField/FormField';
import ImageUploadGroup from '../../molecules/ImageUploadGroup/ImageUploadGroup';
import PlusIcon from '../../atoms/PlusIcon';
import './ProductFormModal.css';

const ProductFormModal = ({ isOpen, onClose, onSubmit, initialData = null }) => {
  // Estados para os campos do formulário
  const [productName, setProductName] = useState('');
  const [productPrice, setProductPrice] = useState('');
  // Estrutura para as imagens no formulário: { file: File, colorName: string, filePreviewUrl: string }
  const [productImages, setProductImages] = useState([{ file: null, colorName: '', filePreviewUrl: null }]);

  // Efeito para preencher o formulário quando em modo de edição (`initialData` é fornecido)
  useEffect(() => {
    if (isOpen && initialData) {
      // Quando editando, 'initialData' vem de ProductDashboardPage
      // e já está em um formato mais "plano" para o formulário (name, price, images[])
      setProductName(initialData.name || '');
      setProductPrice(initialData.price !== undefined ? initialData.price : '');

      // Mapeia as imagens do 'initialData' para o formato do estado do formulário
      // Garante que 'filePreviewUrl' seja a 'src' existente
      if (initialData.images && initialData.images.length > 0) {
        setProductImages(initialData.images.map(img => ({
          file: null, // Não há arquivo real, apenas a URL da imagem existente
          colorName: img.colorName || '',
          filePreviewUrl: img.src || '' // Usa a URL existente para pré-visualização
        })));
      } else {
        // Se o produto existir mas não tiver imagens (improvável, mas para segurança)
        setProductImages([{ file: null, colorName: '', filePreviewUrl: null }]);
      }
    } else if (isOpen && !initialData) {
      // Reseta o formulário para adicionar novo produto
      setProductName('');
      setProductPrice('');
      setProductImages([{ file: null, colorName: '', filePreviewUrl: null }]);
    }
  }, [isOpen, initialData]); // O efeito roda quando o modal abre/fecha ou initialData muda

  // Lida com a mudança do arquivo de imagem
  const handleImageFileChange = (index, file) => {
    const newImages = [...productImages];
    newImages[index].file = file;
    // Cria uma URL temporária para pré-visualização da imagem recém-selecionada
    newImages[index].filePreviewUrl = file ? URL.createObjectURL(file) : null;
    setProductImages(newImages);
  };

  // Lida com a mudança do nome da cor da imagem
  const handleImageColorChange = (index, colorName) => {
    const newImages = [...productImages];
    newImages[index].colorName = colorName;
    setProductImages(newImages);
  };

  // Adiciona um novo campo de upload de imagem
  const addImageUploadField = () => {
    setProductImages([...productImages, { file: null, colorName: '', filePreviewUrl: null }]);
  };

  // Remove um campo de upload de imagem
  const removeImageUploadField = (indexToRemove) => {
    // Garante que haja pelo menos um campo de imagem para evitar um formulário vazio
    if (productImages.length > 1) {
      setProductImages(productImages.filter((_, index) => index !== indexToRemove));
    } else {
      alert('O produto deve ter pelo menos uma imagem.');
    }
  };

  // Lida com o envio do formulário
  const handleSubmit = (e) => {
    e.preventDefault();

    // --- Validações básicas ---
    if (!productName.trim()) {
      alert('O nome do produto é obrigatório.');
      return;
    }
    const priceValue = parseFloat(productPrice);
    if (isNaN(priceValue) || priceValue <= 0) {
      alert('O preço do produto deve ser um número válido e maior que zero.');
      return;
    }
    // A validação abaixo já garante que 'productImages' é um array não vazio.
    // O erro 'undefined' vinha mais provavelmente da 'ProductDashboardPage'
    // ao receber os dados.
    if (productImages.length === 0 || productImages.some(img => !img.filePreviewUrl && !img.file)) {
      alert('Você deve adicionar pelo menos uma imagem para o produto.');
      return;
    }
    if (productImages.some(img => !img.colorName.trim())) {
      alert('Todas as imagens devem ter um nome de cor.');
      return;
    }

    // --- Preparação dos dados para a API Java ---
    // Transforma os dados do estado do formulário para o formato esperado pela API
    // NOTA IMPORTANTE: Para uploads de arquivos de imagem REAIS,
    // a lógica aqui seria mais complexa. Primeiro você faria o upload dos 'img.file'
    // para um endpoint de upload de imagens (que retornaria a URL), e só então
    // enviaria essas URLs no objeto de produto. Por enquanto, usamos 'filePreviewUrl'/'src'
    // como a 'url' da imagem, o que é suficiente para exibir e simular o envio.

    const productDataForParent = {
      id: initialData ? initialData.id : null, // Inclui o ID se for edição
      name: productName, // 'name' no formulário, será 'nome' na API
      price: priceValue, // 'price' no formulário
      // 'images' aqui é o array que será passado para 'ProductDashboardPage' e depois transformado em 'variacoes'
      images: productImages.map((img) => ({
        src: img.filePreviewUrl || img.src, // URL para exibição/envio
        alt: img.alt || `${productName} - Cor ${img.colorName}`,
        colorName: img.colorName,
        file: img.file // O arquivo real (se um novo foi selecionado)
      }))
    };

    // Chama a função onSubmit (passada da ProductDashboardPage) com os dados formatados
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

        <div className="form-images-section">
          <label className="form-images-label">Imagens do Produto</label>
          <div className="image-upload-groups-container">
            {productImages.map((img, index) => (
              <ImageUploadGroup
                key={index} // Idealmente usar um ID único aqui se cada imagem já tiver um ID
                index={index}
                onRemove={removeImageUploadField}
                onFileChange={handleImageFileChange}
                onColorChange={handleImageColorChange}
                colorValue={img.colorName}
                filePreviewUrl={img.filePreviewUrl} // Passa a URL para pré-visualização
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
