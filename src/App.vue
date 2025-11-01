<template>
  <v-app>
    <router-view />
    <GlobalSnackbar />
  </v-app>
</template>

<script setup>
import GlobalSnackbar from '@/components/layout/GlobalSnackbar.vue';
</script>