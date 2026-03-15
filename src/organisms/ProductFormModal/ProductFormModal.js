// src/organisms/ProductFormModal/ProductFormModal.jsx
import React, { useState, useEffect } from 'react';
import Modal from '../../atoms/Modal/Modal';
import Button from '../../atoms/Button/Button';
import FormField from '../../molecules/FormField/FormField';
import ImageUploadGroup from '../../molecules/ImageUploadGroup/ImageUploadGroup';
import PlusIcon from '../../atoms/PlusIcon';
import TrashIcon from '../../atoms/TrashIcon';
import './ProductFormModal.css';

const CATEGORIAS = [
  { value: 'biquinis', label: 'Biquínis' },
  { value: 'maios', label: 'Maiôs' },
  { value: 'saidas', label: 'Saídas de Praia' },
  { value: 'acessorios', label: 'Acessórios' },
  { value: 'cangas', label: 'Cangas' },
  { value: 'outros', label: 'Outros' }
];

const UFS = [
  'RJ', 'GO'
];

const emptyVariacao = () => ({
  id: null,
  sku: '',
  cor: '',
  tamanho: '',
  estoque: 100,
  custoUnitario: '',
  precoVenda: '',
  peso: '',
  dimensoes: { altura: '', largura: '', comprimento: '' },
  temDesconto: false,
  precoOriginal: null,
  imagens: [{ id: null, url: null, path: null, altText: '', isPrincipal: true, order: 0, file: null, filePreviewUrl: null }]
});

const ProductFormModal = ({ isOpen, onClose, onSubmit, initialData = null, isSaving = false }) => {
  // Dados básicos do produto
  const [nome, setNome] = useState('');
  const [descricao, setDescricao] = useState('');
  const [ativo, setAtivo] = useState(true);
  const [ufCadastro, setUfCadastro] = useState('RJ');
  const [categoria, setCategoria] = useState('biquinis');
  const [marca, setMarca] = useState('Menina Dourada');
  const [tagsInput, setTagsInput] = useState('');

  // Variações
  const [variacoes, setVariacoes] = useState([emptyVariacao()]);

  // Aba ativa (para mobile)
  const [activeTab, setActiveTab] = useState('produto');
  const [activeVariacaoIndex, setActiveVariacaoIndex] = useState(0);

  useEffect(() => {
    if (isOpen && initialData) {
      setNome(initialData.nome || initialData.name || '');
      setDescricao(initialData.descricao || initialData.description || '');
      setAtivo(initialData.ativo !== undefined ? initialData.ativo : true);
      setUfCadastro(initialData.ufCadastro || 'RJ');
      setCategoria(initialData.categoria || 'biquinis');
      setMarca(initialData.marca || 'Menina Dourada');
      setTagsInput(Array.isArray(initialData.tags) ? initialData.tags.join(', ') : '');

      if (initialData.variacoes && initialData.variacoes.length > 0) {
        setVariacoes(initialData.variacoes.map(v => {
          // Tamanho pode vir como array ou string
          const tamanhoValue = Array.isArray(v.tamanho) ? v.tamanho.join(',') : (v.tamanho || '');
          
          return {
            id: v.id || null,
            sku: v.sku || '',
            cor: v.cor || '',
            tamanho: tamanhoValue,
            estoque: v.estoque !== undefined ? v.estoque : 100,
            custoUnitario: v.custoUnitario !== undefined ? String(v.custoUnitario) : '',
            precoVenda: v.precoVenda !== undefined ? String(v.precoVenda) : (v.preco ? String(v.preco) : ''),
            peso: v.peso !== undefined ? String(v.peso) : '',
            dimensoes: {
              altura: v.dimensoes?.altura !== undefined ? String(v.dimensoes.altura) : '',
              largura: v.dimensoes?.largura !== undefined ? String(v.dimensoes.largura) : '',
              comprimento: v.dimensoes?.comprimento !== undefined ? String(v.dimensoes.comprimento) : ''
            },
            temDesconto: v.temDesconto || false,
            precoOriginal: v.precoOriginal !== undefined && v.precoOriginal !== null ? String(v.precoOriginal) : '',
            imagens: v.imagens && v.imagens.length > 0
              ? v.imagens.map((img, idx) => ({
                  id: img.id || null,
                  url: img.url || null,
                  path: img.path || null,
                  altText: img.altText || '',
                  isPrincipal: img.isPrincipal || false,
                  order: img.order !== undefined ? img.order : idx,
                  file: null,
                  filePreviewUrl: img.url || null
                }))
              : [{ id: null, url: null, path: null, altText: '', isPrincipal: true, order: 0, file: null, filePreviewUrl: null }]
          };
        }));
      } else {
        setVariacoes([emptyVariacao()]);
      }
      setActiveVariacaoIndex(0);
    } else if (isOpen && !initialData) {
      resetForm();
    }
  }, [isOpen, initialData]);

  const resetForm = () => {
    setNome('');
    setDescricao('');
    setAtivo(true);
    setUfCadastro('RJ');
    setCategoria('biquinis');
    setMarca('Menina Dourada');
    setTagsInput('');
    setVariacoes([emptyVariacao()]);
    setActiveTab('produto');
    setActiveVariacaoIndex(0);
  };

  const handleModalClose = () => {
    if (isSaving) return;
    onClose();
  };

  // Handlers para variações
  const updateVariacao = (index, field, value) => {
    const newVariacoes = [...variacoes];
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      newVariacoes[index][parent][child] = value;
    } else {
      newVariacoes[index][field] = value;
    }
    setVariacoes(newVariacoes);
  };

  const addVariacao = () => {
    setVariacoes([...variacoes, emptyVariacao()]);
    setActiveVariacaoIndex(variacoes.length);
  };

  const removeVariacao = (index) => {
    if (variacoes.length > 1) {
      const newVariacoes = variacoes.filter((_, i) => i !== index);
      setVariacoes(newVariacoes);
      if (activeVariacaoIndex >= newVariacoes.length) {
        setActiveVariacaoIndex(newVariacoes.length - 1);
      }
    } else {
      alert('O produto deve ter pelo menos uma variação.');
    }
  };

  // Handlers para imagens da variação
  const handleImageFileChange = (variacaoIndex, imageIndex, file) => {
    const newVariacoes = [...variacoes];
    newVariacoes[variacaoIndex].imagens[imageIndex].file = file;
    newVariacoes[variacaoIndex].imagens[imageIndex].filePreviewUrl = file ? URL.createObjectURL(file) : null;
    setVariacoes(newVariacoes);
  };

  const addImageToVariacao = (variacaoIndex) => {
    const newVariacoes = [...variacoes];
    newVariacoes[variacaoIndex].imagens.push({
      id: null,
      url: null,
      path: null,
      altText: '',
      isPrincipal: false,
      order: newVariacoes[variacaoIndex].imagens.length,
      file: null,
      filePreviewUrl: null
    });
    setVariacoes(newVariacoes);
  };

  const removeImageFromVariacao = (variacaoIndex, imageIndex) => {
    const newVariacoes = [...variacoes];
    if (newVariacoes[variacaoIndex].imagens.length > 1) {
      newVariacoes[variacaoIndex].imagens = newVariacoes[variacaoIndex].imagens.filter((_, i) => i !== imageIndex);
      
      // Se removeu a principal, marca a primeira como principal
      if (!newVariacoes[variacaoIndex].imagens.some(img => img.isPrincipal)) {
        newVariacoes[variacaoIndex].imagens[0].isPrincipal = true;
      }
      
      setVariacoes(newVariacoes);
    }
  };

  const setPrincipalImage = (variacaoIndex, imageIndex) => {
    const newVariacoes = [...variacoes];
    newVariacoes[variacaoIndex].imagens = newVariacoes[variacaoIndex].imagens.map((img, i) => ({
      ...img,
      isPrincipal: i === imageIndex
    }));
    setVariacoes(newVariacoes);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isSaving) return;

    // Validações
    if (!nome.trim()) {
      alert('O nome do produto é obrigatório.');
      return;
    }

    for (let i = 0; i < variacoes.length; i++) {
      const v = variacoes[i];
      if (!v.cor.trim()) {
        alert(`A cor da variação ${i + 1} é obrigatória.`);
        setActiveTab('variacoes');
        setActiveVariacaoIndex(i);
        return;
      }
      if (!v.tamanho.trim()) {
        alert(`O tamanho da variação ${i + 1} é obrigatório.`);
        setActiveTab('variacoes');
        setActiveVariacaoIndex(i);
        return;
      }
      const preco = parseFloat(v.precoVenda.toString().replace(',', '.'));
      if (isNaN(preco) || preco <= 0) {
        alert(`O preço de venda da variação ${i + 1} deve ser maior que zero.`);
        setActiveTab('variacoes');
        setActiveVariacaoIndex(i);
        return;
      }
      if (!v.imagens.some(img => img.filePreviewUrl || img.file)) {
        alert(`A variação ${i + 1} deve ter pelo menos uma imagem.`);
        setActiveTab('variacoes');
        setActiveVariacaoIndex(i);
        return;
      }
    }

    // Monta o objeto para envio
    const tags = tagsInput.split(',').map(t => t.trim().toLowerCase()).filter(Boolean);

    const productData = {
      id: initialData?.id || null,
      nome: nome.trim(),
      descricao: descricao.trim(),
      ativo,
      ufCadastro,
      categoria,
      marca: marca.trim(),
      tags,
      variacoes: variacoes.map((v, vIndex) => {
        // Gera SKU automático se não preenchido
        const skuValue = v.sku.trim() || `MD-${categoria.toUpperCase().substring(0, 3)}-${v.cor.toUpperCase().substring(0, 3)}-${v.tamanho.toUpperCase().substring(0, 3)}`;
        
        // Tamanho: converte string separada por vírgula em array
        const tamanhoArray = v.tamanho.split(',').map(t => t.trim()).filter(Boolean);
        
        return {
          id: v.id || null,
          sku: skuValue,
          cor: v.cor.trim(),
          tamanho: tamanhoArray,
          estoque: parseInt(v.estoque) || 0,
          custoUnitario: parseFloat(v.custoUnitario.toString().replace(',', '.')) || 0,
          precoVenda: parseFloat(v.precoVenda.toString().replace(',', '.')) || 0,
          peso: parseFloat(v.peso.toString().replace(',', '.')) || 0,
          dimensoes: {
            altura: parseFloat(v.dimensoes.altura.toString().replace(',', '.')) || 0,
            largura: parseFloat(v.dimensoes.largura.toString().replace(',', '.')) || 0,
            comprimento: parseFloat(v.dimensoes.comprimento.toString().replace(',', '.')) || 0
          },
          temDesconto: v.temDesconto || false,
          precoOriginal: v.temDesconto && v.precoOriginal ? parseFloat(v.precoOriginal.toString().replace(',', '.')) : null,
          imagens: v.imagens.map((img, imgIndex) => ({
            id: img.id || null,
            altText: img.altText || `${nome} - ${v.cor}`,
            isPrincipal: img.isPrincipal,
            order: imgIndex,
            ...(img.path ? { path: img.path } : {}),
            ...(img.url ? { url: img.url } : {})
          }))
        };
      })
    };

    // Coleta os arquivos de imagem
    const files = [];
    variacoes.forEach((v, vIndex) => {
      v.imagens.forEach((img, imgIndex) => {
        if (img.file) {
          files.push({
            file: img.file,
            variacaoIndex: vIndex,
            imagemIndex: imgIndex
          });
        }
      });
    });

    onSubmit(productData, files);
  };

  const currentVariacao = variacoes[activeVariacaoIndex] || variacoes[0];

  return (
    <Modal isOpen={isOpen} onClose={handleModalClose}>
      <div className="product-form-modal">
        <div className="modal-header">
          <h3 className="modal-title">{initialData ? 'Editar Produto' : 'Novo Produto'}</h3>
          <Button
            onClick={handleModalClose}
            className="icon-only close-modal-button"
            disabled={isSaving}
            icon={() => (
              <svg xmlns="http://www.w3.org/2000/svg" className="button-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            )}
          />
        </div>

        {/* Tabs para mobile */}
        <div className="form-tabs">
          <button
            type="button"
            className={`form-tab ${activeTab === 'produto' ? 'active' : ''}`}
            onClick={() => setActiveTab('produto')}
          >
            Produto
          </button>
          <button
            type="button"
            className={`form-tab ${activeTab === 'variacoes' ? 'active' : ''}`}
            onClick={() => setActiveTab('variacoes')}
          >
            Variações ({variacoes.length})
          </button>
        </div>

        <form onSubmit={handleSubmit} className="product-form">
          {/* Aba Produto */}
          <div className={`form-section ${activeTab === 'produto' ? 'active' : ''}`}>
            <FormField
              label="Nome do Produto"
              id="nome"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              required
              placeholder="Ex: Biquíni Laranja Verão 2025"
            />

            <FormField
              label="Descrição"
              id="descricao"
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              placeholder="Descrição detalhada do produto"
              isTextarea
            />

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="categoria" className="form-label">Categoria</label>
                <select
                  id="categoria"
                  value={categoria}
                  onChange={(e) => setCategoria(e.target.value)}
                  className="form-select"
                >
                  {CATEGORIAS.map(cat => (
                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="ufCadastro" className="form-label">UF Cadastro</label>
                <select
                  id="ufCadastro"
                  value={ufCadastro}
                  onChange={(e) => setUfCadastro(e.target.value)}
                  className="form-select"
                >
                  {UFS.map(uf => (
                    <option key={uf} value={uf}>{uf}</option>
                  ))}
                </select>
              </div>
            </div>

            <FormField
              label="Marca"
              id="marca"
              value={marca}
              onChange={(e) => setMarca(e.target.value)}
              placeholder="Ex: Menina Dourada"
            />

            <FormField
              label="Tags (separadas por vírgula)"
              id="tags"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="Ex: verao, praia, biquini, moda-2025"
            />

            <div className="form-group">
              <label className="form-checkbox-label">
                <input
                  type="checkbox"
                  checked={ativo}
                  onChange={(e) => setAtivo(e.target.checked)}
                  className="form-checkbox"
                />
                <span>Produto Ativo</span>
              </label>
            </div>
          </div>

          {/* Aba Variações */}
          <div className={`form-section ${activeTab === 'variacoes' ? 'active' : ''}`}>
            {/* Seletor de variação */}
            <div className="variacao-selector">
              <div className="variacao-tabs">
                {variacoes.map((v, index) => (
                  <button
                    key={index}
                    type="button"
                    className={`variacao-tab ${activeVariacaoIndex === index ? 'active' : ''}`}
                    onClick={() => setActiveVariacaoIndex(index)}
                  >
                    {v.cor || `Var ${index + 1}`}
                  </button>
                ))}
                <button
                  type="button"
                  className="variacao-tab add-variacao"
                  onClick={addVariacao}
                >
                  <PlusIcon />
                </button>
              </div>
            </div>

            {/* Campos da variação ativa */}
            <div className="variacao-form">
              <div className="variacao-header">
                <span className="variacao-title">Variação {activeVariacaoIndex + 1}</span>
                {variacoes.length > 1 && (
                  <Button
                    type="button"
                    onClick={() => removeVariacao(activeVariacaoIndex)}
                    className="icon-only remove-variacao-btn"
                    icon={TrashIcon}
                  />
                )}
              </div>

              <div className="form-row">
                <FormField
                  label="SKU"
                  id={`sku-${activeVariacaoIndex}`}
                  value={currentVariacao.sku}
                  onChange={(e) => updateVariacao(activeVariacaoIndex, 'sku', e.target.value)}
                  placeholder="Ex: MD-BIQ-LAR-UNI"
                />
                <FormField
                  label="Cor"
                  id={`cor-${activeVariacaoIndex}`}
                  value={currentVariacao.cor}
                  onChange={(e) => updateVariacao(activeVariacaoIndex, 'cor', e.target.value)}
                  required
                  placeholder="Ex: Laranja"
                />
              </div>

              <div className="form-row">
                <FormField
                  label="Tamanho"
                  id={`tamanho-${activeVariacaoIndex}`}
                  value={currentVariacao.tamanho}
                  onChange={(e) => updateVariacao(activeVariacaoIndex, 'tamanho', e.target.value)}
                  placeholder="Ex: P, M, G ou Único"
                  required
                />
                <FormField
                  label="Estoque"
                  id={`estoque-${activeVariacaoIndex}`}
                  type="number"
                  min="0"
                  value={currentVariacao.estoque}
                  onChange={(e) => updateVariacao(activeVariacaoIndex, 'estoque', e.target.value)}
                />
              </div>

              <div className="form-row">
                <FormField
                  label="Custo Unitário (R$)"
                  id={`custoUnitario-${activeVariacaoIndex}`}
                  type="number"
                  min="0"
                  step="0.01"
                  value={currentVariacao.custoUnitario}
                  onChange={(e) => updateVariacao(activeVariacaoIndex, 'custoUnitario', e.target.value)}
                  placeholder="0.00"
                />
                <FormField
                  label="Preço Venda (R$)"
                  id={`precoVenda-${activeVariacaoIndex}`}
                  type="number"
                  min="0"
                  step="0.01"
                  value={currentVariacao.precoVenda}
                  onChange={(e) => updateVariacao(activeVariacaoIndex, 'precoVenda', e.target.value)}
                  required
                  placeholder="0.00"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-checkbox-label">
                    <input
                      type="checkbox"
                      checked={currentVariacao.temDesconto || false}
                      onChange={(e) => updateVariacao(activeVariacaoIndex, 'temDesconto', e.target.checked)}
                      className="form-checkbox"
                    />
                    <span>Tem Desconto</span>
                  </label>
                </div>
                {currentVariacao.temDesconto && (
                  <FormField
                    label="Preço Original (R$)"
                    id={`precoOriginal-${activeVariacaoIndex}`}
                    type="number"
                    min="0"
                    step="0.01"
                    value={currentVariacao.precoOriginal || ''}
                    onChange={(e) => updateVariacao(activeVariacaoIndex, 'precoOriginal', e.target.value)}
                    placeholder="0.00"
                  />
                )}
              </div>

              <div className="form-row">
                <FormField
                  label="Peso (kg)"
                  id={`peso-${activeVariacaoIndex}`}
                  type="number"
                  min="0"
                  step="0.01"
                  value={currentVariacao.peso}
                  onChange={(e) => updateVariacao(activeVariacaoIndex, 'peso', e.target.value)}
                  placeholder="0.00"
                />
              </div>

              <div className="dimensoes-section">
                <label className="form-label">Dimensões (cm)</label>
                <div className="form-row three-cols">
                  <FormField
                    label="Altura"
                    id={`altura-${activeVariacaoIndex}`}
                    type="number"
                    min="0"
                    value={currentVariacao.dimensoes.altura}
                    onChange={(e) => updateVariacao(activeVariacaoIndex, 'dimensoes.altura', e.target.value)}
                    placeholder="0"
                  />
                  <FormField
                    label="Largura"
                    id={`largura-${activeVariacaoIndex}`}
                    type="number"
                    min="0"
                    value={currentVariacao.dimensoes.largura}
                    onChange={(e) => updateVariacao(activeVariacaoIndex, 'dimensoes.largura', e.target.value)}
                    placeholder="0"
                  />
                  <FormField
                    label="Comprimento"
                    id={`comprimento-${activeVariacaoIndex}`}
                    type="number"
                    min="0"
                    value={currentVariacao.dimensoes.comprimento}
                    onChange={(e) => updateVariacao(activeVariacaoIndex, 'dimensoes.comprimento', e.target.value)}
                    placeholder="0"
                  />
                </div>
              </div>

              {/* Imagens da variação */}
              <div className="form-images-section">
                <label className="form-images-label">Imagens da Variação</label>
                <div className="image-upload-groups-container">
                  {currentVariacao.imagens.map((img, imgIndex) => (
                    <div key={imgIndex} className="variacao-image-item">
                      <ImageUploadGroup
                        index={imgIndex}
                        onRemove={() => removeImageFromVariacao(activeVariacaoIndex, imgIndex)}
                        onFileChange={(idx, file) => handleImageFileChange(activeVariacaoIndex, idx, file)}
                        filePreviewUrl={img.filePreviewUrl}
                        showRemoveButton={currentVariacao.imagens.length > 1}
                      />
                      <label className="principal-checkbox">
                        <input
                          type="radio"
                          name={`principal-${activeVariacaoIndex}`}
                          checked={img.isPrincipal}
                          onChange={() => setPrincipalImage(activeVariacaoIndex, imgIndex)}
                        />
                        <span>Principal</span>
                      </label>
                    </div>
                  ))}
                </div>
                <Button
                  type="button"
                  onClick={() => addImageToVariacao(activeVariacaoIndex)}
                  className="add-image-button"
                  icon={PlusIcon}
                >
                  Adicionar imagem
                </Button>
              </div>
            </div>
          </div>

          <div className="form-actions">
            <Button type="button" onClick={handleModalClose} variant="secondary" disabled={isSaving}>
              Cancelar
            </Button>
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
