import axiosInstance from '@/config/axiosConfig';

export const getProfileApi = async (profileId) => {
  try {
    const response = await axiosInstance.get(`/profile/users/${profileId}`);
    return response.data.result;
  } catch (error) {
    console.error('Failed to fetch profile:', error);
    throw error.response?.data || error;
  }
};