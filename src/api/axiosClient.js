import axios from 'axios';
import { getStoredAccessToken } from '../auth/tokenStorage';

const axiosClient = axios.create();

axiosClient.interceptors.request.use((config) => {
  const token = getStoredAccessToken();
  if (token) {
    config.headers = {
      ...config.headers,
      Authorization: `Bearer ${token}`
    };
  }
  return config;
});

export default axiosClient;
