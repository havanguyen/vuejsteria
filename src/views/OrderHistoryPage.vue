<template>
  <v-container>
    <h1 class="text-h4 font-weight-bold mb-6">Lịch sử Đơn hàng</h1>

    <v-skeleton-loader
      v-if="loading"
      type="list-item-three-line@5"
    ></v-skeleton-loader>

    <v-alert v-else-if="error" type="error" variant="tonal">
      {{ error }}
    </v-alert>

    <v-alert v-else-if="orders.length === 0" type="info" variant="tonal">
      Bạn chưa có đơn hàng nào.
    </v-alert>

    <v-card v-else variant="outlined" class="pa-0">
      <v-list lines="three">
        <template v-for="(order, index) in orders" :key="order.id">
          <v-list-item
            :to="{ name: 'OrderDetail', params: { id: order.id } }"
          >
            <template v-slot:prepend>
              <v-avatar
                :color="getStatusColor(order.orderStatus)"
                variant="tonal"
                class="mr-4"
              >
                <v-icon :icon="getStatusIcon(order.orderStatus)"></v-icon>
              </v-avatar>
            </template>

            <v-list-item-title class="font-weight-bold mb-1">
              Đơn hàng: {{ order.id }}
            </v-list-item-title>
            <v-list-item-subtitle>
              Ngày đặt: {{ formatDateTime(order.createdAt) }}
            </v-list-item-subtitle>
            <v-list-item-subtitle class="font-weight-medium mt-1">
              Tổng tiền: {{ formatPrice(order.totalAmount) }}
            </v-list-item-subtitle>

            <template v-slot:append>
              <div class="d-flex flex-column align-end">
                <v-chip
                  :color="getStatusColor(order.orderStatus)"
                  size="small"
                  label
                  class="mb-2"
                >
                  {{ order.orderStatus }}
                </v-chip>
                <v-btn
                  v-if="order.orderStatus === 'PENDING'"
                  color="primary"
                  variant="flat"
                  size="small"
                  :to="{ name: 'OrderPending', params: { id: order.id } }"
                  @click.prevent
                >
                  Thanh toán ngay
                </v-btn>
                <v-icon v-else>mdi-chevron-right</v-icon>
              </div>
            </template>
          </v-list-item>
          <v-divider v-if="index < orders.length - 1"></v-divider>
        </template>
      </v-list>
    </v-card>
  </v-container>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { getMyOrdersApi } from '@/api/orderApi';
import { useNotificationStore } from '@/stores/useNotificationStore';

const orders = ref([]);
const loading = ref(true);
const error = ref(null);
const notificationStore = useNotificationStore();

const formatPrice = (value) => {
  if (!value) return '0 ₫';
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(value);
};

const formatDateTime = (dateTimeString) => {
  if (!dateTimeString) return 'N/A';
  try {
    return new Date(dateTimeString).toLocaleString('vi-VN');
  } catch (e) {
    return dateTimeString;
  }
};

const getStatusColor = (status) => {
  switch (status) {
    case 'PENDING':
      return 'warning';
    case 'SUCCESS':
    case 'COMPLETED':
      return 'success';
    case 'CANCELLED':
    case 'FAILED':
      return 'error';
    default:
      return 'grey';
  }
};

const getStatusIcon = (status) => {
  switch (status) {
    case 'PENDING':
      return 'mdi-clock-outline';
    case 'SUCCESS':
    case 'COMPLETED':
      return 'mdi-check-circle-outline';
    case 'CANCELLED':
    case 'FAILED':
      return 'mdi-close-circle-outline';
    default:
      return 'mdi-help-circle-outline';
  }
};

onMounted(async () => {
  try {
    const data = await getMyOrdersApi();
    // Sắp xếp đơn hàng mới nhất lên đầu
    orders.value = data.sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );
  } catch (err) {
    error.value = err.message || 'Không thể tải lịch sử đơn hàng.';
    notificationStore.showError(error.value);
  } finally {
    loading.value = false;
  }
});
</script>