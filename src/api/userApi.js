import axiosInstance from '@/config/axiosConfig';

export const getMyInfoApi = async () => {
  try {
    const response = await axiosInstance.get('/identity/users/my-info');
    return response.data.result;
  } catch (error) {
    console.error('Failed to fetch user info:', error);
    throw error.response?.data || error;
  }
};

export const getAllUsersApi = async () => {
  try {
    const response = await axiosInstance.get('/identity/users');
    return response.data.result;
  } catch (error) {
    console.error('Failed to fetch users:', error);
    throw error.response?.data || error;
  }
};