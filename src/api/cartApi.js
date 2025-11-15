import axiosInstance from '@/config/axiosConfig';

export const getMyCartApi = async () => {
  const response = await axiosInstance.get('/my-cart');
  return response.data.result;
};

export const addToCartApi = async (cartData) => {
  const response = await axiosInstance.post('/my-cart', cartData);
  return response.data.result;
};

export const removeProductFromCartApi = async (productId) => {
  const response = await axiosInstance.delete(`/my-cart/${productId}`);
  return response.data.result;
};

export const clearCartApi = async () => {
  const response = await axiosInstance.delete('/my-cart');
  return response.data.result;
};