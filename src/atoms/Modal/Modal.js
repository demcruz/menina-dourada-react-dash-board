import React, { useEffect } from 'react';
import './Modal.css';

const Modal = ({ children, isOpen, onClose }) => {
  // Classe para controlar a visibilidade e opacidade
  const modalClass = isOpen
    ? 'modal-overlay visible opacity-100'
    : 'modal-overlay invisible opacity-0';

  // Gerencia o scroll do body quando o modal está aberto/fechado
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'; // Impede o scroll do body
    } else {
      document.body.style.overflow = 'auto'; // Restaura o scroll do body
    }
    // Limpa o efeito ao desmontar o componente (garante que o scroll seja restaurado)
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isOpen]); // Dependência: só roda quando isOpen muda

  const handleOverlayClick = (e) => {
    // Fecha o modal APENAS se o clique for no fundo (overlay), não no conteúdo do modal.
    // Isso evita que cliques dentro do formulário fechem o modal.
    if (e.target.classList.contains('modal-overlay')) {
      onClose();
    }
  };

  return (
    <div className={modalClass} onClick={handleOverlayClick}>
      <div className="modal-content-wrapper">
        {children}
      </div>
    </div>
  );
};

export default Modal;