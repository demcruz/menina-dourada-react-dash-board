// src/organisms/ProductCard/ProductCard.jsx
import React from 'react';
import ColorThumbnails from '../../molecules/ColorThumbnails/ColorThumbnails';
import Button from '../../atoms/Button/Button';
import EditIcon from '../../atoms/EditIcon';
import TrashIcon from '../../atoms/TrashIcon';
import { pickImageUrl } from '../../utils/imageUtils';
import './ProductCard.css';

const ProductCard = ({ product, onEdit, onDelete }) => {
  if (!product) {
    console.warn("ProductCard received an undefined product prop.");
    return null;
  }

  const productName = product.nome || product.name || 'Nome indisponível';
  const productDescription = product.descricao || product.description || '';

  const firstVariation = product.variacoes && product.variacoes.length > 0 ? product.variacoes[0] : null;
  const productPrice = firstVariation && firstVariation.preco !== undefined && firstVariation.preco !== null
    ? firstVariation.preco
    : 0;

  // Inicializa imageUrl com um placeholder vÃ¡lido.
  // Isso garante que .includes() sempre seja chamado em uma string.
  let imageUrl = 'https://via.placeholder.com/500x375?text=Produto+sem+imagem';
  let imageAlt = 'Produto sem imagem';
  let colorsForThumbnails = [];

  if (product.variacoes && product.variacoes.length > 0) {
    // Percorre as variaÃ§Ãµes para coletar URLs e cores para os thumbnails
    product.variacoes.forEach(variation => {
      if (variation.cor) {
        const principalImage = variation.imagens?.find(img => img.isPrincipal) || variation.imagens?.[0];
        const thumbnailUrl = pickImageUrl(principalImage);

        colorsForThumbnails.push({
          src: thumbnailUrl || 'https://via.placeholder.com/50x50?text=?', // Garante que src seja string
          colorName: variation.cor
        });
      }

      // LÃ³gica para definir a imagem principal do card.
      // Prioriza a primeira imagem principal encontrada entre as variaÃ§Ãµes.
      // Se ainda estiver com o placeholder E houver uma imagem principal na variaÃ§Ã£o atual, use-a.
      if (imageUrl.includes('Produto+sem+imagem')) { // Verifica se ainda estamos usando o placeholder
          if (variation.imagens && variation.imagens.length > 0) { // Garante que o array de imagens existe
              const currentPrincipalImage = variation.imagens.find(img => img.isPrincipal);
              const currentFirstImage = variation.imagens[0];
              const resolvedPrincipalUrl = pickImageUrl(currentPrincipalImage);
              const resolvedFirstUrl = pickImageUrl(currentFirstImage);

              // Se houver uma imagem principal com URL valida, use-a
              if (resolvedPrincipalUrl) {
                  imageUrl = resolvedPrincipalUrl;
                  imageAlt = currentPrincipalImage?.altText || `Imagem de ${variation.cor}`;
              } 
              // Senao, se houver uma primeira imagem com URL valida, use-a
              else if (resolvedFirstUrl) {
                  imageUrl = resolvedFirstUrl;
                  imageAlt = currentFirstImage?.altText || `Imagem de ${variation.cor}`;
              }
              // Se nenhuma URL valida for encontrada aqui, imageUrl permanece com o placeholder inicial
          }
      }
    });

    // Fallback final: Se apÃ³s iterar todas as variaÃ§Ãµes, imageUrl ainda for o placeholder
    // E se a primeira variaÃ§Ã£o tiver uma imagem com URL vÃ¡lida, use-a.
    const fallbackImage = product.variacoes[0]?.imagens?.[0];
    const fallbackUrl = pickImageUrl(fallbackImage);
    if (imageUrl.includes('Produto+sem+imagem') && fallbackUrl) {
        imageUrl = fallbackUrl;
        imageAlt = fallbackImage?.altText || `Imagem de ${product.variacoes[0].cor}`;
    }
  }

  const displayPrice = productPrice.toFixed(2).replace('.', ',');

  return (
    <div className="product-card">
      <div className="product-card-image-wrapper">
        {/* Garante que src sempre receba uma string vÃ¡lida */}
        <img src={imageUrl} alt={imageAlt} className="product-card-image" />
      </div>
      <div className="product-card-content">
        <div className="product-card-header">
          <h3 className="product-card-title">{productName}</h3>
          <span className="product-card-price">R$ {displayPrice}</span>
        </div>
        
        {productDescription && (
          <p className="product-card-description">{productDescription}</p>
        )}

        {colorsForThumbnails.length > 0 && (
          <ColorThumbnails images={colorsForThumbnails} />
        )}

        <div className="product-card-actions">
          <Button className="icon-only" onClick={() => onEdit(product.id)} icon={EditIcon} />
          <Button className="icon-only red-hover" onClick={() => onDelete(product.id)} icon={TrashIcon} />
        </div>
      </div>
    </div>
  );
};

export default React.memo(ProductCard);
