import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useLoadingStore = defineStore('loading', () => {
  const isLoading = ref(false);
  let requestCount = 0;

  function showLoading() {
    requestCount++;
    if (requestCount > 0) {
      isLoading.value = true;
    }
  }

  function hideLoading() {
    requestCount--;
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