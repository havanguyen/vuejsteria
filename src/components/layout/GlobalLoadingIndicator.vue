<template>
  <v-overlay
    :model-value="loadingStore.isLoading"
    class="align-center justify-center"
    persistent
    scrim="true"
  >
    <v-progress-circular
      indeterminate
      color="primary"
      size="64"
    ></v-progress-circular>
  </v-overlay>
</template>

<script setup>
import { useLoadingStore } from '@/stores/useLoadingStore';
const loadingStore = useLoadingStore();
</script>