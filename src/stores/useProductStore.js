import { defineStore } from 'pinia';
import { ref } from 'vue';
import { getProductsApi } from '@/api/productApi';
import { searchProductsApi } from '@/api/searchApi';
import { useNotificationStore } from './useNotificationStore';

export const useProductStore = defineStore('product', () => {
  const notificationStore = useNotificationStore();

  const products = ref([]);
  const pagination = ref({
    page: 0,
    size: 10,
    totalPages: 0,
    totalElements: 0
  });

  const fetchProducts = async (page = 0, size = 10) => {
    try {
      const data = await getProductsApi(page, size);
      products.value = data.content;
      pagination.value = {
        page: data.pageable.pageNumber,
        size: data.pageable.pageSize,
        totalPages: data.totalPages,
        totalElements: data.totalElements
      };
    } catch (error) {
      console.error('Failed to fetch products:', error);
      products.value = [];
      notificationStore.showError('Không thể tải danh sách sản phẩm.');
    }
  };

  const searchProducts = async (query, page = 0, size = 10) => {
    try {
      const data = await searchProductsApi(query, page, size);
      products.value = data.content;
      pagination.value = {
        page: data.pageable.pageNumber,
        size: data.pageable.pageSize,
        totalPages: data.totalPages,
        totalElements: data.totalElements
      };
    } catch (error) {
      console.error('Failed to search products:', error);
      products.value = [];
      notificationStore.showError('Không thể thực hiện tìm kiếm.');
    }
  };

  return {
    products,
    pagination,
    fetchProducts,
    searchProducts
  };
});