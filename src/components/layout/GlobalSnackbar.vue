<template>
  <v-snackbar
    v-model="notificationStore.isVisible"
    :color="notificationStore.color"
    :timeout="notificationStore.timeout"
    location="top right"
    multi-line
  >
    {{ notificationStore.message }}
    <template v-slot:actions>
      <v-btn
        variant="text"
        @click="notificationStore.hideNotification"
      >
        Close
      </v-btn>
    </template>
  </v-snackbar>
</template>

<script setup>
import { useNotificationStore } from '@/stores/useNotificationStore';
const notificationStore = useNotificationStore();
</script>