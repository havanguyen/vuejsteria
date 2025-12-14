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
        console.log(`[Axios] Request: ${config.method.toUpperCase()} ${config.url}`, { silent: config.silent });

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
        console.error('[Axios] Request Error:', error);
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
        console.log(`[Axios] Response: ${response.status} ${response.config.url}`, { silent: response.config.silent });
        // NÂNG CẤP: Chỉ hide loading nếu request không 'silent'
        if (!response.config.silent) {
          const loadingStore = useLoadingStore();
          loadingStore.hideLoading();
        }
        return response;
      },
      async (error) => {
        const originalRequest = error.config;
        console.error(`[Axios] Response Error: ${error.code || error.response?.status} ${originalRequest?.url}`, { silent: originalRequest?.silent, error });

        // NÂNG CẤP: Chỉ hide loading nếu request không 'silent'
        if (originalRequest && !originalRequest.silent) {
          const loadingStore = useLoadingStore();
          loadingStore.hideLoading();
        }

        const notificationStore = useNotificationStore();
        const authStore = useAuthStore();

        // Handle Network Errors or Timeouts
        if (!error.response || error.code === 'ECONNABORTED') {
          const config = originalRequest;

          // Retry logic
          if (config && !config._retryCount) {
            config._retryCount = 0;
          }

          if (config && config._retryCount < 2) {
            config._retryCount += 1;
            // Force silent on retry so we don't show global spinner again
            config.silent = true;
            console.log(`Retrying request... (${config._retryCount}/2)`);
            return new Promise(resolve => setTimeout(() => resolve(axiosInstance(config)), 1000));
          }

          if (originalRequest && !originalRequest.silent) {
            let msg = 'Không thể kết nối đến máy chủ. Vui lòng kiểm tra đường truyền.';
            let title = 'Lỗi kết nối';

            if (error.code === 'ECONNABORTED') {
              msg = 'Kết nối quá hạn. Vui lòng thử lại.';
              title = 'Hết thời gian chờ';
            }

            notificationStore.showError(
              msg,
              title,
              error.message
            );
          }
          return Promise.reject(error);
        }

        // Handle 401 Unauthorized
        if (error.response.status === 401 && !originalRequest._retry) {
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

          /* 
             Legacy check for token in store removed. 
             We rely on HttpOnly cookies now, so we always attempt refresh if 401 occurs.
          */

          try {
            const newAccessToken = await authStore.handleRefreshToken();
            originalRequest.headers['Authorization'] = 'Bearer ' + newAccessToken;
            processQueue(null, newAccessToken);
            return axiosInstance(originalRequest);
          } catch (_error) {
            processQueue(_error, null);

            // Only show warning if user was actually logged in (and thus lost session)
            // Guest users probing my-info should not see this.
            if (authStore.isAuthenticated) {
              const apiError =
                _error.response?.data?.message || 'Phiên đăng nhập hết hạn';
              notificationStore.showWarning(apiError, 'Hết phiên làm việc');
            }

            // Log out to clear any stale state provided we are not already clean
            if (authStore.isAuthenticated) {
              authStore.logout();
            }

            return Promise.reject(_error);
          } finally {
            isRefreshing = false;
          }
        }

        // Handle other errors
        if (error.response.status !== 401) {
          const apiError =
            error.response?.data?.message || 'Đã xảy ra lỗi, vui lòng thử lại';

          // NÂNG CẤP: Chỉ hiện lỗi nếu request không 'silent'
          if (originalRequest && !originalRequest.silent) {
            // Check for 5xx Server Errors
            if (error.response.status >= 500) {
              notificationStore.showError(
                'Máy chủ gặp sự cố. Vui lòng thử lại sau.',
                `Lỗi máy chủ (${error.response.status})`,
                error.response.data
              );
            } else {
              // 4xx Client Errors (excluding 401 handled above)
              notificationStore.showError(
                apiError,
                'Yêu cầu thất bại',
                error.response.data
              );
            }
          }
        }

        return Promise.reject(error);
      }
    );
  }
};