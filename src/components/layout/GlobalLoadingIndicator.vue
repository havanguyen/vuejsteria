<template>
  <v-overlay
    :model-value="loadingStore.isLoading"
    class="align-center justify-center"
    persistent
    scrim="rgba(255, 255, 255, 0.3)"
    style="backdrop-filter: blur(4px)"
  >
    <v-progress-circular
      indeterminate
      color="primary"
      size="64"
      width="6"
    ></v-progress-circular>
  </v-overlay>
</template>

<script setup>
import { useLoadingStore } from '@/stores/useLoadingStore';
const loadingStore = useLoadingStore();
</script>