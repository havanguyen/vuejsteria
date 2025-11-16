<template>
  <v-container>
    <v-btn
      variant="text"
      prepend-icon="mdi-chevron-left"
      :to="{ name: 'OrderHistory' }"
      class="mb-4"
    >
      Về Lịch sử Đơn hàng
    </v-btn>

    <v-skeleton-loader
      v-if="loading"
      type="article, list-item-three-line@3"
    ></v-skeleton-loader>

    <v-alert v-else-if="error" type="error" variant="tonal">
      {{ error }}
    </v-alert>

    <v-card v-else-if="order" class="pa-4 pa-md-6">
      <v-card-title class="d-flex align-center">
        <span class="text-h5 font-weight-medium"
          >Chi tiết Đơn hàng</span
        >
        <v-spacer></v-spacer>
        <v-chip :color="getStatusColor(order.orderStatus)" label>
          {{ order.orderStatus }}
        </v-chip>
      </v-card-title>
      <v-card-subtitle>
        ID: {{ order.id }} | Ngày đặt: {{ formatDateTime(order.createdAt) }}
      </v-card-subtitle>

      <v-divider class="my-6"></v-divider>

      <v-row>
        <v-col cols="12" md="6">
          <h4 class="text-h6 font-weight-medium mb-3">Địa chỉ Giao hàng</h4>
          <v-card variant="outlined" class="pa-4">
            <p>
              {{ order.shippingAddress.stress }}
            </p>
            <p>
              {{ order.shippingAddress.commune }}
            </p>
            <p>
              {{ order.shippingAddress.city }}
            </p>
            <v-divider class="my-2"></v-divider>
            <p class="font-weight-medium">Ghi chú:</p>
            <p>{{ order.note || 'Không có' }}</p>
          </v-card>
        </v-col>
        <v-col cols="12" md="6">
          <h4 class="text-h6 font-weight-medium mb-3">Tóm tắt Thanh toán</h4>
          <v-card variant="outlined" class="pa-4">
            <v-list class="bg-transparent" density="compact">
              <v-list-item>
                <v-list-item-title>Tổng tiền hàng</v-list-item-title>
                <template v-slot:append>
                  <span class="font-weight-medium">{{
                    formatPrice(order.totalAmount)
                  }}</span>
                </template>
              </v-list-item>
              <v-list-item>
                <v-list-item-title>Phí vận chuyển</v-list-item-title>
                <template v-slot:append>
                  <span class="font-weight-medium">0 ₫</span>
                </template>
              </v-list-item>
              <v-divider class="my-2"></v-divider>
              <v-list-item class="text-h6">
                <v-list-item-title class="font-weight-bold"
                  >Tổng cộng</v-list-item-title
                >
                <template v-slot:append>
                  <span class="font-weight-bold text-primary">{{
                    formatPrice(order.totalAmount)
                  }}</span>
                </template>
              </v-list-item>
            </v-list>
          </v-card>
        </v-col>
      </v-row>

      <v-divider class="my-6"></v-divider>

      <h4 class="text-h6 font-weight-medium mb-3">Sản phẩm đã đặt</h4>
      <v-card variant="outlined">
        <v-list lines="two">
          <v-list-item
            v-for="item in order.items"
            :key="item.id"
            :to="{ name: 'ProductDetail', params: { id: item.productId } }"
          >
            <v-list-item-title class="font-weight-medium">
              Product ID: {{ item.productId }}
            </v-list-item-title>
            <v-list-item-subtitle>
              Giá tại thời điểm mua: {{ formatPrice(item.priceAtPurchase) }}
            </v-list-item-subtitle>
            <v-list-item-subtitle>
              Số lượng: {{ item.quantity }}
            </v-list-item-subtitle>
            <template v-slot:append>
              <span class="font-weight-bold text-body-1">
                {{ formatPrice(item.priceAtPurchase * item.quantity) }}
              </span>
            </template>
          </v-list-item>
        </v-list>
      </v-card>

      <v-card-actions v-if="order.orderStatus === 'PENDING'" class="pa-4 mt-6">
        <v-spacer></v-spacer>
        <v-btn
          v-if="order.paymentUrl"
          color="primary"
          variant="flat"
          size="large"
          :href="order.paymentUrl"
        >
          Thanh toán ngay ({{ formatPrice(order.totalAmount) }})
        </v-btn>
        <v-btn
          v-else
          color="primary"
          variant="flat"
          size="large"
          :to="{ name: 'OrderPending', params: { id: order.id } }"
        >
          Lấy link Thanh toán
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-container>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { getOrderByIdApi } from '@/api/orderApi';
import { useNotificationStore } from '@/stores/useNotificationStore';

const props = defineProps({ id: String });
const route = useRoute();
const order = ref(null);
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

onMounted(async () => {
  try {
    order.value = await getOrderByIdApi(props.id);
  } catch (err) {
    error.value = err.message || 'Không thể tải chi tiết đơn hàng.';
    notificationStore.showError(error.value);
  } finally {
    loading.value = false;
  }
});
</script>