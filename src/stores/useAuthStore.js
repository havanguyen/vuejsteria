import { defineStore } from 'pinia';
import { jwtDecode } from 'jwt-decode';
import { getRolesFromScope } from '@/utils/authUtils';
import { getMyInfoApi } from '@/api/userApi';
import { logoutApi } from '@/api/authApi';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: null,
    expiryTime: null,
    user: null,
    profileId: null,
  }),
  getters: {
    isAuthenticated(state) {
      return !!state.token && !!state.user && new Date(state.expiryTime) > new Date();
    },
    userRoles(state) {
      return state.user?.roles || [];
    },
    userId(state) {
      return state.user?.id || null;
    }
  },
  actions: {
    async login(authData) {
      try {
        jwtDecode(authData.token);
        this.token = authData.token;
        this.expiryTime = authData.expiryTime;

        await this.fetchAndSetUser();

        if (this.user) {
          console.log('✅ Login successful:', this.user);
        } else {
           throw new Error("Failed to fetch user info after login.");
        }

      } catch (error) {
        console.error('❌ Error during login or fetching user info:', error);
        this.clearSession();
        throw error;
      }
    },
    async logout() {
      console.log('🚪 Logging out...');
      const currentToken = this.token;
      this.clearSession();
      if (currentToken) {
        try {
          await logoutApi(currentToken);
          console.log('✅ Token invalidated on server.');
        } catch (error) {
          console.error('⚠️ Failed to invalidate token on server (token already cleared locally):', error);
        }
      }
    },
    clearSession() {
      this.token = null;
      this.expiryTime = null;
      this.user = null;
      this.profileId = null;
    },
    async fetchAndSetUser() {
      if (!this.token || !(new Date(this.expiryTime) > new Date())) {
          console.log('ℹ️ No valid token found, skipping fetch user.');
          this.clearSession();
          return;
      };
      try {
        const userInfo = await getMyInfoApi();
        const decodedToken = jwtDecode(this.token);
        const roles = getRolesFromScope(decodedToken.scope);

        this.user = {
          id: userInfo.id,
          username: userInfo.username,
          roles: roles,
          firstName: userInfo.profileResponse?.firstName,
          lastName: userInfo.profileResponse?.lastName,
          email: userInfo.profileResponse?.email,
        };

        this.profileId = userInfo.profileResponse?.id || null;

        console.log('👤 User info fetched and set:', this.user);
        console.log('🆔 Profile ID set:', this.profileId);

        if (!this.profileId) {
            console.warn('⚠️ Warning: profileId is null after fetching user info. The user may not have a profile yet.');
        }

      } catch (error) {
        console.error('❌ Failed to fetch user info:', error);
        this.clearSession();


        throw error;
      }
    },
    async hydrate() {
      console.log('💧 Hydration process starting...');
      try {
        await this.fetchAndSetUser();
      } catch (error) {
         console.error('💧 Hydration failed during fetchAndSetUser:', error);

      } finally {
         console.log(`💧 Hydration attempt finished. User fetched: ${!!this.user}`);

      }


    }
  },
  persist: {
    storage: localStorage,
    paths: ['token', 'expiryTime'],
  },
});