import React from 'react';
import './Input.css';

const Input = ({ label, id, type = 'text', value, onChange, placeholder, className = '', required = false, ...props }) => {
  return (
    <div className="input-group">
      {label && <label htmlFor={id} className="input-label">{label}</label>}
      <input
        type={type}
        id={id}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className={`input-field ${className}`}
        {...props}
      />
    </div>
  );
};

export default Input;