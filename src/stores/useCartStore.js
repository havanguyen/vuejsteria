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
import { debounce } from '@/utils/debounce';

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

  async function fetchCart(config = {}) {
    isLoading.value = true;
    try {
      items.value = await getMyCartApi(config);
    } catch (error) {
      console.error('Failed to fetch cart:', error);
      // Silent fail or minimal error for initial fetch to avoid annoyance
      // notificationStore.showError('Không thể tải giỏ hàng', 'Lỗi', error); 
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
      // Optimistic update for UI responsiveness
      const oldQuantity = existingItem.quantity;
      existingItem.quantity += quantity;

      // Debounced API call handled by updateProductQuantity logic if we were calling it directly,
      // but here we are adding. For adding, we usually want immediate feedback.
      // However, if we want to reuse the debounce logic, we should call the debounced function.
      // But addProduct is usually a single click.

      try {
        await updateCartApi({ bookId: product.id, quantity: existingItem.quantity });
        notificationStore.showSuccess('Đã cập nhật số lượng!', 'Giỏ hàng');
      } catch (error) {
        existingItem.quantity = oldQuantity; // Rollback
        notificationStore.showError('Không thể thêm sản phẩm', 'Lỗi thêm giỏ hàng', error);
      }

    } else {
      try {
        const newItem = await addToCartApi({
          bookId: product.id,
          quantity: quantity
        });
        items.value.push(newItem);
        notificationStore.showSuccess('Đã thêm vào giỏ hàng!', 'Thành công');
      } catch (error) {
        notificationStore.showError('Không thể thêm sản phẩm', 'Lỗi', error);
      }
    }
  }

  // Debounced API call for quantity updates
  const debouncedUpdateApi = debounce(async (bookId, quantity, itemIndex, oldQuantity) => {
    try {
      const updatedItem = await updateCartApi({ bookId, quantity });
      // Update with server response to be sure
      if (items.value[itemIndex]) {
        items.value[itemIndex] = updatedItem;
      }
    } catch (error) {
      notificationStore.showError(
        'Không thể cập nhật số lượng',
        'Lỗi cập nhật',
        error
      );
      // Rollback on error
      if (items.value[itemIndex]) {
        items.value[itemIndex].quantity = oldQuantity;
      }
    }
  }, 500);

  function updateProductQuantity(bookId, quantity) {
    const itemIndex = items.value.findIndex(
      (i) => i.productResponse.id === bookId
    );
    if (itemIndex === -1) return;

    const oldQuantity = items.value[itemIndex].quantity;

    // Optimistic UI update
    items.value[itemIndex].quantity = quantity;

    // Call debounced API
    debouncedUpdateApi(bookId, quantity, itemIndex, oldQuantity);
  }

  async function removeProduct(bookId) {
    const itemIndex = items.value.findIndex(
      (i) => i.productResponse.id === bookId
    );
    if (itemIndex === -1) return;

    const itemToRemove = items.value.splice(itemIndex, 1)[0];

    try {
      await removeProductFromCartApi(bookId);
      notificationStore.showSuccess('Đã xóa sản phẩm khỏi giỏ hàng.');
    } catch (error) {
      notificationStore.showError('Không thể xóa sản phẩm', 'Lỗi', error);
      items.value.splice(itemIndex, 0, itemToRemove);
    }
  }

  async function clearCart() {
    const oldItems = [...items.value];
    items.value = [];
    try {
      await clearCartApi();
      notificationStore.showSuccess('Đã xóa toàn bộ giỏ hàng.');
    } catch (error) {
      notificationStore.showError('Không thể xóa giỏ hàng', 'Lỗi', error);
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