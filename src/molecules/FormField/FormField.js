import React from 'react';
import Input from '../../atoms/Input/Input'; // Importa o átomo Input
import './FormField.css'; // Importa os estilos da molécula

const FormField = ({ label, id, ...props }) => {
  return (
    <div className="form-field-group">
      {/* O átomo Input já lida com o label e o input internamente */}
      <Input label={label} id={id} {...props} />
    </div>
  );
};

export default FormField;