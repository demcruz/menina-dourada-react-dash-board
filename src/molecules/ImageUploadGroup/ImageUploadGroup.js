// src/molecules/ImageUploadGroup/ImageUploadGroup.jsx
import React from 'react';
import Button from '../../atoms/Button/Button';
import TrashIcon from '../../atoms/TrashIcon';
import './ImageUploadGroup.css';

const ImageUploadGroup = ({ index, onRemove, onFileChange, filePreviewUrl, showRemoveButton = true }) => {
  // Gera um ID único para associar o label ao input de arquivo
  const fileInputId = `imageUpload${index}-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div className="image-upload-group">
      <div className="image-upload-content">
        <div className="image-input-section">
          <label htmlFor={fileInputId} className="image-upload-label">Imagem</label>
          <div className="custom-file-input-wrapper">
            <input
              type="file"
              id={fileInputId}
              className="image-upload-field-hidden"
              accept="image/*"
              onChange={(e) => onFileChange(index, e.target.files[0])}
            />
            <label htmlFor={fileInputId} className="custom-file-upload-button">
              Escolher Arquivo
            </label>
            <span className="file-name-display">
              {filePreviewUrl ? (filePreviewUrl.includes('blob:') ? 'Arquivo selecionado' : 'Arquivo existente') : 'Nenhum arquivo'}
            </span>
          </div>

          {filePreviewUrl && (
            <div className="image-preview-wrapper">
              <img src={filePreviewUrl} alt="Preview" className="image-preview" />
            </div>
          )}
        </div>
        {showRemoveButton && (
          <Button
            type="button"
            className="icon-only red-hover remove-image-button"
            onClick={onRemove}
            icon={TrashIcon}
          />
        )}
      </div>
    </div>
  );
};

export default ImageUploadGroup;
