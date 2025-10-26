<script setup>
import { computed, ref } from 'vue';
import { useRouter, RouterLink, useRoute } from 'vue-router';
import { useAuthStore } from '@/stores/useAuthStore';

const authStore = useAuthStore();
const router = useRouter();
const route = useRoute();

const isAuthenticated = computed(() => authStore.isAuthenticated);
const drawer = ref(false);

const handleLogout = () => {
  authStore.logout();
  router.push('/login');
};

const menuItems = computed(() => [
    { title: 'Home', name: 'Home', icon: 'mdi-home-outline', requiresAuth: false },
    { title: 'Profile', name: 'Profile', icon: 'mdi-account-circle-outline', requiresAuth: true },
]);

const isActive = (itemName) => route.name === itemName;
</script>

<template>
  <v-app-bar app color="surface" density="compact" border="b">

    <v-app-bar-nav-icon class="d-md-none" @click.stop="drawer = !drawer"></v-app-bar-nav-icon>

    <v-toolbar-title class="font-weight-bold">
      <router-link to="/" class="text-decoration-none text-primary d-flex align-center">
        <v-icon icon="mdi-book-open-page-variant" class="mr-2" />
        Bookteria
      </router-link>
    </v-toolbar-title>

    <v-spacer />

    <div class="d-none d-md-flex align-center">
      <template v-for="item in menuItems" :key="item.name">
         <v-btn
           v-if="!item.requiresAuth || (item.requiresAuth && isAuthenticated)"
           :to="{ name: item.name }"
           :variant="isActive(item.name) ? 'tonal' : 'text'"
           class="mx-1"
         >
           {{ item.title }}
         </v-btn>
      </template>

      <template v-if="isAuthenticated">
        <v-btn @click="handleLogout" variant="text" class="mx-1">Logout</v-btn>
      </template>
      <template v-else>
        <v-btn :to="{ name: 'Login' }" :variant="isActive('Login') ? 'tonal' : 'text'" class="mx-1">Login</v-btn>
        <v-btn :to="{ name: 'Register' }" variant="flat" color="primary" class="ml-2">Sign Up</v-btn>
      </template>
    </div>
  </v-app-bar>

   <v-navigation-drawer v-model="drawer" temporary app class="d-md-none">
      <v-list density="compact" nav>
         <v-list-item
           v-for="item in menuItems"
           :key="item.name"
           v-if="item && (!item.requiresAuth || (item.requiresAuth && isAuthenticated))"
           :prepend-icon="item.icon"
           :title="item.title"
           :to="{ name: item.name }"
           :active="isActive(item.name)"
           @click="drawer = false"
         ></v-list-item>

         <v-divider class="my-2"></v-divider>

          <template v-if="isAuthenticated">
             <v-list-item
               prepend-icon="mdi-logout"
               title="Logout"
               @click="handleLogout(); drawer = false;"
             ></v-list-item>
          </template>
          <template v-else>
             <v-list-item
               prepend-icon="mdi-login"
               title="Login"
               :to="{ name: 'Login' }"
               :active="isActive('Login')"
               @click="drawer = false"
             ></v-list-item>
              <v-list-item
               prepend-icon="mdi-account-plus-outline"
               title="Sign Up"
               :to="{ name: 'Register' }"
               :active="isActive('Register')"
               @click="drawer = false"
             ></v-list-item>
          </template>
      </v-list>
   </v-navigation-drawer>

</template>