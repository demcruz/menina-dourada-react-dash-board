import React, { useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { generatePkcePair } from '../auth/pkce';
import './Login.css';

const Login = () => {
  const [error, setError] = useState('');
  const [isRedirecting, setIsRedirecting] = useState(false);

  const { isAuthenticated, loading, error: authError } = useAuth();
  const location = useLocation();

  // Redirect if already authenticated
  if (isAuthenticated()) {
    const from = location.state?.from?.pathname || '/dashboard';
    return <Navigate to={from} replace />;
  }

  const handleSignIn = async () => {
    setError('');
    setIsRedirecting(true);

    try {
      const domain = process.env.REACT_APP_COGNITO_DOMAIN;
      const clientId = process.env.REACT_APP_COGNITO_CLIENT_ID;
      const redirectUri = process.env.REACT_APP_COGNITO_REDIRECT_URI
        || `${window.location.origin}/auth/callback`;

      if (!domain || !clientId || !redirectUri) {
        throw new Error('Ambiente Cognito nao configurado.');
      }

      const { verifier, challenge } = await generatePkcePair();
      const state = window.crypto.randomUUID();

      sessionStorage.setItem('cognito_pkce_verifier', verifier);
      sessionStorage.setItem('cognito_oauth_state', state);
      localStorage.setItem('cognito_pkce_verifier', verifier);
      localStorage.setItem('cognito_oauth_state', state);

      const authorizeUrl = new URL(`${domain}/oauth2/authorize`);
      authorizeUrl.searchParams.set('client_id', clientId);
      authorizeUrl.searchParams.set('response_type', 'code');
      authorizeUrl.searchParams.set('redirect_uri', redirectUri);
      authorizeUrl.searchParams.set('scope', 'openid email phone');
      authorizeUrl.searchParams.set('state', state);
      authorizeUrl.searchParams.set('code_challenge', challenge);
      authorizeUrl.searchParams.set('code_challenge_method', 'S256');

      window.location.assign(authorizeUrl.toString());
    } catch (err) {
      setError(err?.message || 'Falha ao iniciar o login.');
      setIsRedirecting(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <div className="login-logo">
            <div className="logo-icon">MD</div>
          </div>
          <h1 className="login-title">Acesso ao painel</h1>
          <p className="login-subtitle">Entre com sua conta segura via Cognito</p>
        </div>

        <div className="login-form">
          {(error || authError) && (
            <div className="login-error">
              <svg className="error-icon" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {error || authError?.message}
            </div>
          )}

          <button
            type="button"
            className="login-button"
            onClick={handleSignIn}
            disabled={loading || isRedirecting}
          >
            {(loading || isRedirecting) && <div className="button-spinner"></div>}
            {loading || isRedirecting ? 'Redirecionando...' : 'Entrar com Cognito'}
          </button>

          <div className="login-footer">
            <p>Voce sera direcionado para o acesso seguro.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
