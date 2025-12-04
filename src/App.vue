<template>
  <v-app style="background: transparent">
    <div class="app-background"></div>

    <router-view v-slot="{ Component }">
      <transition name="page-fade" mode="out-in">
        <component :is="Component" />
      </transition>
    </router-view>

    <GlobalSnackbar />
    <GlobalLoadingIndicator />

    <v-img
      v-if="isAnimating && imageUrl"
      :src="imageUrl"
      class="flying-cart-item"
      :style="flyerStyle"
      @transitionend="animationStore.endAnimation"
    ></v-img>
  </v-app>
</template>

<script setup>
import { ref, watch, nextTick } from 'vue';
import GlobalSnackbar from '@/components/layout/GlobalSnackbar.vue';
import GlobalLoadingIndicator from '@/components/layout/GlobalLoadingIndicator.vue';
import { useAnimationStore } from '@/stores/useAnimationStore';
import { storeToRefs } from 'pinia';

const animationStore = useAnimationStore();
const { isAnimating, imageUrl, startRect } = storeToRefs(animationStore);
const flyerStyle = ref({});

watch(isAnimating, (newValue) => {
  if (newValue && startRect.value) {
    const targetEl = document.getElementById('cart-icon-btn');
    if (!targetEl) {
      animationStore.endAnimation();
      return;
    }
    const targetRect = targetEl.getBoundingClientRect();

    flyerStyle.value = {
      top: `${startRect.value.top}px`,
      left: `${startRect.value.left}px`,
      width: `${startRect.value.width}px`,
      height: `${startRect.value.height}px`,
      opacity: 1,
      transform: 'scale(1)',
      transition: 'none'
    };

    nextTick(() => {
      flyerStyle.value = {
        top: `${targetRect.top + targetRect.height / 2}px`,
        left: `${targetRect.left + targetRect.width / 2}px`,
        width: '20px',
        height: '20px',
        opacity: 0,
        transform: 'scale(0.1) rotate(360deg)',
        transition: 'all 0.7s ease-in-out'
      };
    });
  } else {
    flyerStyle.value = { opacity: 0 };
  }
});
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

.flying-cart-item {
  position: fixed;
  z-index: 9999;
  border-radius: 10%;
  overflow: hidden;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
}
</style>