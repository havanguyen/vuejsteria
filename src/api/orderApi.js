import axiosInstance from '@/config/axiosConfig';

export const checkoutApi = async (checkoutData) => {
  const response = await axiosInstance.post('/orders/checkout', checkoutData);
  return response.data.result;
};

export const getPaymentUrlApi = async (orderId) => {
  const response = await axiosInstance.get(`/orders/${orderId}/payment-url`);
  return response.data.result;
};

export const getOrderByIdApi = async (orderId) => {
  const response = await axiosInstance.get(`/orders/${orderId}`);
  return response.data.result;
};

export const getMyOrdersApi = async () => {
  const response = await axiosInstance.get('/orders/my-orders');
  return response.data.result;
};

export const getAllOrdersApi = async () => {
  const response = await axiosInstance.get('/orders');
  return response.data.result;
};

export const deleteOrderApi = async (orderId) => {
  const response = await axiosInstance.delete(`/orders/${orderId}`);
  return response.data.result;
};