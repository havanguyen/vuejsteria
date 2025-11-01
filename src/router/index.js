import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '@/stores/useAuthStore';
import MainLayout from '@/components/layout/MainLayout.vue';
import HomePage from '@/views/HomePage.vue';

const routes = [
  {
    path: '/',
    component: MainLayout,
    children: [
      {
        path: '',
        name: 'Home',
        component: HomePage
      },
      {
        path: 'profile',
        name: 'Profile',
        component: () => import('@/views/profile/ProfilePage.vue'),
        meta: { requiresAuth: true }
      },
      {
        path: 'profile/edit',
        name: 'EditProfile',
        component: () => import('@/views/profile/EditProfilePage.vue'),
        meta: { requiresAuth: true }
      }
    ]
  },
  {
    path: '/admin',
    component: MainLayout,
    meta: { requiresAuth: true, roles: ['ADMIN'] },
    children: [
      {
        path: 'users',
        name: 'AdminUserList',
        component: () => import('@/views/admin/UserListPage.vue')
      },
      {
        path: 'users/:id',
        name: 'AdminUserDetail',
        component: () => import('@/views/admin/UserDetailPage.vue'),
        props: true
      }
    ]
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/auth/LoginPage.vue'),
    meta: { requiresGuest: true }
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('@/views/auth/RegisterPage.vue'),
    meta: { requiresGuest: true }
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/NotFoundPage.vue')
  }
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
});

let isHydrated = false;

router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore();

  if (!isHydrated) {
    await authStore.hydrate();
    isHydrated = true;
  }

  const isAuthenticated = authStore.isAuthenticated;

  if (to.meta.requiresAuth) {
    if (!isAuthenticated) {
      next({
        name: 'Login',
        query: { redirect: to.fullPath }
      });
    } else {
      if (to.meta.roles) {
        const userRoles = authStore.userRoles || [];
        const hasAccess = userRoles.some((role) =>
          to.meta.roles.includes(role)
        );
        if (!hasAccess) {
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