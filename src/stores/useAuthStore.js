import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { jwtDecode } from 'jwt-decode';
import { loginApi, logoutApi, refreshTokenApi } from '@/api/authApi';
import { getMyInfoApi } from '@/api/userApi';
import { getRolesFromScope } from '@/utils/authUtils';
import { useNotificationStore } from './useNotificationStore';

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
    }

    async function register(userData) {
      await registerApi(userData);
    }

    async function logout() {
      if (token.value) {
        try {
          await logoutApi(token.value);
        } catch (error) {
          console.error('Logout API failed, logging out locally anyway.', error);
        }
      }
      token.value = null;
      refreshToken.value = null;
      user.value = null;
      
      const router = (await import('@/router')).default;
      router.push('/login');
    }

    async function fetchMyInfo() {
      if (!token.value) return;

      isProfileLoading.value = true;
      try {
        const userInfo = await getMyInfoApi();
        user.value = userInfo;
      } catch (error) {
        console.error('Failed to fetch full user info:', error);
        const notificationStore = useNotificationStore();
        notificationStore.showError(
          'Không thể tải hồ sơ. Một số thông tin có thể bị thiếu.'
        );

        if (error.response && error.response.status === 401) {
          await logout();
        } else {
          try {
            const decodedToken = jwtDecode(token.value);
            const roles = getRolesFromScope(decodedToken.scope);
            user.value = {
              id: decodedToken.sub,
              username: decodedToken.sub,
              roles: roles.map(r => ({ name: r })),
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

    async function hydrate() {
      if (token.value) {
        await fetchMyInfo();
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
      hydrate
    };
  },
  {
    persist: {
      paths: ['token', 'refreshToken']
    }
  }
);