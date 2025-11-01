<template>
  <v-app>
    <v-navigation-drawer
      v-model="drawer"
      :rail="rail"
      permanent
      @click="rail = false"
      location="left"
      color="transparent"
      class="admin-drawer glass-sidebar"
    >
      <v-list-item
        :prepend-avatar="
          user?.profileResponse?.avatarUrl ||
          'https://via.placeholder.com/150/E0E0E0/FFFFFF?text=No+Avatar'
        "
        :title="user?.profileResponse?.firstName || user?.username"
        nav
        class="admin-user-card pa-3"
      >
        <template v-slot:prepend>
          <v-avatar color="primary" class="avatar-glow">
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
        <template v-slot:append>
          <v-btn
            variant="text"
            :icon="rail ? 'mdi-chevron-right' : 'mdi-chevron-left'"
            @click.stop="rail = !rail"
          ></v-btn>
        </template>
      </v-list-item>

      <v-divider></v-divider>

      <v-list density="compact" nav class="admin-nav-list pa-2">
        <v-list-item
          v-for="item in navItems"
          :key="item.title"
          :prepend-icon="item.icon"
          :title="item.title"
          :to="item.to"
          :exact="item.exact"
          active-class="admin-nav-active"
        ></v-list-item>
      </v-list>

      <template v-slot:append>
        <div class="pa-2">
          <v-btn
            block
            @click="handleLogout"
            color="red-darken-3"
            variant="tonal"
            prepend-icon="mdi-logout"
            :class="{ 'justify-start': !rail, 'justify-center': rail }"
          >
            <span v-if="!rail">Logout</span>
          </v-btn>
        </div>
      </template>
    </v-navigation-drawer>

    <v-app-bar
      app
      color="white"
      elevation="0"
      density="default"
      class="admin-app-bar"
    >
      <v-app-bar-nav-icon @click.stop="rail = !rail"></v-app-bar-nav-icon>

      <v-breadcrumbs
        :items="breadcrumbs"
        class="pa-0 ma-0 ml-2 admin-breadcrumbs"
      >
        <template v-slot:divider>
          <v-icon icon="mdi-chevron-right"></v-icon>
        </template>
      </v-breadcrumbs>

      <v-spacer></v-spacer>

      <v-btn icon :to="{ name: 'Home' }">
        <v-icon color="grey-darken-1">mdi-home-export-outline</v-icon>
        <v-tooltip activator="parent" location="bottom">Go to Site</v-tooltip>
      </v-btn>

      <v-menu offset-y>
        <template v-slot:activator="{ props: menuProps }">
          <v-hover v-slot="{ isHovering, props: hoverProps }">
            <v-btn
              v-bind="{ ...menuProps, ...hoverProps }"
              text
              class="pa-1 user-menu-btn"
              :elevation="isHovering ? 2 : 0"
            >
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
              <span class="d-none d-sm-inline text-grey-darken-3">
                {{ user?.profileResponse?.firstName || user?.username }}
              </span>
              <v-icon right color="grey-darken-1">mdi-menu-down</v-icon>
            </v-btn>
          </v-hover>
        </template>

        <v-list dense>
          <v-list-item :to="{ name: 'Profile' }">
            <template v-slot:prepend>
              <v-icon>mdi-account-circle</v-icon>
            </template>
            <v-list-item-title>My Profile</v-list-item-title>
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
    </v-app-bar>

    <v-main class="admin-main-bg">
      <v-container fluid>
        <router-view v-slot="{ Component }">
          <v-fade-transition mode="out-in">
            <component :is="Component" />
          </v-fade-transition>
        </router-view>
      </v-container>
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
    icon: 'mdi-view-dashboard',
    to: { name: 'AdminDashboard' },
    exact: true,
  },
  {
    title: 'User Management',
    icon: 'mdi-account-group',
    to: { name: 'AdminUserList' },
    exact: false,
  },
  {
    title: 'Product Management',
    icon: 'mdi-book-open-page-variant',
    to: { name: 'AdminProductList' },
    exact: false,
  },
  {
    title: 'Category Management',
    icon: 'mdi-bookmark-multiple',
    to: { name: 'AdminCategoryList' },
    exact: false,
  },
  {
    title: 'Author Management',
    icon: 'mdi-account-edit',
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
.admin-drawer .v-list-item__prepend .v-icon {
  margin-inline-end: 16px !important;
}

.glass-sidebar {
  backdrop-filter: blur(12px) saturate(180%);
  -webkit-backdrop-filter: blur(12px) saturate(180%);
  background: rgba(255, 255, 255, 0.5) !important;
  border-right: 1px solid rgba(255, 255, 255, 0.2);
}

.glass-sidebar .v-list-item,
.glass-sidebar .v-list-item .v-icon,
.glass-sidebar .v-list-item-title {
  color: #333 !important;
}

.admin-nav-list .v-list-item {
  transition: all 0.2s ease-in-out;
  margin: 4px 8px;
  border-radius: 8px;
}

.admin-nav-list .v-list-item:hover {
  background-color: rgba(0, 0, 0, 0.05);
  transform: translateX(4px);
}

.admin-nav-active {
  background: linear-gradient(
    90deg,
    rgba(var(--v-theme-primary), 0.2),
    rgba(var(--v-theme-primary), 0.05) 80%
  ) !important;
  border-left: 4px solid rgb(var(--v-theme-primary));
  color: rgb(var(--v-theme-primary)) !important;
  font-weight: 600;
}

.admin-nav-active .v-icon {
  color: rgb(var(--v-theme-primary)) !important;
}

.admin-user-card {
  background: rgba(0, 0, 0, 0.03);
}

.admin-user-card .avatar-glow {
  border: 2px solid rgb(var(--v-theme-primary));
  box-shadow: 0 0 15px rgba(var(--v-theme-primary), 0.5);
}

.admin-main-bg {
  background-color: #fef5f7;
}

.admin-app-bar {
  border-bottom: 1px solid rgba(0, 0, 0, 0.1) !important;
}

.admin-breadcrumbs .v-breadcrumbs-item,
.admin-breadcrumbs .v-breadcrumbs-divider {
  color: #555;
  font-size: 1rem;
}

.admin-breadcrumbs .v-breadcrumbs-item--disabled {
  color: #111;
  font-weight: 600;
}

.user-menu-btn {
  transition: all 0.2s ease-out;
  border-radius: 8px;
}
</style>