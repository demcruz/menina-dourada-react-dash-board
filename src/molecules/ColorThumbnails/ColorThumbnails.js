import React from 'react';
import './ColorThumbnails.css';

const ColorThumbnails = ({ images }) => {
  return (
    <div className="color-thumbnails-container">
      <p className="color-thumbnails-label">Cores disponíveis:</p>
      <div className="color-thumbnails-list">
        {images.map((img, index) => (
          <div key={index} className="color-thumbnail-item">
            <div
              className="color-thumbnail"
              style={{ backgroundImage: `url('${img.src}')` }}
            ></div>
            <span className="color-thumbnail-name">
              {img.colorName}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ColorThumbnails;