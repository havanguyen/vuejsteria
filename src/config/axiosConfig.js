import axios from 'axios';
import { API_BASE_URL } from '@/config/constants';

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000, // 15 seconds
  withCredentials: true, // Important: Send cookies with requests
});

// Response interceptor to handle token refresh on 401
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // If error is 401 and we haven't retried yet
    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Call refresh token API (no arguments needed, uses cookie)
        // Accessing via import to avoid circular dependency if possible, or direct axios call
        await axiosInstance.post('/identity/auth/refresh', {});

        // Retry the original request
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        // Refresh failed, user needs to login
        // Optional: Redirect to login or clear state
        console.error("Session expired", refreshError);
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;