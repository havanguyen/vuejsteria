import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { jwtDecode } from 'jwt-decode';
import {
  loginApi,
  logoutApi,
  refreshTokenApi,
  registerApi
} from '@/api/authApi';
import { getMyInfoApi } from '@/api/userApi';
import { getRolesFromScope } from '@/utils/authUtils';
import { useNotificationStore } from './useNotificationStore';
import { useCartStore } from './useCartStore';

export const useAuthStore = defineStore(
  'auth',
  () => {
    const token = ref(null);
    const refreshToken = ref(null);
    const user = ref(null);
    const isProfileLoading = ref(false);

    const isAuthenticated = computed(() => !!token.value && !!user.value);

    const userRoles = computed(() => {
      if (!user.value?.roles) return [];
      if (typeof user.value.roles[0] === 'string') {
        return user.value.roles;
      }
      return user.value.roles.map((r) => r.name);
    });

    const isAdmin = computed(() => userRoles.value.includes('ADMIN'));

    function setTokens(accessToken, newRefreshToken) {
      token.value = accessToken;
      if (newRefreshToken) {
        refreshToken.value = newRefreshToken;
      }
    }

    async function login(credentials) {
      const authData = await loginApi(credentials);
      setTokens(authData.token, authData.refreshToken);
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

      if (token.value) {
        try {
          await logoutApi(token.value);
        } catch (error) {
          console.error(
            'Logout API failed, logging out locally anyway.',
            error
          );
        }
      }
      token.value = null;
      refreshToken.value = null;
      user.value = null;

      const router = (await import('@/router')).default;
      router.push('/login');
    }

    async function fetchMyInfo(config = {}) {
      if (!token.value) return;

      isProfileLoading.value = true;
      try {
        const userInfo = await getMyInfoApi(config);
        user.value = userInfo;
      } catch (error) {
        console.error('Failed to fetch full user info:', error);
        const notificationStore = useNotificationStore();

        // Only show error if it's NOT a 401 (which is handled by interceptor)
        if (!error.response || error.response.status !== 401) {
          notificationStore.showWarning(
            'Không thể tải thông tin cá nhân. Một số chức năng có thể bị hạn chế.',
            'Cảnh báo hồ sơ'
          );
        }

        if (error.response && error.response.status === 401) {
          await logout();
        } else {
          try {
            // Fallback to decoding token if API fails
            const decodedToken = jwtDecode(token.value);
            const roles = getRolesFromScope(decodedToken.scope);
            user.value = {
              id: decodedToken.sub,
              username: decodedToken.sub,
              roles: roles.map((r) => ({ name: r })),
              profileResponse: null,
              active: true
            };
          } catch (tokenError) {
            console.error('Token is invalid, logging out.', tokenError);
            await logout();
          }
        }
      } finally {
        isProfileLoading.value = false;
      }
    }

    async function handleRefreshToken() {
      try {
        const authData = await refreshTokenApi(refreshToken.value);
        setTokens(authData.token);
        return authData.token;
      } catch (error) {
        await logout();
        throw error;
      }
    }

    function setUser(newUserResponse) {
      user.value = newUserResponse;
    }

    function loadUserFromToken() {
      if (!token.value) return false;
      try {
        const decodedToken = jwtDecode(token.value);
        const roles = getRolesFromScope(decodedToken.scope);
        user.value = {
          id: decodedToken.sub,
          username: decodedToken.sub,
          roles: roles.map((r) => ({ name: r })),
          profileResponse: null,
          active: true
        };
        return true;
      } catch (error) {
        console.error('Failed to load user from token:', error);
        return false;
      }
    }

    async function hydrate() {
      console.log('[AuthStore] Hydrating...');
      if (token.value) {
        // 1. Optimistically load user from token so app starts immediately
        const success = loadUserFromToken();
        console.log('[AuthStore] Load from token success:', success);

        if (!success) {
          // Token invalid, clear it
          console.log('[AuthStore] Token invalid, clearing.');
          token.value = null;
          refreshToken.value = null;
          return;
        }

        // 2. Fetch fresh info in background (don't await)
        console.log('[AuthStore] Fetching profile in background (silent)...');
        fetchMyInfo({ silent: true }).catch(err => console.warn('[AuthStore] Background profile fetch failed:', err));

        // 3. Fetch cart in background
        console.log('[AuthStore] Fetching cart in background (silent)...');
        const cartStore = useCartStore();
        cartStore.fetchCart({ silent: true }).catch(err => console.error('[AuthStore] Background cart fetch failed:', err));
      } else {
        console.log('[AuthStore] No token found during hydration.');
      }
    }

    return {
      token,
      refreshToken,
      user,
      isProfileLoading,
      isAuthenticated,
      userRoles,
      isAdmin,
      login,
      register,
      logout,
      fetchMyInfo,
      handleRefreshToken,
      setTokens,
      hydrate,
      setUser
    };
  },
  {
    persist: {
      paths: ['token', 'refreshToken']
    }
  }
);