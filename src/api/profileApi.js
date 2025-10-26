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

export const updateProfileApi = async (userId, profileData) => {
  try {
    const response = await axiosInstance.put(`/profile/users/by-user/${userId}`, profileData);
    return response.data.result;
  } catch (error) {
    console.error('Failed to update profile:', error);
    throw error.response?.data || error;
  }
};