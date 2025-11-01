<template>
  <v-progress-linear
    :active="isLoading"
    indeterminate
    color="primary"
    absolute
    top
    style="z-index: 9999"
  ></v-progress-linear>
</template>

<script setup>
import { storeToRefs } from 'pinia';
import { useLoadingStore } from '@/stores/useLoadingStore';

const loadingStore = useLoadingStore();
const { isLoading } = storeToRefs(loadingStore);
</script>