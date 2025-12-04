import axiosInstance from '@/config/axiosConfig';

export const getMyInfoApi = async (config = {}) => {
  try {
    const cacheBust = new Date().getTime();
    const response = await axiosInstance.get(
      `/identity/users/my-info?_t=${cacheBust}`,
      config
    );
    return response.data.result;
  } catch (error) {
    console.error('Failed to fetch user info:', error);
    throw error.response?.data || new Error(error.message || 'Unknown error occurred');
  }
};

export const updateMyInfoApi = async (userData) => {
  try {
    const response = await axiosInstance.put(
      `/identity/users/my-info`,
      userData
    );
    return response.data.result;
  } catch (error) {
    console.error(`Failed to update my info:`, error);
    throw error.response?.data || new Error(error.message || 'Unknown error occurred');
  }
};

export const getAllUsersApi = async (
  page = 0,
  size = 10,
  sort = 'id,desc'
) => {
  try {
    const response = await axiosInstance.get(
      `/identity/users?page=${page}&size=${size}&sort=${sort}`
    );
    return response.data.result;
  } catch (error) {
    console.error('Failed to fetch users:', error);
    throw error.response?.data || new Error(error.message || 'Unknown error occurred');
  }
};

export const getUserByIdApi = async (userId) => {
  try {
    const response = await axiosInstance.get(`/identity/users/${userId}`);
    return response.data.result;
  } catch (error) {
    console.error(`Failed to fetch user with ID ${userId}:`, error);
    throw error.response?.data || new Error(error.message || 'Unknown error occurred');
  }
};

export const updateUserByAdminApi = async (userId, userData) => {
  try {
    const response = await axiosInstance.put(
      `/identity/users/${userId}`,
      userData
    );
    return response.data.result;
  } catch (error) {
    console.error(`Failed to update user ${userId}:`, error);
    throw error.response?.data || new Error(error.message || 'Unknown error occurred');
  }
};

export const deleteUserByAdminApi = async (userId) => {
  try {
    const response = await axiosInstance.delete(`/identity/users/${userId}`);
    return response.data.result;
  } catch (error) {
    console.error(`Failed to delete user ${userId}:`, error);
    throw error.response?.data || new Error(error.message || 'Unknown error occurred');
  }
};