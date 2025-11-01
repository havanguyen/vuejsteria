import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useNotificationStore = defineStore('notification', () => {
  const snackbar = ref({
    show: false,
    text: '',
    color: 'success',
    timeout: 3000
  });

  function showNotification(text, color = 'success', timeout = 3000) {
    snackbar.value = {
      show: true,
      text,
      color,
      timeout
    };
  }

  function showError(text, timeout = 3000) {
    showNotification(text, 'error', timeout);
  }

  function showSuccess(text, timeout = 3000) {
    showNotification(text, 'success', timeout);
  }

  function hideNotification() {
    snackbar.value.show = false;
  }

  return {
    snackbar,
    showNotification,
    showError,
    showSuccess,
    hideNotification
  };
});