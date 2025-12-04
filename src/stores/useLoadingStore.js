import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useLoadingStore = defineStore('loading', () => {
  const isLoading = ref(false);
  let requestCount = 0;

  function showLoading() {
    requestCount++;
    console.log(`[LoadingStore] showLoading. Count: ${requestCount}`);
    if (requestCount > 0) {
      isLoading.value = true;
    }
  }

  function hideLoading() {
    requestCount--;
    console.log(`[LoadingStore] hideLoading. Count: ${requestCount}`);
    if (requestCount <= 0) {
      isLoading.value = false;
      requestCount = 0;
    }
  }

  return {
    isLoading,
    showLoading,
    hideLoading
  };
});