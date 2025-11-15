import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useAnimationStore = defineStore('animation', () => {
  const isAnimating = ref(false);
  const sourceElement = ref(null);
  const imageUrl = ref(null);
  const startRect = ref(null);

  const startAnimation = (element, imgUrl) => {
    if (isAnimating.value) return;

    sourceElement.value = element;
    imageUrl.value = imgUrl;
    startRect.value = element.getBoundingClientRect();
    isAnimating.value = true;
  };

  const endAnimation = () => {
    isAnimating.value = false;
    sourceElement.value = null;
    imageUrl.value = null;
    startRect.value = null;
  };

  return {
    isAnimating,
    imageUrl,
    startRect,
    startAnimation,
    endAnimation
  };
});