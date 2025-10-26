import { defineStore } from 'pinia';
import { jwtDecode } from 'jwt-decode';
import { getRolesFromScope } from '@/utils/authUtils';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: null,
    expiryTime: null,
    user: null,
    _hasHydrated: false,
  }),
  getters: {
    isAuthenticated(state) {
      return !!state.token && new Date(state.expiryTime) > new Date();
    },
    userRoles(state) {
      return state.user?.roles || [];
    },
  },
  actions: {
    login(authData) {
      try {
        const decodedToken = jwtDecode(authData.token);
        const userId = decodedToken.userId;
        const username = decodedToken.sub;
        const roles = getRolesFromScope(decodedToken.scope);

        this.token = authData.token;
        this.expiryTime = authData.expiryTime;
        this.user = { id: userId, username, roles };

        console.log('✅ Login successful:', this.user);
      } catch (error) {
        console.error('❌ Error decoding token:', error);
        this.logout();
      }
    },
    logout() {
      console.log('🚪 Logging out...');
      this.token = null;
      this.expiryTime = null;
      this.user = null;
    },
    setHasHydrated() {
      this._hasHydrated = true;
    },
    restoreSession() {
      if (this.token && this.expiryTime && new Date(this.expiryTime) > new Date()) {
        try {
          const decoded = jwtDecode(this.token);
          const roles = getRolesFromScope(decoded.scope);
          this.user = {
            id: decoded.userId,
            username: decoded.sub,
            roles,
          };
          console.log('🔄 Session restored successfully.');
        } catch (decodeError) {
          console.error('⚠️ Invalid token in storage:', decodeError);
          this.logout();
        }
      } else if (this.token) {
        console.log('ℹ️ Session expired, clearing state.');
        this.logout();
      } else {
         console.log('ℹ️ No session to restore.');
      }
    }
  },
  persist: {
    storage: localStorage,
    paths: ['token', 'expiryTime'],
    afterRestore: (ctx) => {
      ctx.store.restoreSession();
      ctx.store.setHasHydrated();
      console.log('💧 Hydration finished.');
    },
  },
});