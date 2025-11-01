<template>
  <v-snackbar
    v-model="snackbar.show"
    :color="snackbar.color"
    :timeout="snackbar.timeout"
    location="top right"
    @update:modelValue="onClose"
  >
    {{ snackbar.text }}
    <template v-slot:actions>
      <v-btn
        color="white"
        variant="text"
        @click="notificationStore.hideNotification"
      >
        Đóng
      </v-btn>
    </template>
  </v-snackbar>
</template>

<script setup>
import { storeToRefs } from 'pinia';
import { useNotificationStore } from '@/stores/useNotificationStore';

const notificationStore = useNotificationStore();
const { snackbar } = storeToRefs(notificationStore);

const onClose = (value) => {
  if (!value) {
    notificationStore.hideNotification();
  }
};
</script>