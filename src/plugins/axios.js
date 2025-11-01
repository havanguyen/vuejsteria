import axios from 'axios';
import axiosInstance from '@/config/axiosConfig';
import { API_BASE_URL } from '@/config/constants';
import { useAuthStore } from '@/stores/useAuthStore';
import { useLoadingStore } from '@/stores/useLoadingStore';
import { useNotificationStore } from '@/stores/useNotificationStore';

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  failedQueue = [];
};

export default {
  install: () => {
    axiosInstance.interceptors.request.use(
      (config) => {
        // NÂNG CẤP: Chỉ show loading nếu request không phải là 'silent'
        if (!config.silent) {
          const loadingStore = useLoadingStore();
          loadingStore.showLoading();
        }

        const authStore = useAuthStore();
        const token = authStore.token;
        if (token) {
          config.headers['Authorization'] = 'Bearer ' + token;
        }
        return config;
      },
      (error) => {
        // NÂNG CẤP: Chỉ hide loading nếu request gốc không 'silent'
        if (!error.config || !error.config.silent) {
          const loadingStore = useLoadingStore();
          loadingStore.hideLoading();
        }
        return Promise.reject(error);
      }
    );

    axiosInstance.interceptors.response.use(
      (response) => {
        // NÂNG CẤP: Chỉ hide loading nếu request không 'silent'
        if (!response.config.silent) {
          const loadingStore = useLoadingStore();
          loadingStore.hideLoading();
        }
        return response;
      },
      async (error) => {
        const originalRequest = error.config;

        // NÂNG CẤP: Chỉ hide loading nếu request không 'silent'
        if (originalRequest && !originalRequest.silent) {
          const loadingStore = useLoadingStore();
          loadingStore.hideLoading();
        }

        const notificationStore = useNotificationStore();
        const authStore = useAuthStore();

        if (error.response?.status === 401 && !originalRequest._retry) {
          if (isRefreshing) {
            return new Promise(function (resolve, reject) {
              failedQueue.push({ resolve, reject });
            })
              .then((token) => {
                originalRequest.headers['Authorization'] = 'Bearer ' + token;
                return axiosInstance(originalRequest);
              })
              .catch((err) => {
                return Promise.reject(err);
              });
          }

          originalRequest._retry = true;
          isRefreshing = true;

          if (!authStore.refreshToken) {
            isRefreshing = false;
            authStore.logout();
            return Promise.reject(error);
          }

          try {
            const newAccessToken = await authStore.handleRefreshToken();
            originalRequest.headers['Authorization'] = 'Bearer ' + newAccessToken;
            processQueue(null, newAccessToken);
            return axiosInstance(originalRequest);
          } catch (_error) {
            processQueue(_error, null);
            const apiError =
              _error.response?.data?.message || 'Phiên đăng nhập hết hạn';
            notificationStore.showError(apiError);
            return Promise.reject(_error);
          } finally {
            isRefreshing = false;
          }
        }

        if (error.response?.status !== 401) {
          const apiError =
            error.response?.data?.message || 'Đã xảy ra lỗi, vui lòng thử lại';
          
          // NÂNG CẤP: Chỉ hiện lỗi nếu request không 'silent'
          if (originalRequest && !originalRequest.silent) {
            notificationStore.showError(apiError);
          }
        }

        return Promise.reject(error);
      }
    );
  }
};