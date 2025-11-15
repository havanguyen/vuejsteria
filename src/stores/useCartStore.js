import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import {
  getMyCartApi,
  addToCartApi,
  updateCartApi,
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
      notificationStore.showError(error.message || 'Failed to fetch cart');
      items.value = [];
    } finally {
      isLoading.value = false;
    }
  }

  async function addProduct(product, quantity) {
    const existingItem = items.value.find(
      (i) => i.productResponse.id === product.id
    );

    if (existingItem) {
      await updateProductQuantity(
        product.id,
        existingItem.quantity + quantity
      );
    } else {
      try {
        const newItem = await addToCartApi({
          bookId: product.id,
          quantity: quantity
        });
        items.value.push(newItem);
        notificationStore.showSuccess('Product added to cart!');
      } catch (error) {
        notificationStore.showError(error.message || 'Failed to add product');
      }
    }
  }

  async function updateProductQuantity(bookId, quantity) {
    const oldItems = JSON.parse(JSON.stringify(items.value));
    const itemIndex = items.value.findIndex(
      (i) => i.productResponse.id === bookId
    );
    if (itemIndex === -1) return;

    const oldQuantity = items.value[itemIndex].quantity;
    items.value[itemIndex].quantity = quantity;

    try {
      const updatedItem = await updateCartApi({ bookId, quantity });
      items.value[itemIndex] = updatedItem;
    } catch (error) {
      notificationStore.showError(
        error.message || 'Failed to update quantity'
      );
      items.value[itemIndex].quantity = oldQuantity;
    }
  }

  async function removeProduct(bookId) {
    const itemIndex = items.value.findIndex(
      (i) => i.productResponse.id === bookId
    );
    if (itemIndex === -1) return;

    const itemToRemove = items.value.splice(itemIndex, 1)[0];

    try {
      await removeProductFromCartApi(bookId);
      notificationStore.showSuccess('Product removed from cart.');
    } catch (error) {
      notificationStore.showError(error.message || 'Failed to remove product');
      items.value.splice(itemIndex, 0, itemToRemove);
    }
  }

  async function clearCart() {
    const oldItems = [...items.value];
    items.value = [];
    try {
      await clearCartApi();
      notificationStore.showSuccess('Cart cleared.');
    } catch (error) {
      notificationStore.showError(error.message || 'Failed to clear cart');
      items.value = oldItems;
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
    updateProductQuantity,
    removeProduct,
    clearCart,
    clearLocalCart
  };
});