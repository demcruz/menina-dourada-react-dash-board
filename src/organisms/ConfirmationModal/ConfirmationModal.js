import React from 'react';
import Modal from '../../atoms/Modal/Modal'; // Reuse our Modal atom
import Button from '../../atoms/Button/Button'; // Reuse our Button atom
import './ConfirmationModal.css';

const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, message, confirmText = 'Confirmar', cancelText = 'Cancelar', confirmVariant = 'primary', isProcessing = false }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="confirmation-modal-content">
        <h3 className="confirmation-modal-title">{title}</h3>
        <p className="confirmation-modal-message">{message}</p>
        <div className="confirmation-modal-actions">
          <Button variant="secondary" onClick={onClose} disabled={isProcessing}>
            {cancelText}
          </Button>
          <Button variant={confirmVariant} onClick={onConfirm} disabled={isProcessing}>
            {isProcessing ? 'Excluindo...' : confirmText}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default ConfirmationModal;