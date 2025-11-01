import axiosInstance from '@/config/axiosConfig';

const API_BASE = '/products';
const CATEGORY_BASE = '/categories';
const AUTHOR_BASE = '/authors';
const PUBLISHER_BASE = '/publishers';

export const getProductsApi = async (
  page = 0,
  size = 10,
  sort = 'title,asc'
) => {
  const response = await axiosInstance.get(
    `${API_BASE}?page=${page}&size=${size}&sort=${sort}`
  );
  return response.data.result;
};

export const getProductByIdApi = async (id) => {
  const response = await axiosInstance.get(`${API_BASE}/${id}`);
  if (response.data && response.data.code === 1000) {
    return response.data.result;
  }
  return response.data;
};

export const createProductApi = async (productData) => {
  const response = await axiosInstance.post(API_BASE, productData);
  return response.data.result;
};

export const updateProductApi = async (id, productData) => {
  const response = await axiosInstance.put(`${API_BASE}/${id}`, productData);
  return response.data.result;
};

export const deleteProductApi = async (id) => {
  const response = await axiosInstance.delete(`${API_BASE}/${id}`);
  return response.data.result;
};

export const getCategoriesApi = async () => {
  const response = await axiosInstance.get(CATEGORY_BASE);
  return response.data.result;
};

export const createCategoryApi = async (categoryData) => {
  const response = await axiosInstance.post(CATEGORY_BASE, categoryData);
  return response.data.result;
};

export const updateCategoryApi = async (id, categoryData) => {
  const response = await axiosInstance.put(
    `${CATEGORY_BASE}/${id}`,
    categoryData
  );
  return response.data.result;
};

export const deleteCategoryApi = async (id) => {
  const response = await axiosInstance.delete(`${CATEGORY_BASE}/${id}`);
  return response.data.result;
};

export const getAuthorsApi = async (
  page = 0,
  size = 20,
  sort = 'name,asc'
) => {
  const response = await axiosInstance.get(
    `${AUTHOR_BASE}?page=${page}&size=${size}&sort=${sort}`
  );
  return response.data.result;
};

export const createAuthorApi = async (authorData) => {
  const response = await axiosInstance.post(AUTHOR_BASE, authorData);
  return response.data.result;
};

export const updateAuthorApi = async (id, authorData) => {
  const response = await axiosInstance.put(`${AUTHOR_BASE}/${id}`, authorData);
  return response.data.result;
};

export const deleteAuthorApi = async (id) => {
  const response = await axiosInstance.delete(`${AUTHOR_BASE}/${id}`);
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

export const createPublisherApi = async (publisherData) => {
  const response = await axiosInstance.post(PUBLISHER_BASE, publisherData);
  return response.data.result;
};

export const updatePublisherApi = async (id, publisherData) => {
  const response = await axiosInstance.put(
    `${PUBLISHER_BASE}/${id}`,
    publisherData
  );
  return response.data.result;
};

export const deletePublisherApi = async (id) => {
  const response = await axiosInstance.delete(`${PUBLISHER_BASE}/${id}`);
  return response.data.result;
};