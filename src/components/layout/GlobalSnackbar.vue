<template>
  <v-snackbar
    v-model="notificationStore.isVisible"
    :timeout="notificationStore.timeout"
    location="top right"
    variant="text"
    class="global-snackbar"
    transition="slide-x-reverse-transition"
  >
    <div class="glass-alert pa-4 rounded-lg d-flex flex-column" :class="`border-${notificationStore.color}`">
      <div class="d-flex align-center">
        <v-icon
          :color="notificationStore.color"
          :icon="notificationStore.icon"
          size="28"
          class="mr-3"
        ></v-icon>
        
        <div class="flex-grow-1 mr-2">
          <div class="text-subtitle-1 font-weight-bold" :class="`text-${notificationStore.color}`">
            {{ notificationStore.title }}
          </div>
          <div class="text-body-2 text-medium-emphasis">
            {{ notificationStore.message }}
          </div>
        </div>

        <v-btn
          icon="mdi-close"
          variant="text"
          density="compact"
          color="grey"
          @click="notificationStore.hideNotification"
        ></v-btn>
      </div>

      <!-- Technical Details Section -->
      <div v-if="notificationStore.details" class="mt-2">
        <v-expand-transition>
          <div v-if="showDetails">
            <v-divider class="my-2"></v-divider>
            <div class="bg-grey-lighten-4 rounded pa-2 text-caption font-monospace text-grey-darken-3" style="max-height: 100px; overflow-y: auto;">
              {{ notificationStore.details }}
            </div>
            <div class="d-flex justify-end mt-1">
              <v-btn
                prepend-icon="mdi-content-copy"
                variant="text"
                density="compact"
                size="small"
                color="primary"
                @click="copyError"
              >
                Copy
              </v-btn>
            </div>
          </div>
        </v-expand-transition>
        
        <div class="d-flex justify-end">
          <v-btn
            :prepend-icon="showDetails ? 'mdi-chevron-up' : 'mdi-chevron-down'"
            variant="text"
            density="compact"
            size="x-small"
            color="grey-darken-1"
            class="mt-1"
            @click="showDetails = !showDetails"
          >
            {{ showDetails ? 'Ẩn chi tiết' : 'Chi tiết lỗi' }}
          </v-btn>
        </div>
      </div>
    </div>
  </v-snackbar>
</template>

<script setup>
import { ref, watch } from 'vue';
import { useNotificationStore } from '@/stores/useNotificationStore';

const notificationStore = useNotificationStore();
const showDetails = ref(false);

// Reset details expansion when notification changes
watch(() => notificationStore.isVisible, (newVal) => {
  if (!newVal) {
    showDetails.value = false;
  }
});

const copyError = async () => {
  try {
    await navigator.clipboard.writeText(JSON.stringify(notificationStore.details, null, 2));
    // Optional: Show a mini toast or change icon to checkmark temporarily
  } catch (err) {
    console.error('Failed to copy error:', err);
  }
};
</script>

<style scoped>
.global-snackbar :deep(.v-snackbar__content) {
  padding: 0;
}

.glass-alert {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.15);
  border-left: 4px solid;
  min-width: 300px;
  max-width: 400px;
}

/* Dark mode support if needed, though app seems colorful/light based on App.vue */
@media (prefers-color-scheme: dark) {
  .glass-alert {
    background: rgba(30, 30, 30, 0.95);
    color: white;
  }
  .text-medium-emphasis {
    color: rgba(255, 255, 255, 0.7) !important;
  }
}
</style>