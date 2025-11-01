import axiosInstance from '@/config/axiosConfig';
// import axios from 'axios'; // Không cần thiết ở đây
import { useAuthStore } from '@/stores/useAuthStore';
import { useLoadingStore } from '@/stores/useLoadingStore';
import { useNotificationStore } from '@/stores/useNotificationStore';
// SỬA LỖI: Xóa 2 dòng import không tồn tại dưới đây
// import { getAccessToken, getRefreshToken } from '@/utils/authUtils';

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
        const loadingStore = useLoadingStore();
        loadingStore.showLoading();

        // SỬA LỖI: Lấy token trực tiếp từ store
        const authStore = useAuthStore();
        const token = authStore.token; // Đọc từ state của Pinia

        if (token) {
          config.headers['Authorization'] = 'Bearer ' + token;
        }
        return config;
      },
      (error) => {
        const loadingStore = useLoadingStore();
        loadingStore.hideLoading();
        return Promise.reject(error);
      }
    );

    axiosInstance.interceptors.response.use(
      (response) => {
        const loadingStore = useLoadingStore();
        loadingStore.hideLoading();
        return response;
      },
      async (error) => {
        const loadingStore = useLoadingStore();
        loadingStore.hideLoading();

        const notificationStore = useNotificationStore();
        const authStore = useAuthStore();
        const originalRequest = error.config;

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

          // SỬA LỖI: Lấy refresh token trực tiếp từ store
          const refreshToken = authStore.refreshToken; // Đọc từ state của Pinia

          if (!refreshToken) {
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
            authStore.logout();

            const apiError =
              _error.response?.data?.message || 'Session expired. Please login again.'; // Dịch
            notificationStore.showError(apiError);

            return Promise.reject(_error);
          } finally {
            isRefreshing = false;
          }
        }

        if (error.response?.status !== 401) {
          const apiError =
            error.response?.data?.message || 'An error occurred. Please try again.'; // Dịch
          notificationStore.showError(apiError);
        }

        return Promise.reject(error);
      }
    );
  }
};