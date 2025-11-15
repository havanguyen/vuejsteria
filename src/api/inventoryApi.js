import axiosInstance from '@/config/axiosConfig';

export const getInventoryApi = async (bookId) => {
  const response = await axiosInstance.get(`/inventory/${bookId}`);
  return response.data.result;
};

export const setInventoryApi = async (bookId, quantity) => {
  const response = await axiosInstance.post('/inventory', { bookId, quantity });
  return response.data.result;
};