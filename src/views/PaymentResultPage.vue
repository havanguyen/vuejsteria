<template>
  <v-container class="fill-height">
    <v-row align="center" justify="center">
      <v-col cols="12" md="6" class="text-center">
        <v-card class="pa-8">
          <template v-if="isSuccess">
            <v-icon
              icon="mdi-check-circle"
              color="success"
              size="80"
              class="mb-4"
            ></v-icon>
            <h1 class="text-h5 font-weight-medium mb-2">
              Thanh toán thành công!
            </h1>
            <p class="text-medium-emphasis">
              Cảm ơn bạn đã mua hàng. Đơn hàng của bạn đang được xử lý.
            </p>
          </template>
          <template v-else>
            <v-icon
              icon="mdi-alert-circle"
              color="error"
              size="80"
              class="mb-4"
            ></v-icon>
            <h1 class="text-h5 font-weight-medium mb-2">
              Thanh toán thất bại
            </h1>
            <p class="text-medium-emphasis">
              Đã xảy ra lỗi trong quá trình thanh toán hoặc bạn đã hủy giao
              dịch. Vui lòng thử lại.
            </p>
          </template>

          <p v-if="orderId" class="text-caption text-grey mt-4">
            Mã Đơn Hàng: {{ orderId }}
          </p>

          <v-divider class="my-6"></v-divider>

          <v-btn
            color="primary"
            variant="flat"
            :to="{ name: 'Home' }"
            class="mx-2"
          >
            Quay về Trang chủ
          </v-btn>
          <v-btn
            v-if="orderId && isSuccess"
            color="primary"
            variant="outlined"
            :to="{ name: 'OrderDetail', params: { id: orderId } }"
            class="mx-2"
          >
            Xem Chi tiết Đơn hàng
          </v-btn>
          <v-btn
            v-else
            color="primary"
            variant="outlined"
            :to="{ name: 'OrderHistory' }"
            class="mx-2"
          >
            Xem Lịch sử Đơn hàng
          </v-btn>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();

const status = ref('');
const orderId = ref('');

const isSuccess = computed(() => {
  // '00' là mã thành công của VNPay
  return status.value === 'success' || status.value === '00';
});

onMounted(() => {
  status.value = route.query.status || route.query.code || '';
  orderId.value = route.query.orderId || '';
});
</script>