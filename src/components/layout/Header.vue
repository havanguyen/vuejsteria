<template>
  <v-app-bar
    app
    color="transparent"
    style="
      backdrop-filter: blur(10px) saturate(180%);
      -webkit-backdrop-filter: blur(10px) saturate(180%);
      background: rgba(255, 255, 255, 0.3);
      border-bottom: 1px solid rgba(255, 255, 255, 0.125);
    "
  >
    <v-container class="d-flex align-center py-0">
      <v-toolbar-title
        class="font-weight-bold text-primary"
        style="cursor: pointer"
        @click="goToHome"
      >
        <v-icon left class="mb-1">mdi-book-open-page-variant</v-icon>
        Bookteria
      </v-toolbar-title>

      <v-spacer></v-spacer>

      <v-autocomplete
        v-model="searchQuery"
        :items="searchResults"
        :loading="isSearching"
        @update:search="debouncedSearch"
        item-title="title"
        item-value="id"
        label="Tìm kiếm sách, tác giả..."
        density="comfortable"
        prepend-inner-icon="mdi-magnify"
        hide-no-data
        hide-details
        clearable
        style="max-width: 500px"
        class="mx-4"
        @keydown.enter="goToSearchPage"
        variant="solo"
        bg-color="rgba(255, 255, 255, 0.75)"
        flat
        rounded="lg"
        auto-select-first
      >
        <template v-slot:item="{ props, item }">
          <v-list-item
            v-bind="props"
            :prepend-avatar="item.raw.imageUrl"
            :title="item.raw.title"
            :subtitle="item.raw.authorName"
            @click="goToProductPage(item.raw.id)"
          ></v-list-item>
        </template>
      </v-autocomplete>
      <v-btn :to="{ name: 'Home' }" text class="d-none d-sm-flex text-primary">
        <v-icon left>mdi-home</v-icon>
        Home
      </v-btn>

      <v-menu v-if="isAdmin" offset-y>
        <template v-slot:activator="{ props }">
          <v-btn v-bind="props" text class="d-none d-sm-flex text-primary">
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

      <v-btn
        v-if="isAuthenticated"
        :to="{ name: 'Cart' }"
        icon
        class="text-primary mr-2"
      >
        <v-badge
          :content="itemCount"
          color="error"
          :model-value="itemCount > 0"
        >
          <v-icon>mdi-cart-outline</v-icon>
        </v-badge>
      </v-btn>

      <div v-if="!isAuthenticated">
        <v-btn :to="{ name: 'Login' }" text class="text-primary"> Login </v-btn>
        <v-btn :to="{ name: 'Register' }" color="primary" variant="flat">
          Register
        </v-btn>
      </div>

      <div v-else>
        <v-menu offset-y>
          <template v-slot:activator="{ props }">
            <v-btn v-bind="props" text class="text-primary">
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
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import { storeToRefs } from 'pinia';
import { useAuthStore } from '@/stores/useAuthStore';
import { useCartStore } from '@/stores/useCartStore';
import { searchProductsApi } from '@/api/searchApi';

const router = useRouter();
const authStore = useAuthStore();
const { user, isAuthenticated, isAdmin } = storeToRefs(authStore);

const cartStore = useCartStore();
const { itemCount } = storeToRefs(cartStore);

const searchQuery = ref(null);
const searchResults = ref([]);
const isSearching = ref(false);
let debounceTimer = null;

const goToHome = () => {
  router.push({ name: 'Home' });
};

const handleLogout = () => {
  authStore.logout();
};

const debouncedSearch = (query) => {
  if (!query || query.length < 2) {
    searchResults.value = [];
    return;
  }

  isSearching.value = true;
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(async () => {
    try {
      const data = await searchProductsApi(query, 0, 7);
      searchResults.value = data.content;
    } catch (error) {
      console.error(error);
      searchResults.value = [];
    } finally {
      isSearching.value = false;
    }
  }, 300);
};

const goToSearchPage = () => {
  const queryValue =
    typeof searchQuery.value === 'object'
      ? searchQuery.value.title
      : searchQuery.value;
  if (queryValue) {
    router.push({
      name: 'Search',
      query: { q: queryValue }
    });
    searchQuery.value = null;
    searchResults.value = [];
  }
};

const goToProductPage = (id) => {
  router.push({
    name: 'ProductDetail',
    params: { id: id }
  });
  searchQuery.value = null;
  searchResults.value = [];
};
</script>