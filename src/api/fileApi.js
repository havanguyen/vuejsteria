import axiosInstance from '@/config/axiosConfig';

export const uploadImageApi = async (formData) => {
  try {
    const response = await axiosInstance.post('/file/upload/image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data.result;
  } catch (error) {
    console.error(
      'LỖI KHI UPLOAD FILE SERVICE:',
      error.response || error.request || error.message
    );
    throw error.response?.data || error;
  }
};