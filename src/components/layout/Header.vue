<template>
  <v-app-bar
    app
    color="transparent"
    elevation="0"
    class="glass-header"
    height="72"
  >
    <v-container class="d-flex align-center py-0 h-100">
      <v-toolbar-title
        class="font-weight-black text-h5 d-flex align-center"
        style="cursor: pointer; min-width: 180px"
        @click="goToHome"
      >
        <div class="d-flex align-center logo-container">
          <v-img src="/favicon.ico" width="32" height="32" class="mr-2 logo-icon" contain></v-img>
          <span class="text-primary logo-text">Bookteria</span>
        </div>
      </v-toolbar-title>

      <v-spacer></v-spacer>

      <div class="search-container mx-4 flex-grow-1" style="max-width: 600px">
        <v-autocomplete
          v-model="searchQuery"
          :items="searchResults"
          :loading="isSearching"
          @update:search="debouncedSearch"
          item-title="title"
          item-value="id"
          placeholder="Search for books, authors..."
          density="comfortable"
          prepend-inner-icon="mdi-magnify"
          hide-no-data
          hide-details
          clearable
          @keydown.enter="goToSearchPage"
          variant="solo"
          class="glass-search rounded-xl"
          flat
          menu-icon=""
          auto-select-first
        >
          <template v-slot:item="{ props, item }">
            <v-list-item
              v-bind="props"
              :prepend-avatar="item.raw.imageUrl"
              :title="item.raw.title"
              :subtitle="item.raw.authorName"
              @click="goToProductPage(item.raw.id)"
              class="search-item ma-1 rounded-lg"
            ></v-list-item>
          </template>
        </v-autocomplete>
      </div>

      <v-spacer></v-spacer>

      <div class="d-none d-md-flex align-center gap-2">
        <v-btn
          :to="{ name: 'Home' }"
          variant="text"
          class="nav-btn text-capitalize"
          rounded="lg"
        >
          <v-icon start>mdi-home-outline</v-icon>
          Home
        </v-btn>

        <v-menu v-if="isAdmin" offset-y open-on-hover transition="slide-y-transition">
          <template v-slot:activator="{ props }">
            <v-btn
              v-bind="props"
              variant="text"
              class="nav-btn text-capitalize"
              rounded="lg"
            >
              <v-icon start>mdi-shield-account-outline</v-icon>
              Admin
              <v-icon end size="small">mdi-chevron-down</v-icon>
            </v-btn>
          </template>
          <v-list class="glass-menu pa-2" density="compact" rounded="lg" elevation="4">
            <v-list-item
              :to="{ name: 'AdminUserList' }"
              rounded="lg"
              class="mb-1 menu-item"
              prepend-icon="mdi-account-group-outline"
            >
              <v-list-item-title>User Management</v-list-item-title>
            </v-list-item>
            <v-list-item
              :to="{ name: 'AdminProductList' }"
              rounded="lg"
              class="menu-item"
              prepend-icon="mdi-book-cog-outline"
            >
              <v-list-item-title>Product Management</v-list-item-title>
            </v-list-item>
          </v-list>
        </v-menu>
      </div>

      <v-divider vertical class="mx-4 d-none d-md-flex opacity-20" style="height: 24px"></v-divider>

      <v-btn
        v-if="isAuthenticated"
        :to="{ name: 'Cart' }"
        icon
        class="cart-btn mr-2"
        id="cart-icon-btn"
        variant="text"
      >
        <v-badge
          :content="itemCount"
          color="error"
          :model-value="itemCount > 0"
          offset-x="2"
          offset-y="2"
        >
          <v-icon size="26">mdi-cart-outline</v-icon>
        </v-badge>
      </v-btn>

      <div v-if="!isAuthenticated" class="d-flex gap-2">
        <v-btn
          :to="{ name: 'Login' }"
          variant="text"
          class="nav-btn text-capitalize"
          rounded="lg"
        >
          Login
        </v-btn>
        <v-btn
          :to="{ name: 'Register' }"
          color="primary"
          variant="flat"
          class="px-6 text-capitalize"
          rounded="lg"
          elevation="2"
        >
          Register
        </v-btn>
      </div>

      <div v-else>
        <v-menu offset-y transition="slide-y-transition">
          <template v-slot:activator="{ props }">
            <v-btn
              v-bind="props"
              variant="text"
              class="profile-btn pl-1 pr-2"
              rounded="pill"
            >
              <v-avatar size="36" class="mr-2 elevation-2 border-white">
                <v-img
                  :src="
                    user?.profileResponse?.avatarUrl ||
                    'https://via.placeholder.com/150'
                  "
                  alt="Avatar"
                  cover
                ></v-img>
              </v-avatar>
              <span class="d-none d-sm-block font-weight-medium mr-1">
                {{ user?.profileResponse?.firstName || user?.username }}
              </span>
              <v-icon size="small">mdi-chevron-down</v-icon>
            </v-btn>
          </template>

          <v-list class="glass-menu pa-2" width="200" rounded="lg" elevation="4">
            <v-list-item :to="{ name: 'Profile' }" rounded="lg" class="mb-1 menu-item">
              <template v-slot:prepend>
                <v-icon size="20" class="mr-2">mdi-account-circle-outline</v-icon>
              </template>
              <v-list-item-title>My Profile</v-list-item-title>
            </v-list-item>
            <v-list-item :to="{ name: 'EditProfile' }" rounded="lg" class="mb-1 menu-item">
              <template v-slot:prepend>
                <v-icon size="20" class="mr-2">mdi-account-edit-outline</v-icon>
              </template>
              <v-list-item-title>Edit Profile</v-list-item-title>
            </v-list-item>
            <v-list-item :to="{ name: 'OrderHistory' }" rounded="lg" class="mb-1 menu-item">
              <template v-slot:prepend>
                <v-icon size="20" class="mr-2">mdi-history</v-icon>
              </template>
              <v-list-item-title>Purchase History</v-list-item-title>
            </v-list-item>
            <v-divider class="my-2 opacity-20"></v-divider>
            <v-list-item @click="handleLogout" rounded="lg" class="menu-item logout-item">
              <template v-slot:prepend>
                <v-icon size="20" class="mr-2" color="error">mdi-logout-variant</v-icon>
              </template>
              <v-list-item-title class="text-error font-weight-medium">Logout</v-list-item-title>
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

<style scoped>
.glass-header {
  background: rgba(255, 255, 255, 0.7) !important;
  backdrop-filter: blur(16px) saturate(180%);
  -webkit-backdrop-filter: blur(16px) saturate(180%);
  border-bottom: 1px solid rgba(255, 255, 255, 0.3);
  transition: all 0.3s ease;
}

.glass-search :deep(.v-field) {
  background: rgba(255, 255, 255, 0.5) !important;
  backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  transition: all 0.3s ease;
}

.glass-search :deep(.v-field--focused) {
  background: rgba(255, 255, 255, 0.85) !important;
  box-shadow: 0 4px 20px rgba(var(--v-theme-primary), 0.15);
  border-color: rgba(var(--v-theme-primary), 0.3);
}

.glass-menu {
  background: rgba(255, 255, 255, 0.9) !important;
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.5);
}

.nav-btn {
  font-weight: 500;
  letter-spacing: 0.5px;
  color: rgba(0, 0, 0, 0.7);
  transition: all 0.2s ease;
}

.nav-btn:hover {
  color: rgb(var(--v-theme-primary));
  background: rgba(var(--v-theme-primary), 0.08);
}

.menu-item {
  transition: all 0.2s ease;
}

.menu-item:hover {
  background: rgba(var(--v-theme-primary), 0.08) !important;
  color: rgb(var(--v-theme-primary));
}

.logout-item:hover {
  background: rgba(var(--v-theme-error), 0.08) !important;
}

.logo-text {
  font-family: 'Outfit', sans-serif;
  letter-spacing: -0.5px;
  background: linear-gradient(45deg, rgb(var(--v-theme-primary)), #4a90e2);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}

.logo-icon {
  filter: drop-shadow(0 2px 4px rgba(var(--v-theme-primary), 0.3));
}

.border-white {
  border: 2px solid #fff;
}

.gap-2 {
  gap: 8px;
}

.opacity-20 {
  opacity: 0.2;
}

.search-item:hover {
  background-color: rgba(var(--v-theme-primary), 0.05);
}
</style>