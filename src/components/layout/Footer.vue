<template>
  <v-footer class="glass-footer py-2 mt-auto">
    <v-container class="py-0">
      <div class="d-flex flex-column flex-md-row align-center justify-space-between w-100">
        <!-- Left Side: Logo & Copyright -->
        <div class="d-flex align-center mb-2 mb-md-0">
          <v-img src="/favicon.ico" width="24" height="24" class="mr-2" contain></v-img>
          <span class="text-subtitle-1 font-weight-bold text-primary mr-4">Bookteria</span>
          <span class="text-caption text-medium-emphasis">
            &copy; {{ new Date().getFullYear() }}
          </span>
        </div>

        <!-- Right Side: Links & Social -->
        <div class="d-flex align-center flex-wrap justify-center gap-4">
          <div class="d-flex align-center mr-md-4">
            <router-link to="/privacy-policy" class="text-caption text-decoration-none text-medium-emphasis mr-4 hover-link">Privacy</router-link>
            <router-link to="/terms-of-service" class="text-caption text-decoration-none text-medium-emphasis hover-link">Terms</router-link>
          </div>
          
          <div class="d-flex gap-2">
            <v-btn
              v-for="icon in icons"
              :key="icon"
              :icon="icon"
              variant="text"
              density="comfortable"
              size="small"
              color="medium-emphasis"
              class="social-btn"
            ></v-btn>
          </div>
        </div>
      </div>
    </v-container>
  </v-footer>
</template>

<script setup>
import { ref } from 'vue';

const icons = ref([
  'mdi-facebook',
  'mdi-twitter',
  'mdi-linkedin',
  'mdi-instagram',
]);
</script>

<style scoped>
.glass-footer {
  background: rgba(255, 255, 255, 0.8) !important;
  backdrop-filter: blur(20px);
  border-top: 1px solid rgba(255, 255, 255, 0.3);
}

.social-btn {
  transition: all 0.2s ease;
}

.social-btn:hover {
  color: rgb(var(--v-theme-primary)) !important;
  transform: translateY(-2px);
}

.gap-2 {
  gap: 8px;
}

.gap-4 {
  gap: 16px;
}

.hover-link {
  transition: color 0.2s ease;
}

.hover-link:hover {
  color: rgb(var(--v-theme-primary)) !important;
}
</style>