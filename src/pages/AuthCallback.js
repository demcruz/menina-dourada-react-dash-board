import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import './Login.css';

const AuthCallback = () => {
  const navigate = useNavigate();
  const { handleSigninCallback } = useAuth();
  const [error, setError] = useState('');
  const hasRunRef = useRef(false);

  useEffect(() => {
    if (hasRunRef.current) {
      return () => {};
    }
    hasRunRef.current = true;

    if (sessionStorage.getItem('cognito_access_token')) {
      window.location.replace('/dashboard');
      return () => {};
    }

    handleSigninCallback()
      .then(() => {
        window.location.replace('/dashboard');
      })
      .catch((err) => {
        setError(err?.message || 'Falha ao concluir o login.');
      });
    return () => {};
  }, [handleSigninCallback, navigate]);

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <div className="login-logo">
            <div className="logo-icon">MD</div>
          </div>
          <h1 className="login-title">Autenticando...</h1>
          <p className="login-subtitle">Estamos concluindo o acesso seguro.</p>
        </div>

        {error ? (
          <div className="login-error">
            <svg className="error-icon" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {error}
          </div>
        ) : (
          <div className="loading-message">Processando retorno do Cognito...</div>
        )}
      </div>
    </div>
  );
};

export default AuthCallback;
