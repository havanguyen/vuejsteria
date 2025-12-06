import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '@/stores/useAuthStore';
import MainLayout from '@/components/layout/MainLayout.vue';
import AdminLayout from '@/components/layout/AdminLayout.vue';
import HomePage from '@/views/HomePage.vue';

const routes = [
  {
    path: '/',
    component: MainLayout,
    children: [
      {
        path: '',
        name: 'Home',
        component: HomePage,
        meta: { title: 'Home' }
      },
      {
        path: 'profile',
        name: 'Profile',
        component: () => import('@/views/profile/ProfilePage.vue'),
        meta: { requiresAuth: true, title: 'My Profile' }
      },
      {
        path: 'profile/edit',
        name: 'EditProfile',
        component: () => import('@/views/profile/EditProfilePage.vue'),
        meta: { requiresAuth: true, title: 'Edit Profile' }
      },
      {
        path: 'search',
        name: 'Search',
        component: () => import('@/views/SearchPage.vue'),
        meta: { title: 'Search Results' }
      },
      {
        path: 'product/:id',
        name: 'ProductDetail',
        component: () => import('@/views/ProductDetailPage.vue'),
        props: true,
        meta: { title: 'Product Details' }
      },
      {
        path: 'cart',
        name: 'Cart',
        component: () => import('@/views/CartPage.vue'),
        meta: { requiresAuth: true, title: 'My Cart' }
      },
      {
        path: 'checkout',
        name: 'Checkout',
        component: () => import('@/views/CheckoutPage.vue'),
        meta: { requiresAuth: true, title: 'Checkout' }
      },
      {
        path: 'order-pending/:id',
        name: 'OrderPending',
        component: () => import('@/views/OrderPendingPage.vue'),
        meta: { requiresAuth: true, title: 'Pending Payment' },
        props: true
      },
      {
        path: 'payment/result',
        name: 'PaymentResult',
        component: () => import('@/views/PaymentResultPage.vue'),
        meta: { title: 'Payment Result' }
      },
      {
        path: 'my-orders',
        name: 'OrderHistory',
        component: () => import('@/views/OrderHistoryPage.vue'),
        meta: { requiresAuth: true, title: 'My Orders' }
      },
      {
        path: 'order/:id',
        name: 'OrderDetail',
        component: () => import('@/views/OrderDetailPage.vue'),
        meta: { requiresAuth: true, title: 'Order Details' },
        props: true
      }
    ]
  },
  {
    path: '/admin',
    component: AdminLayout,
    meta: { requiresAuth: true, roles: ['ADMIN'], title: 'Admin' },
    children: [
      {
        path: '',
        redirect: '/admin/dashboard'
      },
      {
        path: 'dashboard',
        name: 'AdminDashboard',
        component: () => import('@/views/admin/DashboardPage.vue'),
        meta: { title: 'Dashboard' }
      },
      {
        path: 'users',
        name: 'AdminUserList',
        component: () => import('@/views/admin/UserListPage.vue'),
        meta: { title: 'User Management' }
      },
      {
        path: 'products',
        name: 'AdminProductList',
        component: () => import('@/views/admin/ProductManagementPage.vue'),
        meta: { title: 'Product Management' }
      },
      {
        path: 'categories',
        name: 'AdminCategoryList',
        component: () => import('@/views/admin/CategoryManagementPage.vue'),
        meta: { title: 'Category Management' }
      },
      {
        path: 'authors',
        name: 'AdminAuthorList',
        component: () => import('@/views/admin/AuthorManagementPage.vue'),
        meta: { title: 'Author Management' }
      },
      {
        path: 'publishers',
        name: 'AdminPublisherList',
        component: () => import('@/views/admin/PublisherManagementPage.vue'),
        meta: { title: 'Publisher Management' }
      }
    ]
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/auth/LoginPage.vue'),
    meta: { requiresGuest: true, title: 'Login' }
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('@/views/auth/RegisterPage.vue'),
    meta: { requiresGuest: true, title: 'Register' }
  },
  {
    path: '/privacy-policy',
    name: 'PrivacyPolicy',
    component: () => import('@/views/PrivacyPolicyPage.vue'),
    meta: { title: 'Privacy Policy' }
  },
  {
    path: '/terms-of-service',
    name: 'TermsOfService',
    component: () => import('@/views/TermsOfServicePage.vue'),
    meta: { title: 'Terms of Service' }
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/NotFoundPage.vue'),
    meta: { title: 'Not Found' }
  }
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
});

let isHydrated = false;

router.beforeEach(async (to, from, next) => {
  document.title = to.meta.title
    ? `${to.meta.title} - Bookteria`
    : 'Bookteria';

  const authStore = useAuthStore();

  if (!isHydrated && authStore.token) {
    try {
      await authStore.hydrate();
    } catch (error) {
      console.warn('Hydration failed or timed out, proceeding anyway:', error);
      // We don't block navigation here. The store will handle the error state.
    } finally {
      isHydrated = true;
    }
  } else {
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