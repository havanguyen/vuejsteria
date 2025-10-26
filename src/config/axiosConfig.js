import axios from 'axios';
import { API_BASE_URL } from './constants';
import { useAuthStore } from '@/stores/useAuthStore';

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
});

axiosInstance.interceptors.request.use(
  (config) => {
    const authStore = useAuthStore();
    const token = authStore.token;

    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    const authStore = useAuthStore();
    const originalRequest = error.config;

    if (error.response && error.response.status === 401) {
      const isLoginAttempt = originalRequest.url.includes('/identity/auth/token');
      
      if (!isLoginAttempt && authStore.isAuthenticated) {
        console.error('Unauthorized! Token likely expired. Logging out...');
        authStore.logout();
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;