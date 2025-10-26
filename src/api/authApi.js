import axiosInstance from '@/config/axiosConfig';

export const loginApi = async (credentials) => {
  try {
    const response = await axiosInstance.post('/identity/auth/token', credentials);
    return response.data.result;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const registerApi = async (userData) => {
   try {
       const response = await axiosInstance.post('/identity/users/registration', userData);
       return response.data.result;
   } catch (error) {
       throw error.response?.data || error;
   }
};

export const logoutApi = async (token) => {
  try {
    await axiosInstance.post('/identity/auth/logout', { token });
  } catch (error) {
    console.error('Logout API failed:', error);
    throw error.response?.data || error;
  }
};