import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export const useNotificationStore = defineStore('notification', () => {
  const snackbar = ref({
    show: false,
    text: '',
    color: 'success',
    timeout: 3000,
  });

  const isVisible = computed({
    get: () => snackbar.value.show,
    set: (value) => { snackbar.value.show = value; }
  });
  const message = computed(() => snackbar.value.text);
  const color = computed(() => snackbar.value.color);
  const timeout = computed(() => snackbar.value.timeout);

  function showNotification(text, color = 'success', timeout = 3000) {
    snackbar.value = {
      show: true,
      text,
      color,
      timeout,
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
    isVisible,
    message,
    color,
    timeout,
    showNotification,
    showError,
    showSuccess,
    hideNotification,
  };
});