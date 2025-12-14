<template>
  <v-container class="fill-height">
    <v-row align="center" justify="center">
      <v-col cols="12" class="text-center">
        <v-progress-circular
          indeterminate
          color="primary"
          size="64"
        ></v-progress-circular>
        <div class="mt-4 text-h6">Authenticating...</div>
        <div v-if="error" class="mt-4 text-error">
          {{ error }}
        </div>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/useAuthStore';
import { useNotificationStore } from '@/stores/useNotificationStore';

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const notificationStore = useNotificationStore();

const error = ref(null);

onMounted(async () => {
  const code = route.query.code;
  if (!code) {
    error.value = 'No authentication code found.';
    setTimeout(() => router.push('/login'), 2000);
    return;
  }

  try {
    await authStore.googleCallback(code);
    notificationStore.showSuccess('Login successful!');
    router.push('/');
  } catch (err) {
    console.error('Google login failed:', err);
    error.value = 'Login failed. Please try again.';
    notificationStore.showError('Google authentication failed.');
    setTimeout(() => router.push('/login'), 2000);
  }
});
</script>
