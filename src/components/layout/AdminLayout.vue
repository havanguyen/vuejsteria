<template>
  <v-app>
    <v-navigation-drawer
      v-model="drawer"
      :rail="rail"
      permanent
      @click="rail = false"
      location="left"
      color="grey-darken-4"
      image="https://cdn.vuetifyjs.com/images/backgrounds/bg-2.jpg"
      class="admin-drawer"
    >
      <v-list-item
        :prepend-avatar="
          user?.profileResponse?.avatarUrl ||
          'https://via.placeholder.com/150/E0E0E0/FFFFFF?text=No+Avatar'
        "
        :title="user?.profileResponse?.firstName || user?.username"
        subtitle="Quản trị viên"
        nav
        class="admin-user-card"
      >
        <template v-slot:prepend>
          <v-avatar color="grey-darken-3" class="avatar-glow">
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

      <v-list density="compact" nav class="admin-nav-list">
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
            prepend-icon="mdi-logout"
            :class="{ 'justify-start': !rail, 'justify-center': rail }"
          >
            <span v-if="!rail">Đăng xuất</span>
          </v-btn>
        </div>
      </template>
    </v-navigation-drawer>

    <v-app-bar
      app
      color="white"
      elevation="2"
      density="compact"
      class="admin-app-bar"
    >
      <v-toolbar-title class="text-grey-darken-3 font-weight-bold">
        Bookteria Admin
      </v-toolbar-title>
      <v-spacer></v-spacer>
      <v-btn icon :to="{ name: 'Home' }">
        <v-icon color="primary">mdi-home-export-outline</v-icon>
        <v-tooltip activator="parent" location="bottom">Về trang chủ</v-tooltip>
      </v-btn>
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
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/useAuthStore';
import { storeToRefs } from 'pinia';

const drawer = ref(true);
const rail = ref(false);
const router = useRouter();
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
    title: 'Quản lý Users',
    icon: 'mdi-account-group',
    to: { name: 'AdminUserList' },
    exact: false,
  },
  {
    title: 'Quản lý Sản phẩm',
    icon: 'mdi-book-open-page-variant',
    to: { name: 'AdminProductList' },
    exact: false,
  },
  {
    title: 'Quản lý Danh mục',
    icon: 'mdi-bookmark-multiple',
    to: { name: 'AdminCategoryList' },
    exact: false,
  },
  {
    title: 'Quản lý Tác giả',
    icon: 'mdi-account-edit',
    to: { name: 'AdminAuthorList' },
    exact: false,
  },
  {
    title: 'Quản lý NXB',
    icon: 'mdi-domain',
    to: { name: 'AdminPublisherList' },
    exact: false,
  },
]);

const handleLogout = () => {
  authStore.logout();
  router.push({ name: 'Login' });
};
</script>

<style>
.admin-drawer .v-list-item__prepend .v-icon {
  margin-inline-end: 16px !important;
}

.admin-nav-list .v-list-item {
  transition: all 0.2s ease-in-out;
}

.admin-nav-list .v-list-item:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.admin-nav-active {
  background-color: rgba(69, 139, 246, 0.2) !important;
  border-left: 4px solid #458bf6;
  color: #ffffff !important;
}

.admin-nav-active .v-icon {
  color: #ffffff !important;
}

.admin-user-card {
  background: rgba(0, 0, 0, 0.2);
}

.admin-user-card .avatar-glow {
  box-shadow:
    0 0 10px rgba(255, 255, 255, 0.5),
    0 0 20px rgba(69, 139, 246, 0.3);
}

.admin-main-bg {
  background-color: #f4f7f6;
}

.admin-app-bar {
  border-bottom: 1px solid rgba(0, 0, 0, 0.12) !important;
  box-shadow:
    0 2px 4px -1px rgba(0, 0, 0, 0.06),
    0 4px 5px 0 rgba(0, 0, 0, 0.04) !important;
}
</style>