import axios from 'axios';
import { API_BASE_URL } from '@/config/constants';

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000, // 15 seconds
});

export default axiosInstance;