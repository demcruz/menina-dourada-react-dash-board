export const getStoredAccessToken = () => {
  try {
    return sessionStorage.getItem('cognito_access_token');
  } catch (error) {
    return null;
  }
};
