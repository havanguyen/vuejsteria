import axios from 'axios';
import { API_BASE_URL } from '@/config/constants';

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000, // 15 seconds
  withCredentials: true, // Important: Send cookies with requests
});

// Response interceptor to handle token refresh on 401
// Response interceptor to handle token refresh on 401
// MOVED TO plugins/axios.js to centralized logic and avoid loops
// axiosInstance.interceptors.response.use(...)

export default axiosInstance;