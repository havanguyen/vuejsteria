import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export const useNotificationStore = defineStore('notification', () => {
  const snackbar = ref({
    show: false,
    text: '',
    title: '',
    icon: '',
    color: 'success',
    timeout: 3000,
    details: null, // For technical error details
  });

  const isVisible = computed({
    get: () => snackbar.value.show,
    set: (value) => { snackbar.value.show = value; }
  });

  const message = computed(() => snackbar.value.text);
  const title = computed(() => snackbar.value.title);
  const icon = computed(() => snackbar.value.icon);
  const color = computed(() => snackbar.value.color);
  const timeout = computed(() => snackbar.value.timeout);
  const details = computed(() => snackbar.value.details);

  function showNotification({
    text,
    title = '',
    icon = '',
    color = 'success',
    timeout = 4000,
    details = null
  }) {
    snackbar.value = {
      show: true,
      text,
      title,
      icon,
      color,
      timeout,
      details,
    };
  }

  function showSuccess(text, title = 'Thành công') {
    showNotification({
      text,
      title,
      icon: 'mdi-check-circle',
      color: 'success',
      timeout: 3000
    });
  }

  function showError(text, title = 'Đã xảy ra lỗi', details = null) {
    showNotification({
      text,
      title,
      icon: 'mdi-alert-circle',
      color: 'error',
      timeout: 5000,
      details
    });
  }

  function showWarning(text, title = 'Cảnh báo') {
    showNotification({
      text,
      title,
      icon: 'mdi-alert',
      color: 'warning',
      timeout: 4000
    });
  }

  function showInfo(text, title = 'Thông tin') {
    showNotification({
      text,
      title,
      icon: 'mdi-information',
      color: 'info',
      timeout: 3000
    });
  }

  function hideNotification() {
    snackbar.value.show = false;
  }

  return {
    snackbar,
    isVisible,
    message,
    title,
    icon,
    color,
    timeout,
    details,
    showNotification,
    showError,
    showSuccess,
    showWarning,
    showInfo,
    hideNotification,
  };
});