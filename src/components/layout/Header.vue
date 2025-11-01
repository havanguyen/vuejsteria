<template>
  <v-app-bar app color="primary" dark elevate-on-scroll>
    <v-container class="d-flex align-center py-0">
      <v-toolbar-title
        class="font-weight-bold"
        style="cursor: pointer"
        @click="goToHome"
      >
        <v-icon left class="mb-1">mdi-book-open-page-variant</v-icon>
        Bookteria
      </v-toolbar-title>

      <v-spacer></v-spacer>

      <v-btn :to="{ name: 'Home' }" text class="d-none d-sm-flex">
        <v-icon left>mdi-home</v-icon>
        Home
      </v-btn>

      <v-menu v-if="isAdmin" offset-y>
        <template v-slot:activator="{ props }">
          <v-btn v-bind="props" text class="d-none d-sm-flex">
            <v-icon left>mdi-shield-account</v-icon>
            Admin
            <v-icon right>mdi-menu-down</v-icon>
          </v-btn>
        </template>
        <v-list dense>
          <v-list-item :to="{ name: 'AdminUserList' }">
            <v-list-item-title>User Management</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>

      <v-spacer></v-spacer>

      <div v-if="!isAuthenticated">
        <v-btn :to="{ name: 'Login' }" text> Login </v-btn>
        <v-btn :to="{ name: 'Register' }" color="white" variant="outlined">
          Register
        </v-btn>
      </div>

      <div v-else>
        <v-menu offset-y>
          <template v-slot:activator="{ props }">
            <v-btn v-bind="props" text>
              <v-avatar size="36" class="mr-2 elevation-1">
                <v-img
                  :src="
                    user?.profileResponse?.avatarUrl ||
                    'https://via.placeholder.com/150'
                  "
                  alt="Avatar"
                  cover
                ></v-img>
              </v-avatar>
              Hi, {{ user?.profileResponse?.firstName || user?.username }}
              <v-icon right>mdi-menu-down</v-icon>
            </v-btn>
          </template>

          <v-list dense>
            <v-list-item :to="{ name: 'Profile' }">
              <template v-slot:prepend>
                <v-icon>mdi-account-circle</v-icon>
              </template>
              <v-list-item-title>My Profile</v-list-item-title>
            </v-list-item>
            <v-list-item :to="{ name: 'EditProfile' }">
              <template v-slot:prepend>
                <v-icon>mdi-account-edit</v-icon>
              </template>
              <v-list-item-title>Edit Profile</v-list-item-title>
            </v-list-item>
            <v-divider></v-divider>
            <v-list-item @click="handleLogout">
              <template v-slot:prepend>
                <v-icon color="error">mdi-logout</v-icon>
              </template>
              <v-list-item-title class="text-error">Logout</v-list-item-title>
            </v-list-item>
          </v-list>
        </v-menu>
      </div>
    </v-container>
  </v-app-bar>
</template>

<script setup>
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { storeToRefs } from 'pinia';
import { useAuthStore } from '@/stores/useAuthStore';

const router = useRouter();
const authStore = useAuthStore();
const { user, isAuthenticated, isAdmin } = storeToRefs(authStore);

const goToHome = () => {
  router.push({ name: 'Home' });
};

const handleLogout = () => {
  authStore.logout();
};
</script>