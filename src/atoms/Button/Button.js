import React from 'react';
import './Button.css';

const Button = ({ children, onClick, className = '', type = 'button', icon: IconComponent, variant = 'primary', ...props }) => {
  const buttonClasses = `button ${variant} ${className}`;

  return (
    <button
      type={type}
      onClick={onClick}
      className={buttonClasses}
      {...props}
    >
      {IconComponent && <IconComponent className="button-icon" />}
      {children}
    </button>
  );
};

export default Button;