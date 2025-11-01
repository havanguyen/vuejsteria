import axios from 'axios';
import { API_BASE_URL } from '@/config/constants';
import { useAuthStore } from '@/stores/useAuthStore';

const createApiClient = () => {
  const authStore = useAuthStore();
  const token = authStore.token;

  if (!token) {
    throw new Error('User is not authenticated');
  }

  return axios.create({
    baseURL: API_BASE_URL,
    headers: {
      'Content-Type': 'multipart/form-data',
      'Authorization': `Bearer ${token}`
    }
  });
};

export const updateAvatarApi = async (formData) => {
  try {
    const apiClient = createApiClient();
    const response = await apiClient.post('/profile/users/avatar', formData);
    return response.data.result;
  } catch (error) {
    console.error('LỖI KHI UPLOAD AVATAR:', error.response || error.request || error.message);
    throw error.response?.data || error;
  }
};