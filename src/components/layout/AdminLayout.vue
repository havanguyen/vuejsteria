<template>
  <v-app>
    <v-navigation-drawer
      v-model="drawer"
      :rail="rail"
      permanent
      @click="rail = false"
      location="left"
      class="admin-drawer glass-sidebar"
      width="280"
    >
      <div class="d-flex align-center justify-center py-6 px-4">
        <v-img
          src="/favicon.ico"
          width="32"
          height="32"
          class="mr-2 logo-icon"
          :class="{ 'mr-0': rail }"
          contain
        ></v-img>
        <span
          v-if="!rail"
          class="text-h5 font-weight-bold text-primary logo-text"
        >Bookteria</span>
      </div>

      <v-divider class="mx-4 opacity-20"></v-divider>

      <v-list-item
        class="admin-user-card ma-4 rounded-lg"
        nav
      >
        <template v-slot:prepend>
          <v-avatar color="primary" class="avatar-glow elevation-2" size="40">
            <v-img
              :src="
                user?.profileResponse?.avatarUrl ||
                'https://via.placeholder.com/150/E0E0E0/FFFFFF?text=No+Avatar'
              "
              cover
            >
              <template v-slot:placeholder>
                <v-icon>mdi-account-circle</v-icon>
              </template>
            </v-img>
          </v-avatar>
        </template>
        
        <v-list-item-title class="font-weight-bold text-body-2">
          {{ user?.profileResponse?.firstName || user?.username }}
        </v-list-item-title>
        <v-list-item-subtitle class="text-caption">
          Administrator
        </v-list-item-subtitle>
        
        <template v-slot:append>
          <v-btn
            variant="text"
            icon="mdi-chevron-left"
            size="small"
            @click.stop="rail = !rail"
          ></v-btn>
        </template>
      </v-list-item>

      <v-list density="compact" nav class="admin-nav-list px-3">
        <v-list-item
          v-for="item in navItems"
          :key="item.title"
          :prepend-icon="item.icon"
          :title="item.title"
          :to="item.to"
          :exact="item.exact"
          active-class="admin-nav-active"
          rounded="lg"
          class="mb-1"
        ></v-list-item>
      </v-list>

      <template v-slot:append>
        <div class="pa-4">
          <v-btn
            block
            @click="handleLogout"
            color="error"
            variant="tonal"
            prepend-icon="mdi-logout"
            class="logout-btn"
            :class="{ 'justify-center': rail }"
          >
            <span v-if="!rail">Logout</span>
          </v-btn>
        </div>
      </template>
    </v-navigation-drawer>

    <v-app-bar
      app
      color="transparent"
      elevation="0"
      class="admin-app-bar glass-header"
      height="72"
    >
      <v-app-bar-nav-icon
        @click.stop="rail = !rail"
        class="ml-2"
        color="primary"
      ></v-app-bar-nav-icon>

      <v-breadcrumbs
        :items="breadcrumbs"
        class="pa-0 ml-4 admin-breadcrumbs"
      >
        <template v-slot:divider>
          <v-icon icon="mdi-chevron-right" size="small" color="grey-lighten-1"></v-icon>
        </template>
        <template v-slot:title="{ item }">
          <span :class="item.disabled ? 'text-primary font-weight-bold' : 'text-medium-emphasis'">
            {{ item.title }}
          </span>
        </template>
      </v-breadcrumbs>

      <v-spacer></v-spacer>

      <div class="d-flex align-center mr-4 gap-2">
        <v-btn
          icon
          :to="{ name: 'Home' }"
          variant="text"
          color="primary"
          class="nav-icon-btn"
        >
          <v-icon>mdi-home-export-outline</v-icon>
          <v-tooltip activator="parent" location="bottom">Go to Site</v-tooltip>
        </v-btn>

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
              <span class="d-none d-sm-block font-weight-medium mr-1 text-body-2">
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
    </v-app-bar>

    <v-main class="admin-main-bg">
      <v-container fluid class="pa-6">
        <router-view v-slot="{ Component }">
          <v-fade-transition mode="out-in">
            <component :is="Component" />
          </v-fade-transition>
        </router-view>
      </v-container>
      
      <v-footer class="bg-transparent text-center d-flex flex-column py-4">
        <div class="text-caption text-medium-emphasis">
          &copy; {{ new Date().getFullYear() }} — <strong>Bookteria Admin</strong>
        </div>
      </v-footer>
    </v-main>
  </v-app>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuthStore } from '@/stores/useAuthStore';
import { storeToRefs } from 'pinia';

const drawer = ref(true);
const rail = ref(false);
const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();
const { user } = storeToRefs(authStore);

const navItems = ref([
  {
    title: 'Dashboard',
    icon: 'mdi-view-dashboard-outline',
    to: { name: 'AdminDashboard' },
    exact: true,
  },
  {
    title: 'User Management',
    icon: 'mdi-account-group-outline',
    to: { name: 'AdminUserList' },
    exact: false,
  },
  {
    title: 'Product Management',
    icon: 'mdi-book-cog-outline',
    to: { name: 'AdminProductList' },
    exact: false,
  },
  {
    title: 'Category Management',
    icon: 'mdi-bookmark-multiple-outline',
    to: { name: 'AdminCategoryList' },
    exact: false,
  },
  {
    title: 'Author Management',
    icon: 'mdi-account-edit-outline',
    to: { name: 'AdminAuthorList' },
    exact: false,
  },
  {
    title: 'Publisher Management',
    icon: 'mdi-domain',
    to: { name: 'AdminPublisherList' },
    exact: false,
  },
]);

const breadcrumbs = computed(() => {
  const items = [
    {
      title: 'Admin',
      to: { name: 'AdminDashboard' },
      disabled: false,
    },
  ];

  if (route.meta.title && route.name !== 'AdminDashboard') {
    items.push({
      title: route.meta.title,
      to: { name: route.name },
      disabled: true,
    });
  }
  return items;
});

const handleLogout = () => {
  authStore.logout();
  router.push({ name: 'Login' });
};
</script>

<style>
.admin-main-bg {
  background: linear-gradient(135deg, #f6f8fd 0%, #f1f4f9 100%);
  min-height: 100vh;
}

.glass-sidebar {
  background: rgba(255, 255, 255, 0.8) !important;
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  border-right: 1px solid rgba(255, 255, 255, 0.3);
}

.glass-header {
  background: rgba(255, 255, 255, 0.7) !important;
  backdrop-filter: blur(16px) saturate(180%);
  -webkit-backdrop-filter: blur(16px) saturate(180%);
  border-bottom: 1px solid rgba(255, 255, 255, 0.3);
}

.glass-menu {
  background: rgba(255, 255, 255, 0.9) !important;
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.5);
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

.admin-nav-list .v-list-item {
  transition: all 0.2s ease;
  color: rgba(0, 0, 0, 0.7);
}

.admin-nav-list .v-list-item:hover {
  background-color: rgba(var(--v-theme-primary), 0.08);
  color: rgb(var(--v-theme-primary));
  transform: translateX(4px);
}

.admin-nav-active {
  background: linear-gradient(
    90deg,
    rgba(var(--v-theme-primary), 0.15),
    rgba(var(--v-theme-primary), 0.05)
  ) !important;
  color: rgb(var(--v-theme-primary)) !important;
  font-weight: 600;
  box-shadow: 0 2px 8px rgba(var(--v-theme-primary), 0.15);
}

.admin-user-card {
  background: rgba(var(--v-theme-primary), 0.05);
  border: 1px solid rgba(var(--v-theme-primary), 0.1);
}

.avatar-glow {
  box-shadow: 0 0 0 2px rgba(var(--v-theme-primary), 0.2);
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

.logout-btn {
  transition: all 0.2s ease;
}

.logout-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(var(--v-theme-error), 0.2);
}

.nav-icon-btn {
  transition: all 0.2s ease;
}

.nav-icon-btn:hover {
  background: rgba(var(--v-theme-primary), 0.1);
  transform: scale(1.1);
}

.opacity-20 {
  opacity: 0.2;
}

.gap-2 {
  gap: 8px;
}

.border-white {
  border: 2px solid #fff;
}
</style>