import React from 'react';
import Input from '../../atoms/Input/Input'; // Reutilizamos o átomo Input
import Button from '../../atoms/Button/Button'; // Reutilizamos o átomo Button
import TrashIcon from '../../atoms/TrashIcon'; // Reutilizamos o átomo TrashIcon
import './ImageUploadGroup.css';

const ImageUploadGroup = ({ index, onRemove, onFileChange, onColorChange, colorValue, filePreviewUrl }) => {
  return (
    <div className="image-upload-group">
      <div className="image-upload-content">
        <div className="image-input-section">
          <label htmlFor={`imageUpload${index}`} className="image-upload-label">Imagem</label>
          <input
            type="file"
            id={`imageUpload${index}`}
            className="image-upload-field"
            accept="image/*"
            required // Remova se a imagem for opcional para novos uploads ou edições
            onChange={(e) => onFileChange(index, e.target.files[0])}
          />
          {filePreviewUrl && (
            <div className="image-preview-wrapper">
              <img src={filePreviewUrl} alt="Preview" className="image-preview" />
            </div>
          )}
        </div>
        <div className="color-input-section">
          <Input
            label="Cor"
            id={`colorName${index}`}
            className="color-name-field"
            required
            placeholder="Ex: Vermelho"
            value={colorValue}
            onChange={(e) => onColorChange(index, e.target.value)}
          />
        </div>
        {/* Botão de remover o grupo inteiro */}
        <Button
          type="button"
          className="icon-only red-hover remove-image-button"
          onClick={() => onRemove(index)}
          icon={TrashIcon}
        />
      </div>
    </div>
  );
};

export default ImageUploadGroup;