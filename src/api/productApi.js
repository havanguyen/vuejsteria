import axiosInstance from '@/config/axiosConfig';

const API_BASE = '/products';
const CATEGORY_BASE = '/categories';
const AUTHOR_BASE = '/authors';
const PUBLISHER_BASE = '/publishers';

export const getProductsApi = async (page = 0, size = 10, sort = 'title,asc') => {
  const response = await axiosInstance.get(
    `${API_BASE}?page=${page}&size=${size}&sort=${sort}`
  );
  return response.data.result;
};

export const getProductByIdApi = async (id) => {
  const response = await axiosInstance.get(`${API_BASE}/${id}`);

  // NÂNG CẤP: Xử lý lỗi
  // Kiểm tra xem đây có phải là cấu trúc ApiResponse chuẩn không
  if (response.data && response.data.code === 1000) {
    return response.data.result;
  }

  // Nếu không, giả định API trả về dữ liệu trực tiếp (giống Search Service)
  // để xử lý sự không nhất quán của API
  return response.data;
};

export const getCategoriesApi = async () => {
  const response = await axiosInstance.get(CATEGORY_BASE);
  return response.data.result;
};

export const getAuthorsApi = async (page = 0, size = 20, sort = 'name,asc') => {
  const response = await axiosInstance.get(
    `${AUTHOR_BASE}?page=${page}&size=${size}&sort=${sort}`
  );
  return response.data.result;
};

export const getPublishersApi = async (
  page = 0,
  size = 20,
  sort = 'name,asc'
) => {
  const response = await axiosInstance.get(
    `${PUBLISHER_BASE}?page=${page}&size=${size}&sort=${sort}`
  );
  return response.data.result;
};