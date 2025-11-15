import axiosInstance from '@/config/axiosConfig';

export const checkoutApi = async (checkoutData) => {
  const response = await axiosInstance.post('/orders/checkout', checkoutData);
  return response.data.result;
};

export const getPaymentUrlApi = async (orderId) => {
  const response = await axiosInstance.get(`/orders/${orderId}/payment-url`);
  return response.data.result;
};