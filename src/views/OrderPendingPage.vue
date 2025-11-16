<template>
  <v-container>
    <v-row align="center" justify="center">
      <v-col cols="12" md="8" lg="6">
        <v-card class="pa-4 pa-md-8">
          <v-card-title class="text-h5 font-weight-medium mb-4 text-center">
            Xác nhận Đơn hàng & Thanh toán
          </v-card-title>

          <v-skeleton-loader
            v-if="loadingOrder"
            type="article, list-item-three-line"
          ></v-skeleton-loader>

          <v-alert
            v-else-if="error"
            type="error"
            variant="tonal"
            class="mb-6"
            density="compact"
          >
            {{ error }}
            <v-btn
              :to="{ name: 'Cart' }"
              color="error"
              variant="text"
              class="mt-2"
              >Back to Cart</v-btn
            >
          </v-alert>

          <template v-else-if="order">
            <v-card-text>
              <v-list class="bg-transparent">
                <v-list-item>
                  <v-list-item-title class="font-weight-bold"
                    >Mã Đơn Hàng:</v-list-item-title
                  >
                  <v-list-item-subtitle>{{ order.id }}</v-list-item-subtitle>
                </v-list-item>
                <v-list-item>
                  <v-list-item-title class="font-weight-bold"
                    >Giao đến:</v-list-item-title
                  >
                  <v-list-item-subtitle>
                    {{ order.shippingAddress.stress }},
                    {{ order.shippingAddress.commune }},
                    {{ order.shippingAddress.city }}
                  </v-list-item-subtitle>
                </v-list-item>
                <v-list-item>
                  <v-list-item-title class="font-weight-bold"
                    >Ghi chú:</v-list-item-title
                  >
                  <v-list-item-subtitle>{{
                    order.note || 'Không có'
                  }}</v-list-item-subtitle>
                </v-list-item>
              </v-list>

              <v-divider class="my-4"></v-divider>

              <h4 class="text-subtitle-1 font-weight-medium mb-2">
                Các sản phẩm:
              </h4>
              <v-list class="bg-transparent" density="compact">
                <v-list-item
                  v-for="item in order.items"
                  :key="item.id"
                  class="mb-1"
                >
                  <v-list-item-title>
                    (ID: {{ item.productId }}) - SL: {{ item.quantity }}
                  </v-list-item-title>
                  <template v-slot:append>
                    <span class="font-weight-bold">
                      {{ formatPrice(item.priceAtPurchase * item.quantity) }}
                    </span>
                  </template>
                </v-list-item>
              </v-list>

              <v-divider class="my-4"></v-divider>

              <div
                class="d-flex justify-space-between align-center text-h5 mb-6"
              >
                <span class="font-weight-medium">Tổng cộng:</span>
                <span class="font-weight-bold text-primary">{{
                  formatPrice(order.totalAmount)
                }}</span>
              </div>

              <div class="text-center">
                <v-progress-circular
                  indeterminate
                  color="primary"
                  size="50"
                  class="mb-4"
                ></v-progress-circular>
                <p class="text-medium-emphasis">
                  Đang tạo liên kết thanh toán. Vui lòng chờ...
                </p>
                <p class="text-caption text-grey">(Sẽ tự động chuyển hướng)</p>
              </div>
            </v-card-text>
          </template>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { getPaymentUrlApi, getOrderByIdApi } from '@/api/orderApi';
import { useNotificationStore } from '@/stores/useNotificationStore';

const props = defineProps({ id: String });
const error = ref(null);
const order = ref(null);
const loadingOrder = ref(true);
const notificationStore = useNotificationStore();

let pollInterval = null;
let pollTimeout = null;

const formatPrice = (value) => {
  if (!value) return '0 ₫';
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(value);
};

const pollForPaymentUrl = async () => {
  try {
    const paymentUrl = await getPaymentUrlApi(props.id);
    if (paymentUrl) {
      clearInterval(pollInterval);
      clearTimeout(pollTimeout);
      window.location.href = paymentUrl;
    }
  } catch (err) {
    handlePollingError(
      err.message || 'Không thể tạo thanh toán. Vui lòng thử lại.'
    );
  }
};

const handlePollingError = (errorMessage) => {
  error.value = errorMessage;
  notificationStore.showError(error.value);
  clearInterval(pollInterval);
  clearTimeout(pollTimeout);
};

onMounted(async () => {
  try {
    order.value = await getOrderByIdApi(props.id);
    loadingOrder.value = false;

    if (order.value.orderStatus !== 'PENDING') {
      handlePollingError('Đơn hàng này không còn ở trạng thái chờ thanh toán.');
      return;
    }

    // Nếu đã có paymentUrl, chuyển hướng ngay
    if (order.value.paymentUrl) {
      window.location.href = order.value.paymentUrl;
      return;
    }

    // Nếu chưa có, bắt đầu polling
    pollInterval = setInterval(pollForPaymentUrl, 2000);
    pollTimeout = setTimeout(() => {
      if (!error.value) {
        handlePollingError(
          'Quá trình xử lý mất quá lâu. Vui lòng thử lại từ Lịch sử đơn hàng.'
        );
      }
    }, 30000); // 30 giây timeout
  } catch (err) {
    error.value = err.message || 'Không thể tải chi tiết đơn hàng.';
    notificationStore.showError(error.value);
    loadingOrder.value = false;
  }
});

onUnmounted(() => {
  clearInterval(pollInterval);
  clearTimeout(pollTimeout);
});
</script>