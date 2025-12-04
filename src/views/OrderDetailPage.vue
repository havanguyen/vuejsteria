<template>
  <v-container class="py-8">
    <v-btn
      variant="text"
      prepend-icon="mdi-arrow-left"
      @click="goBack"
      class="mb-6 text-capitalize"
      color="primary"
    >
      Back to Orders
    </v-btn>

    <v-skeleton-loader
      v-if="loading"
      type="article, list-item-three-line@3"
      class="bg-transparent"
    ></v-skeleton-loader>

    <v-alert v-else-if="error" type="error" variant="tonal" class="glass-card">
      {{ error }}
    </v-alert>

    <v-card v-else-if="order" class="glass-card pa-0 overflow-hidden">
      <div class="pa-6 pb-4 d-flex flex-wrap align-center justify-space-between gap-4 border-bottom">
        <div>
          <div class="text-overline text-medium-emphasis mb-1">Order Details</div>
          <h1 class="text-h5 font-weight-bold text-primary">Order #{{ order.id }}</h1>
          <div class="text-body-2 text-medium-emphasis mt-1">
            Placed on {{ formatDateTime(order.createdAt) }}
          </div>
        </div>
        <v-chip
          :color="getStatusColor(order.orderStatus)"
          label
          class="font-weight-bold px-4"
          size="large"
        >
          {{ order.orderStatus }}
        </v-chip>
      </div>

      <v-card-text class="pa-6">
        <v-row>
          <v-col cols="12" md="8">
            <h3 class="text-h6 font-weight-bold mb-4 d-flex align-center">
              <v-icon color="primary" class="mr-2">mdi-package-variant-closed</v-icon>
              Items Ordered
            </h3>
            <v-card variant="outlined" class="bg-transparent border-dashed rounded-lg mb-6">
              <v-list class="bg-transparent pa-2" lines="two">
                <template v-for="(item, index) in order.items" :key="item.id">
                  <v-list-item
                    :to="{ name: 'ProductDetail', params: { id: item.productId } }"
                    class="rounded-lg mb-1"
                  >
                    <template v-slot:prepend>
                      <v-avatar rounded="lg" size="60" color="grey-lighten-4" class="mr-4">
                        <v-img
                          src="https://via.placeholder.com/150"
                          cover
                        >
                          <template v-slot:placeholder>
                            <v-icon>mdi-book</v-icon>
                          </template>
                        </v-img>
                      </v-avatar>
                    </template>
                    
                    <v-list-item-title class="font-weight-bold text-body-1 mb-1">
                      Product ID: {{ item.productId }}
                    </v-list-item-title>
                    
                    <v-list-item-subtitle>
                      <div class="d-flex align-center text-body-2">
                        <span class="text-medium-emphasis">Qty: {{ item.quantity }}</span>
                        <span class="mx-2">•</span>
                        <span class="text-primary font-weight-medium">
                          {{ formatPrice(item.priceAtPurchase) }}
                        </span>
                      </div>
                    </v-list-item-subtitle>

                    <template v-slot:append>
                      <div class="text-h6 font-weight-bold text-primary">
                        {{ formatPrice(item.priceAtPurchase * item.quantity) }}
                      </div>
                    </template>
                  </v-list-item>
                  <v-divider v-if="index < order.items.length - 1" class="my-2 opacity-20"></v-divider>
                </template>
              </v-list>
            </v-card>

            <h3 class="text-h6 font-weight-bold mb-4 d-flex align-center">
              <v-icon color="primary" class="mr-2">mdi-truck-delivery-outline</v-icon>
              Shipping Information
            </h3>
            <v-card variant="outlined" class="bg-transparent border-dashed rounded-lg pa-4">
              <div class="d-flex align-start mb-4">
                <v-icon color="medium-emphasis" class="mr-3 mt-1">mdi-map-marker-outline</v-icon>
                <div>
                  <div class="font-weight-medium mb-1">Delivery Address</div>
                  <div class="text-body-2 text-medium-emphasis">
                    {{ order.shippingAddress.stress }}<br>
                    {{ order.shippingAddress.commune }}<br>
                    {{ order.shippingAddress.city }}
                  </div>
                </div>
              </div>
              <v-divider class="my-3 opacity-20"></v-divider>
              <div class="d-flex align-start">
                <v-icon color="medium-emphasis" class="mr-3 mt-1">mdi-note-text-outline</v-icon>
                <div>
                  <div class="font-weight-medium mb-1">Order Note</div>
                  <div class="text-body-2 text-medium-emphasis">
                    {{ order.note || 'No special instructions' }}
                  </div>
                </div>
              </div>
            </v-card>
          </v-col>

          <v-col cols="12" md="4">
            <v-card class="glass-summary pa-6 rounded-xl position-sticky" style="top: 24px">
              <h3 class="text-h6 font-weight-bold mb-6">Order Summary</h3>
              
              <div class="d-flex justify-space-between mb-3">
                <span class="text-medium-emphasis">Subtotal</span>
                <span class="font-weight-medium">{{ formatPrice(order.totalAmount) }}</span>
              </div>
              
              <div class="d-flex justify-space-between mb-3">
                <span class="text-medium-emphasis">Shipping</span>
                <span class="text-success font-weight-medium">Free</span>
              </div>
              
              <v-divider class="my-4 opacity-20"></v-divider>
              
              <div class="d-flex justify-space-between align-center mb-6">
                <span class="text-h6 font-weight-bold">Total</span>
                <span class="text-h5 font-weight-bold text-primary">
                  {{ formatPrice(order.totalAmount) }}
                </span>
              </div>

              <div v-if="order.orderStatus === 'PENDING'" class="d-flex flex-column gap-2">
                <v-btn
                  v-if="order.paymentUrl"
                  color="primary"
                  variant="flat"
                  size="large"
                  block
                  :href="order.paymentUrl"
                  class="text-capitalize font-weight-bold"
                >
                  Pay Now
                </v-btn>
                <v-btn
                  v-else
                  color="primary"
                  variant="flat"
                  size="large"
                  block
                  :to="{ name: 'OrderPending', params: { id: order.id } }"
                  class="text-capitalize font-weight-bold"
                >
                  Get Payment Link
                </v-btn>
                <div class="text-caption text-center text-medium-emphasis mt-2">
                  <v-icon size="small" class="mr-1">mdi-clock-outline</v-icon>
                  Payment is pending
                </div>
              </div>
              
              <div v-else class="text-center pa-4 bg-surface-variant-lighten rounded-lg">
                <v-icon 
                  :color="getStatusColor(order.orderStatus)" 
                  size="32" 
                  class="mb-2"
                >
                  {{ getStatusIcon(order.orderStatus) }}
                </v-icon>
                <div class="font-weight-medium">
                  Order {{ order.orderStatus.toLowerCase() }}
                </div>
              </div>
            </v-card>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { getOrderByIdApi } from '@/api/orderApi';
import { useNotificationStore } from '@/stores/useNotificationStore';

const props = defineProps({ id: String });
const route = useRoute();
const router = useRouter();
const order = ref(null);
const loading = ref(true);
const error = ref(null);
const notificationStore = useNotificationStore();

const goBack = () => {
  router.back();
};

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
    return new Date(dateTimeString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (e) {
    return dateTimeString;
  }
};

const getStatusColor = (status) => {
  switch (status) {
    case 'PENDING': return 'warning';
    case 'SUCCESS':
    case 'COMPLETED': return 'success';
    case 'CANCELLED':
    case 'FAILED': return 'error';
    default: return 'grey';
  }
};

const getStatusIcon = (status) => {
  switch (status) {
    case 'PENDING': return 'mdi-clock-outline';
    case 'SUCCESS':
    case 'COMPLETED': return 'mdi-check-circle-outline';
    case 'CANCELLED':
    case 'FAILED': return 'mdi-close-circle-outline';
    default: return 'mdi-help-circle-outline';
  }
};

onMounted(async () => {
  try {
    order.value = await getOrderByIdApi(props.id);
  } catch (err) {
    error.value = err.message || 'Unable to load order details.';
    notificationStore.showError(error.value);
  } finally {
    loading.value = false;
  }
});
</script>

<style scoped>
.glass-card {
  background: rgba(255, 255, 255, 0.6) !important;
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.5);
  border-radius: 16px !important;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.05) !important;
}

.glass-summary {
  background: rgba(255, 255, 255, 0.4) !important;
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.5);
}

.border-bottom {
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}

.border-dashed {
  border: 1px dashed rgba(0, 0, 0, 0.1) !important;
}

.bg-surface-variant-lighten {
  background-color: rgba(var(--v-theme-surface-variant), 0.05);
}

.opacity-20 {
  opacity: 0.2;
}

.gap-4 {
  gap: 16px;
}

.gap-2 {
  gap: 8px;
}
</style>