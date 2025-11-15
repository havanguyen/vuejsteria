<template>
  <v-container class="fill-height">
    <v-row align="center" justify="center">
      <v-col cols="12" md="6" class="text-center">
        <v-card class="pa-8">
          <v-alert
            v-if="error"
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

          <template v-else>
            <v-progress-circular
              indeterminate
              color="primary"
              size="64"
              class="mb-6"
            ></v-progress-circular>
            <h1 class="text-h5 font-weight-medium mb-4">
              Đang xử lý thanh toán
            </h1>
            <p class="text-medium-emphasis">
              Chúng tôi đang tạo liên kết thanh toán. Vui lòng không tắt trình
              duyệt...
            </p>
            <p class="text-caption text-grey mt-2">(Order ID: {{ id }})</p>
          </template>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { getPaymentUrlApi } from '@/api/orderApi';
import { useNotificationStore } from '@/stores/useNotificationStore';

const props = defineProps({ id: String });
const error = ref(null);
const notificationStore = useNotificationStore();

let pollInterval = null;
let pollTimeout = null;

const pollForPaymentUrl = async () => {
  try {
    const paymentUrl = await getPaymentUrlApi(props.id);

    if (paymentUrl) {
      clearInterval(pollInterval);
      clearTimeout(pollTimeout);
      window.location.href = paymentUrl;
    }
  } catch (err) {
    error.value =
      err.message || 'Không thể tạo thanh toán. Vui lòng thử lại.';
    notificationStore.showError(error.value);
    clearInterval(pollInterval);
    clearTimeout(pollTimeout);
  }
};

onMounted(() => {
  pollInterval = setInterval(pollForPaymentUrl, 2000);

  pollTimeout = setTimeout(() => {
    clearInterval(pollInterval);
    if (!error.value) {
      error.value =
        'Quá trình xử lý mất quá lâu. Vui lòng thử lại từ giỏ hàng.';
      notificationStore.showError(error.value);
    }
  }, 30000);
});

onUnmounted(() => {
  clearInterval(pollInterval);
  clearTimeout(pollTimeout);
});
</script>