import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import {
  getMyCartApi,
  addToCartApi,
  removeProductFromCartApi,
  clearCartApi
} from '@/api/cartApi';
import { useNotificationStore } from './useNotificationStore';

export const useCartStore = defineStore('cart', () => {
  const items = ref([]);
  const isLoading = ref(false);
  const notificationStore = useNotificationStore();

  const itemCount = computed(() => {
    return items.value.reduce((total, item) => total + item.quantity, 0);
  });

  const totalPrice = computed(() => {
    return items.value.reduce((total, item) => {
      const price =
        item.productResponse.salePrice || item.productResponse.basePrice;
      return total + price * item.quantity;
    }, 0);
  });

  async function fetchCart() {
    isLoading.value = true;
    try {
      items.value = await getMyCartApi();
    } catch (error) {
      console.error('Failed to fetch cart:', error);
      items.value = [];
    } finally {
      isLoading.value = false;
    }
  }

  async function addProduct(bookId, quantity) {
    try {
      await addToCartApi({ bookId, quantity });
      await fetchCart();
      notificationStore.showSuccess('Product added to cart!');
    } catch (error) {
      notificationStore.showError(error.message || 'Failed to add product');
    }
  }

  async function removeProduct(productId) {
    try {
      await removeProductFromCartApi(productId);
      await fetchCart();
      notificationStore.showSuccess('Product removed from cart.');
    } catch (error) {
      notificationStore.showError(error.message || 'Failed to remove product');
    }
  }

  async function clearCart() {
    try {
      await clearCartApi();
      await fetchCart();
      notificationStore.showSuccess('Cart cleared.');
    } catch (error) {
      notificationStore.showError(error.message || 'Failed to clear cart');
    }
  }

  function clearLocalCart() {
    items.value = [];
  }

  return {
    items,
    isLoading,
    itemCount,
    totalPrice,
    fetchCart,
    addProduct,
    removeProduct,
    clearCart,
    clearLocalCart
  };
});