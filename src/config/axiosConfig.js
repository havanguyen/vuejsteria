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

    if (token && authStore.isAuthenticated) {
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
    if (error.response && error.response.status === 401) {
      console.error('Unauthorized! Logging out...');
      const authStore = useAuthStore();
      authStore.logout();
      
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;