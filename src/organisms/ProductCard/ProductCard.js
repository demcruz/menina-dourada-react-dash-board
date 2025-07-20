// src/organisms/ProductCard/ProductCard.jsx
import React from 'react';
import ColorThumbnails from '../../molecules/ColorThumbnails/ColorThumbnails';
import Button from '../../atoms/Button/Button';
import EditIcon from '../../atoms/EditIcon';
import TrashIcon from '../../atoms/TrashIcon';
import './ProductCard.css';

const ProductCard = ({ product, onEdit, onDelete }) => {
  if (!product) {
    console.warn("ProductCard received an undefined product prop.");
    return null;
  }

  // --- Adapting to Java API structure ---
  const productName = product.nome || 'Nome Indisponível';

  // Get price from the first variation, if available
  const firstVariation = product.variacoes && product.variacoes.length > 0 ? product.variacoes[0] : null;
  const productPrice = firstVariation && firstVariation.preco !== undefined && firstVariation.preco !== null
    ? firstVariation.preco
    : 0; // Default to 0 if price is missing or variation is not found

  // Get image from the first variation's first image
  let imageUrl = 'https://via.placeholder.com/500x375?text=Produto+sem+imagem';
  let imageAlt = 'Produto sem imagem';
  let colorsForThumbnails = []; // To collect all colors for thumbnails

 if (product.variacoes && product.variacoes.length > 0) {
    product.variacoes.forEach(variation => {
      // Collect colors for thumbnails from all variations
      if (variation.cor) {
        // Find the principal image for this variation, or take the first one
        const principalImage = variation.imagens?.find(img => img.isPrincipal) || variation.imagens?.[0];
        
        colorsForThumbnails.push({
          src: principalImage?.url || 'https://via.placeholder.com/50x50?text=?',
          colorName: variation.cor
        });
      }

        if (imageUrl.includes('Produto+sem+imagem')) { // Only update if still using placeholder
        const currentPrincipalImage = variation.imagens?.find(img => img.isPrincipal);
        if (currentPrincipalImage) {
            imageUrl = currentPrincipalImage.url;
            imageAlt = currentPrincipalImage.altText || `Imagem de ${variation.cor}`;
        } else if (variation.imagens?.[0]) { // If no principal, take first available image
            imageUrl = variation.imagens[0].url;
            imageAlt = variation.imagens[0].altText || `Imagem de ${variation.cor}`;
        }
      }
    }); // <-- ADD SEMICOLON HERE!
  }
  // Fallback if no specific principal image was set across all variations
  if (imageUrl.includes('Produto+sem+imagem') && product.variacoes?.[0]?.imagens?.[0]?.url) { // Added ?. for safer access
      imageUrl = product.variacoes[0].imagens[0].url;
      imageAlt = product.variacoes[0].imagens[0].altText || `Imagem de ${product.variacoes[0].cor}`;
  
  }

  const displayPrice = productPrice.toFixed(2).replace('.', ',');

  return (
    <div className="product-card">
      <div className="product-card-image-wrapper">
        <img src={imageUrl} alt={imageAlt} className="product-card-image" />
      </div>
      <div className="product-card-content">
        <div className="product-card-header">
          <h3 className="product-card-title">{productName}</h3>
          <span className="product-card-price">R$ {displayPrice}</span>
        </div>

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

export default ProductCard;