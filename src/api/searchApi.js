import axiosInstance from '@/config/axiosConfig';

const API_BASE = '/search';

export const searchProductsApi = async (
  query,
  page = 0,
  size = 10
) => {
  const response = await axiosInstance.get(
    `${API_BASE}/product?q=${encodeURIComponent(query)}&page=${page}&size=${size}`,
    { silent: true } // THÊM CỜ NÀY
  );
  return response.data;
};

export const syncSearchApi = async () => {
  const response = await axiosInstance.post(`${API_BASE}/sync`);
  return response.data;
};