<template>
  <v-app style="background: transparent">
    <div class="app-background"></div>

    <transition name="page-fade" mode="out-in">
      <router-view />
    </transition>

    <GlobalSnackbar />
    <GlobalLoadingIndicator />
  </v-app>
</template>

<script setup>
import GlobalSnackbar from '@/components/layout/GlobalSnackbar.vue';
import GlobalLoadingIndicator from '@/components/layout/GlobalLoadingIndicator.vue';
</script>

<style>
.app-background {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100vh;
  z-index: -1;
  background: linear-gradient(-45deg, #ee7752, #e73c7e, #23a6d5, #23d5ab);
  background-size: 400% 400%;
  animation: moveGradient 15s ease infinite;
  opacity: 0.8;
}

@keyframes moveGradient {
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
}

.page-fade-enter-active,
.page-fade-leave-active {
  transition: opacity 0.2s ease;
}
.page-fade-enter-from,
.page-fade-leave-to {
  opacity: 0;
}
</style>