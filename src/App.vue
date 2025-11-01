<template>
  <v-app>
    <router-view />
    
    <GlobalSnackbar />
    <GlobalLoadingIndicator />
  </v-app>
</template>

<script setup>
import GlobalSnackbar from '@/components/layout/GlobalSnackbar.vue';
import GlobalLoadingIndicator from '@/components/layout/GlobalLoadingIndicator.vue';
</script>