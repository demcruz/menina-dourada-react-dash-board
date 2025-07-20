import React from 'react';
import ProductCard from '../../organisms/ProductCard/ProductCard'; // Importa o organismo ProductCard
import './ProductListingTemplate.css'; // Importa os estilos do template

const ProductListingTemplate = ({ products, onEditProduct, onDeleteProduct }) => {
  return (
    <div className="products-grid"> {/* Classe definida no index.css para o grid */}
      {products.length === 0 ? (
        <p className="no-products-message">Nenhum produto cadastrado. Adicione um novo!</p>
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