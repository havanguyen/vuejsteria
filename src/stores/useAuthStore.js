import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import {
  loginApi,
  logoutApi,
  registerApi,
  refreshTokenApi,
  outboundAuthenticate
} from '@/api/authApi';
import { getMyInfoApi } from '@/api/userApi';
import { useNotificationStore } from './useNotificationStore';
import { useCartStore } from './useCartStore';

export const useAuthStore = defineStore(
  'auth',
  () => {
    // State
    const user = ref(null);
    const isProfileLoading = ref(false);

    // Getters
    const isAuthenticated = computed(() => !!user.value);

    const userRoles = computed(() => {
      if (!user.value?.roles) return [];

      let roles = [];
      // Handle both string[] and Object[] roles depending on API response
      if (typeof user.value.roles[0] === 'string') {
        roles = user.value.roles;
      } else {
        roles = user.value.roles.map((r) => r.name);
      }

      return roles.map(role => role.replace('ROLE_', ''));
    });

    const isAdmin = computed(() => userRoles.value.includes('ADMIN'));

    // Actions
    async function login(credentials) {
      // Login API sets HttpOnly cookies. We don't receive tokens in body anymore (or ignore them).
      await loginApi(credentials);

      // Fetch user info using the new cookie
      await fetchMyInfo();

      const cartStore = useCartStore();
      await cartStore.fetchCart();
    }

    async function register(userData) {
      await registerApi(userData);
    }

    async function logout() {
      const cartStore = useCartStore();
      cartStore.clearLocalCart();

      try {
        await logoutApi(); // Endpoint sends set-cookie to clear cookies
      } catch (error) {
        console.error('Logout API failed, clearing local state anyway.', error);
      }

      user.value = null;

      const router = (await import('@/router')).default;
      router.push('/login');
    }

    async function fetchMyInfo(config = {}) {
      isProfileLoading.value = true;
      try {
        const userInfo = await getMyInfoApi(config);
        user.value = userInfo;
      } catch (error) {
        // If 401, the axios interceptor might have tried to refresh and failed.
        console.warn('Failed to fetch user info:', error);
        user.value = null;

        if (error.response && error.response.status !== 401) {
          const notificationStore = useNotificationStore();
          notificationStore.showWarning(
            'Không thể tải thông tin cá nhân.',
            'Cảnh báo'
          );
        }
      } finally {
        isProfileLoading.value = false;
      }
    }

    function loginWithGoogle() {
      const clientId = '734310611658-p0ufj1nu33n3486h99e29qev29b57l7g.apps.googleusercontent.com';
      const redirectUri = 'https://bookteria.click';
      const scope = 'email profile openid';

      const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${encodeURIComponent(scope)}&access_type=offline&prompt=consent`;

      window.location.href = authUrl;
    }

    async function googleCallback(code) {
      // Backend sets cookies upon success
      await outboundAuthenticate(code);
      await fetchMyInfo();
      const cartStore = useCartStore();
      await cartStore.fetchCart();
    }

    async function hydrate() {
      console.log('[AuthStore] Hydrating session...');
      // Try to fetch profile. If cookie exists and is valid (or auto-refreshed), we get user.
      // If not, user remains null.
      await fetchMyInfo();

      if (isAuthenticated.value) {
        const cartStore = useCartStore();
        cartStore.fetchCart({ silent: true }).catch(err => console.error('Hydration cart fetch failed', err));
      }
    }

    async function handleRefreshToken() {
      try {
        const result = await refreshTokenApi();
        return result?.token;
      } catch (error) {
        console.error('Refresh token failed:', error);
        throw error;
      }
    }

    return {
      user,
      isProfileLoading,
      isAuthenticated,
      isAdmin,
      login,
      register,
      logout,
      fetchMyInfo,
      loginWithGoogle,
      googleCallback,
      handleRefreshToken,
      hydrate
    };

  },
  {
    persist: {
      storage: sessionStorage, // or localStorage, but only user info, not tokens!
      paths: ['user']
    },
  }
);