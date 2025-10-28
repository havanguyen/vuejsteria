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

export const updateMyInfoApi = async (userData) => {
  try {
    const response = await axiosInstance.put(`/identity/users/my-info`, userData);
    return response.data.result;
  } catch (error) {
    console.error(`Failed to update my info:`, error);
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

export const getUserByIdApi = async (userId) => {
  try {
    const response = await axiosInstance.get(`/identity/users/${userId}`);
    return response.data.result;
  } catch (error) {
    console.error(`Failed to fetch user with ID ${userId}:`, error);
    throw error.response?.data || error;
  }
};

export const updateUserByAdminApi = async (userId, userData) => {
  try {
    const response = await axiosInstance.put(`/identity/users/${userId}`, userData);
    return response.data.result;
  } catch (error) {
    console.error(`Failed to update user ${userId}:`, error);
    throw error.response?.data || error;
  }
};

export const deleteUserByAdminApi = async (userId) => {
  try {
    const response = await axiosInstance.delete(`/identity/users/${userId}`);
    return response.data.result;
  } catch (error) {
     console.error(`Failed to delete user ${userId}:`, error);
     throw error.response?.data || error;
  }
};