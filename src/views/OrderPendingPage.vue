<template>
  <v-container class="fill-height py-8">
    <v-row align="center" justify="center">
      <v-col cols="12" md="8" lg="6">
        <v-card class="glass-card text-center overflow-visible">
          <!-- Decorative Pulse Background -->
          <div class="pulse-ring"></div>
          
          <v-card-title class="text-h5 font-weight-bold pt-8 pb-2">
            Order Confirmation
          </v-card-title>
          <v-card-subtitle class="text-body-1 mb-6">
            Please wait while we secure your order...
          </v-card-subtitle>

          <v-skeleton-loader
            v-if="loadingOrder"
            type="article, list-item-three-line"
            class="bg-transparent mx-4"
          ></v-skeleton-loader>

          <v-alert
            v-else-if="error"
            type="error"
            variant="tonal"
            class="mx-6 mb-6"
            icon="mdi-alert-circle-outline"
            prominent
          >
            <div class="text-subtitle-1 font-weight-bold">Something went wrong</div>
            <div>{{ error }}</div>
            <v-btn
              :to="{ name: 'Cart' }"
              color="error"
              variant="outlined"
              class="mt-4"
              block
            >
              Return to Cart
            </v-btn>
          </v-alert>

          <template v-else-if="order">
            <v-card-text class="px-6 px-md-10">
              <div class="order-summary-box rounded-xl pa-6 mb-8 text-left">
                <div class="d-flex justify-space-between align-center mb-4">
                  <span class="text-medium-emphasis">Order ID</span>
                  <span class="font-weight-bold font-mono">{{ order.id }}</span>
                </div>
                
                <v-divider class="mb-4 border-dashed"></v-divider>
                
                <div class="d-flex align-start mb-4">
                  <v-icon color="primary" class="mr-3 mt-1">mdi-map-marker-radius</v-icon>
                  <div>
                    <div class="font-weight-bold text-primary">Shipping To</div>
                    <div class="text-body-2">
                      {{ order.shippingAddress.stress }},
                      {{ order.shippingAddress.commune }},
                      {{ order.shippingAddress.city }}
                    </div>
                  </div>
                </div>

                <div class="d-flex justify-space-between align-center mt-6 pt-4 border-top-solid">
                  <span class="text-h6 font-weight-bold">Total Amount</span>
                  <span class="text-h5 font-weight-bold text-primary">{{
                    formatPrice(order.totalAmount)
                  }}</span>
                </div>
              </div>

              <div class="processing-state py-4">
                <v-progress-circular
                  indeterminate
                  color="primary"
                  size="64"
                  width="6"
                  class="mb-6"
                ></v-progress-circular>
                
                <h3 class="text-h6 font-weight-bold mb-2">Connecting to Payment Gateway</h3>
                <p class="text-medium-emphasis mb-1">
                  We are generating your secure payment link.
                </p>
                <p class="text-caption text-grey">
                  You will be automatically redirected in a few seconds.
                </p>
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
      err.message || 'Unable to generate payment link. Please try again.'
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
      handlePollingError('This order is no longer pending payment.');
      return;
    }

    // If paymentUrl exists, redirect immediately
    if (order.value.paymentUrl) {
      window.location.href = order.value.paymentUrl;
      return;
    }

    // If not, start polling
    pollInterval = setInterval(pollForPaymentUrl, 2000);
    pollTimeout = setTimeout(() => {
      if (!error.value) {
        handlePollingError(
          'Process timed out. Please try again from Order History.'
        );
      }
    }, 30000); // 30 seconds timeout
  } catch (err) {
    error.value = err.message || 'Unable to load order details.';
    notificationStore.showError(error.value);
    loadingOrder.value = false;
  }
});

onUnmounted(() => {
  clearInterval(pollInterval);
  clearTimeout(pollTimeout);
});
</script>

<style scoped>
.glass-card {
  background: rgba(255, 255, 255, 0.9) !important;
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.5);
  border-radius: 32px !important;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.1) !important;
  position: relative;
}

.order-summary-box {
  background: rgba(var(--v-theme-surface-variant), 0.05);
  border: 1px solid rgba(0,0,0,0.05);
}

.font-mono {
  font-family: monospace;
  letter-spacing: 1px;
}

.border-dashed {
  border-style: dashed !important;
}

.border-top-solid {
  border-top: 2px solid rgba(0,0,0,0.05);
}

@keyframes pulse-ring {
  0% {
    transform: scale(0.8);
    opacity: 0.5;
  }
  100% {
    transform: scale(1.3);
    opacity: 0;
  }
}

.pulse-ring {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 300px;
  height: 300px;
  background: radial-gradient(circle, rgba(var(--v-theme-primary), 0.1) 0%, transparent 70%);
  border-radius: 50%;
  animation: pulse-ring 2s infinite cubic-bezier(0.4, 0, 0.6, 1);
  z-index: -1;
  pointer-events: none;
}
</style>