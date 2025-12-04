<template>
  <v-container class="py-8">
    <div class="d-flex align-center justify-space-between mb-6">
      <h1 class="text-h4 font-weight-bold d-flex align-center">
        <v-icon class="mr-3" color="primary">mdi-history</v-icon>
        Order History
      </h1>
      <v-btn
        :to="{ name: 'Home' }"
        variant="tonal"
        color="primary"
        prepend-icon="mdi-shopping"
        class="text-capitalize"
      >
        Continue Shopping
      </v-btn>
    </div>

    <v-skeleton-loader
      v-if="loading"
      type="table-heading, list-item-two-line@3"
      class="bg-transparent"
    ></v-skeleton-loader>

    <v-alert
      v-else-if="error"
      type="error"
      variant="tonal"
      class="glass-card mb-4"
      icon="mdi-alert-circle-outline"
    >
      {{ error }}
    </v-alert>

    <div v-else-if="orders.length === 0" class="text-center py-16 glass-card rounded-xl">
      <v-icon size="80" color="grey-lighten-2" class="mb-4">mdi-clipboard-text-off-outline</v-icon>
      <h3 class="text-h5 font-weight-bold text-medium-emphasis mb-2">No orders found</h3>
      <p class="text-body-1 text-medium-emphasis mb-6">Looks like you haven't placed any orders yet.</p>
      <v-btn :to="{ name: 'Home' }" color="primary" variant="flat" size="large" rounded="xl" class="px-8">
        Start Shopping
      </v-btn>
    </div>

    <v-card v-else class="glass-card pa-0 overflow-hidden rounded-xl elevation-4">
      <v-data-table
        :headers="headers"
        :items="orders"
        :sort-by="[{ key: 'createdAt', order: 'desc' }]"
        class="bg-transparent"
        hover
      >
        <template v-slot:item.id="{ item }">
          <span class="font-weight-bold text-primary">#{{ item.id.substring(0, 8) }}...</span>
        </template>

        <template v-slot:item.createdAt="{ item }">
          <div class="d-flex align-center">
            <v-icon size="small" class="mr-2" color="medium-emphasis">mdi-calendar-blank</v-icon>
            {{ formatDateTime(item.createdAt) }}
          </div>
        </template>

        <template v-slot:item.totalAmount="{ item }">
          <span class="font-weight-bold text-h6 text-primary">{{ formatPrice(item.totalAmount) }}</span>
        </template>

        <template v-slot:item.orderStatus="{ item }">
          <v-chip
            :color="getStatusColor(item.orderStatus)"
            size="small"
            label
            class="font-weight-bold text-uppercase"
          >
            {{ item.orderStatus }}
          </v-chip>
        </template>

        <template v-slot:item.actions="{ item }">
          <v-btn
            :to="{ name: 'OrderDetail', params: { id: item.id } }"
            variant="tonal"
            color="primary"
            size="small"
            prepend-icon="mdi-eye-outline"
            class="text-capitalize"
            rounded="lg"
          >
            View Details
          </v-btn>
        </template>
      </v-data-table>
    </v-card>
  </v-container>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { getMyOrdersApi } from '@/api/orderApi';

const orders = ref([]);
const loading = ref(true);
const error = ref(null);

const headers = [
  { title: 'Order ID', key: 'id', align: 'start' },
  { title: 'Date Placed', key: 'createdAt', align: 'start' },
  { title: 'Total Amount', key: 'totalAmount', align: 'end' },
  { title: 'Status', key: 'orderStatus', align: 'center' },
  { title: 'Actions', key: 'actions', align: 'end', sortable: false },
];

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

onMounted(async () => {
  try {
    orders.value = await getMyOrdersApi();
  } catch (err) {
    console.error('Failed to fetch orders:', err);
    error.value = 'Unable to load order history. Please try again later.';
  } finally {
    loading.value = false;
  }
});
</script>

<style scoped>
.glass-card {
  background: rgba(255, 255, 255, 0.7) !important;
  backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.5);
  border-radius: 24px !important;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.05) !important;
}
</style>