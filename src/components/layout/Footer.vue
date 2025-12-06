<template>
  <v-footer class="glass-footer text-center d-flex flex-column py-8 mt-auto">
    <v-container>
      <v-row justify="center" class="mb-4">
        <v-col cols="12" md="8">
          <div class="d-flex align-center justify-center mb-4">
            <v-icon color="primary" size="32" class="mr-2">mdi-book-open-page-variant</v-icon>
            <span class="text-h5 font-weight-bold text-primary">Bookteria</span>
          </div>
          <div class="text-body-1 text-medium-emphasis mb-6">
            Your premium destination for books. Discover stories that inspire, educate, and entertain.
          </div>
          
          <div class="d-flex justify-center gap-4 mb-6">
            <v-btn
              v-for="icon in icons"
              :key="icon"
              :icon="icon"
              variant="tonal"
              size="small"
              color="primary"
              class="social-btn"
            ></v-btn>
          </div>
        </v-col>
      </v-row>
      
      <v-divider class="mb-4 opacity-20"></v-divider>
      
      <div class="text-body-2 text-medium-emphasis">
        &copy; {{ new Date().getFullYear() }} — <strong>Bookteria</strong>. All rights reserved.
      </div>
      
      <div class="mt-2">
        <router-link to="/privacy-policy" class="text-caption text-decoration-none text-medium-emphasis mr-4 hover-link">Privacy Policy</router-link>
        <router-link to="/terms-of-service" class="text-caption text-decoration-none text-medium-emphasis hover-link">Terms of Service</router-link>
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
  transform: translateY(-3px);
  background-color: rgb(var(--v-theme-primary)) !important;
  color: white !important;
}

.gap-4 {
  gap: 16px;
}

.opacity-20 {
  opacity: 0.2;
}

.hover-link {
  transition: color 0.2s ease;
}

.hover-link:hover {
  color: rgb(var(--v-theme-primary)) !important;
}
</style>