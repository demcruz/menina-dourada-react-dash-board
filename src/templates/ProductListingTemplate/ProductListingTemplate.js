import React from 'react';
import ProductCard from '../../organisms/ProductCard/ProductCard';
import './ProductListingTemplate.css';

const ProductListingTemplate = ({ products, onEditProduct, onDeleteProduct, isLoading = false }) => {
  if (isLoading) {
    return (
      <div className="products-grid">
        {Array.from({ length: 6 }).map((_, index) => (
          <div className="product-skeleton-card skeleton-shimmer" key={`skeleton-${index}`}>
            <div className="product-skeleton-image" />
            <div className="product-skeleton-content">
              <div className="product-skeleton-header">
                <div className="skeleton-line product-skeleton-title" />
                <div className="skeleton-line product-skeleton-price" />
              </div>
              <div className="skeleton-line product-skeleton-description" />
              <div className="product-skeleton-thumbs">
                <div className="product-skeleton-thumb" />
                <div className="product-skeleton-thumb" />
                <div className="product-skeleton-thumb" />
              </div>
              <div className="product-skeleton-actions">
                <div className="product-skeleton-action" />
                <div className="product-skeleton-action" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="products-grid">
      {products.length === 0 ? (
        <p className="no-products-message">Nenhum produto cadastrado.</p>
      ) : (
        products.map(product => (
          <ProductCard
            key={product.id}
            product={product}
            onEdit={onEditProduct}
            onDelete={onDeleteProduct}
          />
        ))
      )}
    </div>
  );
};

export default ProductListingTemplate;