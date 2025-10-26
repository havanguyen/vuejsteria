import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '@/stores/useAuthStore';
import MainLayout from '@/components/layout/MainLayout.vue';
import HomePage from '@/views/HomePage.vue';

const routes = [
  {
    path: '/',
    component: MainLayout,
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        name: 'Home',
        component: HomePage,
      },
      {
        path: 'profile',
        name: 'Profile',
        component: () => import('@/views/profile/ProfilePage.vue'),
      },
    ],
  },
  {
    path: '/admin',
    component: MainLayout,
    meta: { requiresAuth: true, roles: ['ADMIN'] },
    children: [
      {
        path: 'users',
        name: 'AdminUserList',
        component: () => import('@/views/admin/UserListPage.vue'),
      },
      { // Thêm route chi tiết user
        path: 'users/:id', // id là param
        name: 'AdminUserDetail',
        component: () => import('@/views/admin/UserDetailPage.vue'),
        props: true // Tự động pass param 'id' vào component làm prop
      },
    ],
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/auth/LoginPage.vue'),
    meta: { requiresGuest: true },
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('@/views/auth/RegisterPage.vue'),
    meta: { requiresGuest: true },
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/NotFoundPage.vue'),
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

let isHydrated = false;

router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore();

  if (!isHydrated) {
    console.log('💧 Router waiting for store hydration...');
    await authStore.hydrate();
    isHydrated = true;
    console.log('💧 Store hydrated. Router proceeding.');
  }

  const isAuthenticated = authStore.isAuthenticated;

  if (to.meta.requiresAuth) {
    if (!isAuthenticated) {
      next({
        name: 'Login',
        query: { redirect: to.fullPath },
      });
    } else {
      if (to.meta.roles) {
        // Chỉ kiểm tra roles nếu route yêu cầu
        const userRoles = authStore.userRoles || []; // Đảm bảo là mảng
        const hasAccess = userRoles.some(role => to.meta.roles.includes(role));
        if (!hasAccess) {
          console.warn(`User does not have required roles (${to.meta.roles.join(', ')}) for route ${to.path}. Redirecting home.`);
          next({ name: 'Home' });
        } else {
          next();
        }
      } else {
        next();
      }
    }
  } else if (to.meta.requiresGuest) {
    if (isAuthenticated) {
      next({ name: 'Home' });
    } else {
      next();
    }
  } else {
    next();
  }
});

export default router;