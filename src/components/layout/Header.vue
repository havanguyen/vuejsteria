<script setup>
import { computed } from 'vue';
import { useRouter, RouterLink } from 'vue-router';
import { useAuthStore } from '@/stores/useAuthStore';

const authStore = useAuthStore();
const router = useRouter();

const isAuthenticated = computed(() => authStore.isAuthenticated);

const handleLogout = () => {
  authStore.logout();
  router.push('/login');
};
</script>

<template>
  <v-app-bar color="surface" app>
    <v-toolbar-title class="font-weight-bold">
      <router-link to="/" class="text-decoration-none text-primary d-flex align-center">
        <v-icon icon="mdi-book-open-page-variant" class="mr-2" />
        Bookteria
      </router-link>
    </v-toolbar-title>

    <v-spacer />

    <v-btn :to="{ name: 'Home' }" text>Home</v-btn>

    <template v-if="isAuthenticated">
      <v-btn :to="{ name: 'Profile' }" text>Profile</v-btn>
      <v-btn @click="handleLogout" text>Logout</v-btn>
    </template>
    <template v-else>
      <v-btn :to="{ name: 'Login' }" text>Login</v-btn>
      <v-btn :to="{ name: 'Register' }" variant="flat" color="primary">Sign Up</v-btn>
    </template>
  </v-app-bar>
</template>