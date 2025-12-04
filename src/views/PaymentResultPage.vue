<template>
  <v-container class="fill-height py-8">
    <v-row align="center" justify="center">
      <v-col cols="12" md="8" lg="6" class="text-center">
        <v-card class="glass-card pa-8 pa-md-12 overflow-visible">
          <div class="status-icon-wrapper mb-8">
            <v-icon
              v-if="isSuccess"
              icon="mdi-check-circle"
              color="success"
              size="120"
              class="status-icon success-pulse"
            ></v-icon>
            <v-icon
              v-else
              icon="mdi-close-circle"
              color="error"
              size="120"
              class="status-icon error-pulse"
            ></v-icon>
          </div>

          <h1 class="text-h3 font-weight-bold mb-4">
            {{ isSuccess ? 'Payment Successful!' : 'Payment Failed' }}
          </h1>
          
          <p class="text-h6 text-medium-emphasis mb-8 font-weight-regular">
            {{ isSuccess 
              ? 'Thank you for your purchase. Your order has been confirmed.' 
              : 'Something went wrong with the transaction or it was cancelled.' 
            }}
          </p>

          <div v-if="orderId" class="d-inline-block bg-surface-variant-lighten rounded-pill px-6 py-2 mb-8">
            <span class="text-body-2 text-medium-emphasis mr-2">Order ID:</span>
            <span class="text-body-1 font-weight-bold font-mono">{{ orderId }}</span>
          </div>

          <v-divider class="mb-8 opacity-20"></v-divider>

          <div class="d-flex flex-column flex-sm-row justify-center gap-4">
            <v-btn
              color="primary"
              variant="flat"
              size="x-large"
              rounded="xl"
              :to="{ name: 'Home' }"
              prepend-icon="mdi-home"
              class="px-8 hover-lift"
              elevation="4"
            >
              Back to Home
            </v-btn>
            
            <v-btn
              v-if="orderId && isSuccess"
              color="primary"
              variant="outlined"
              size="x-large"
              rounded="xl"
              :to="{ name: 'OrderDetail', params: { id: orderId } }"
              class="px-8 hover-lift"
              prepend-icon="mdi-receipt-text"
            >
              View Order
            </v-btn>
            
            <v-btn
              v-else
              color="primary"
              variant="outlined"
              size="x-large"
              rounded="xl"
              :to="{ name: 'OrderHistory' }"
              class="px-8 hover-lift"
              prepend-icon="mdi-history"
            >
              Order History
            </v-btn>
          </div>
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

<style scoped>
.glass-card {
  background: rgba(255, 255, 255, 0.9) !important;
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.5);
  border-radius: 32px !important;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.1) !important;
}

.bg-surface-variant-lighten {
  background-color: rgba(var(--v-theme-surface-variant), 0.05);
}

.font-mono {
  font-family: monospace;
  letter-spacing: 1px;
}

.gap-4 {
  gap: 16px;
}

.hover-lift {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.hover-lift:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(var(--v-theme-primary), 0.4) !important;
}

.opacity-20 {
  opacity: 0.2;
}

@keyframes success-pulse {
  0% { box-shadow: 0 0 0 0 rgba(var(--v-theme-success), 0.4); }
  70% { box-shadow: 0 0 0 30px rgba(var(--v-theme-success), 0); }
  100% { box-shadow: 0 0 0 0 rgba(var(--v-theme-success), 0); }
}

@keyframes error-pulse {
  0% { box-shadow: 0 0 0 0 rgba(var(--v-theme-error), 0.4); }
  70% { box-shadow: 0 0 0 30px rgba(var(--v-theme-error), 0); }
  100% { box-shadow: 0 0 0 0 rgba(var(--v-theme-error), 0); }
}

.status-icon {
  border-radius: 50%;
}

.success-pulse {
  animation: success-pulse 2s infinite;
}

.error-pulse {
  animation: error-pulse 2s infinite;
}
</style>