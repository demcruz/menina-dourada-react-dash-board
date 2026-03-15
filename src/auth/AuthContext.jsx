import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const storedIdToken = sessionStorage.getItem('cognito_id_token');
    if (storedIdToken) {
      const profile = parseJwt(storedIdToken);
      setUser({ profile, username: profile?.email || profile?.preferred_username || profile?.name || '' });
    }
    setLoading(false);
  }, []);

  const handleSigninCallback = useCallback(async () => {
    setError(null);
    setLoading(true);
    try {
      const domain = process.env.REACT_APP_COGNITO_DOMAIN;
      const clientId = process.env.REACT_APP_COGNITO_CLIENT_ID;
      const redirectUri = process.env.REACT_APP_COGNITO_REDIRECT_URI
        || `${window.location.origin}/auth/callback`;

      if (!domain || !clientId || !redirectUri) {
        throw new Error('Ambiente Cognito nao configurado.');
      }

      const params = new URLSearchParams(window.location.search);
      const code = params.get('code');
      const state = params.get('state');
      const errorParam = params.get('error');
      const errorDescription = params.get('error_description');

      if (errorParam) {
        throw new Error(errorDescription || errorParam);
      }

      if (!code) {
        throw new Error('Codigo de autorizacao ausente.');
      }

      const expectedState = sessionStorage.getItem('cognito_oauth_state')
        || localStorage.getItem('cognito_oauth_state');
      if (!state || !expectedState || state !== expectedState) {
        throw new Error('Estado OAuth invalido.');
      }

      const verifier = sessionStorage.getItem('cognito_pkce_verifier')
        || localStorage.getItem('cognito_pkce_verifier');
      if (!verifier) {
        throw new Error('PKCE verifier ausente.');
      }

      const tokenResponse = await fetch(`${domain}/oauth2/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
          grant_type: 'authorization_code',
          client_id: clientId,
          code,
          redirect_uri: redirectUri,
          code_verifier: verifier
        })
      });

      const tokenPayload = await tokenResponse.json();
      if (!tokenResponse.ok) {
        throw new Error(tokenPayload?.error_description || 'Falha ao trocar o code por tokens.');
      }

      sessionStorage.setItem('cognito_access_token', tokenPayload.access_token || '');
      sessionStorage.setItem('cognito_id_token', tokenPayload.id_token || '');
      sessionStorage.setItem('cognito_refresh_token', tokenPayload.refresh_token || '');
      sessionStorage.removeItem('cognito_pkce_verifier');
      sessionStorage.removeItem('cognito_oauth_state');
      localStorage.removeItem('cognito_pkce_verifier');
      localStorage.removeItem('cognito_oauth_state');

      const profile = tokenPayload.id_token ? parseJwt(tokenPayload.id_token) : null;
      setUser({ profile, username: profile?.email || profile?.preferred_username || profile?.name || '' });

      return tokenPayload;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const value = useMemo(() => ({
    user,
    login: () => Promise.resolve(),
    logout: () => {
      const domain = process.env.REACT_APP_COGNITO_DOMAIN;
      const clientId = process.env.REACT_APP_COGNITO_CLIENT_ID;
      const logoutUri = process.env.REACT_APP_COGNITO_LOGOUT_URI
        || `${window.location.origin}/login`;

      sessionStorage.removeItem('cognito_access_token');
      sessionStorage.removeItem('cognito_id_token');
      sessionStorage.removeItem('cognito_refresh_token');
      sessionStorage.removeItem('cognito_pkce_verifier');
      sessionStorage.removeItem('cognito_oauth_state');
      localStorage.removeItem('cognito_pkce_verifier');
      localStorage.removeItem('cognito_oauth_state');
      setUser(null);

      if (domain && clientId && logoutUri) {
        window.location.assign(`${domain}/logout?client_id=${clientId}&logout_uri=${encodeURIComponent(logoutUri)}`);
      }
    },
    isAuthenticated: () => Boolean(sessionStorage.getItem('cognito_access_token')),
    getToken: () => sessionStorage.getItem('cognito_access_token'),
    handleSigninCallback,
    loading,
    error
  }), [error, handleSigninCallback, loading, user]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

const parseJwt = (token) => {
  try {
    const payload = token.split('.')[1];
    const normalized = payload.replace(/-/g, '+').replace(/_/g, '/');
    const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '=');
    const decoded = atob(padded);
    return JSON.parse(decoded);
  } catch (err) {
    return null;
  }
};
