<template>
  <div v-if="loadingStore.isLoading">
    <v-row>
      <v-col v-for="n in 9" :key="n" cols="12" sm="6" md="3">
        <v-skeleton-loader type="image, article, button"></v-skeleton-loader>
      </v-col>
    </v-row>
  </div>
  <div v-else-if="products.length > 0">
    <v-row>
      <v-col
        v-for="product in products"
        :key="product.id"
        cols="12"
        sm="6"
        md="3"
      >
        <ProductCard :product="product" />
      </v-col>
    </v-row>
    <v-pagination
      v-if="pagination.totalPages > 1"
      :model-value="pagination.page + 1"
      :length="pagination.totalPages"
      @update:modelValue="onPageChange"
      class="mt-8"
      rounded="circle"
    ></v-pagination>
  </div>
  <v-alert v-else type="info" variant="tonal" class="mt-4">
    No products found.
  </v-alert>
</template>

<script setup>
import ProductCard from './ProductCard.vue';
import { useLoadingStore }from '@/stores/useLoadingStore';

const loadingStore = useLoadingStore();

defineProps({
  products: {
    type: Array,
    required: true
  },
  pagination: {
    type: Object,
    required: true
  }
});

const emit = defineEmits(['page-change']);

const onPageChange = (page) => {
  emit('page-change', page - 1);
};
</script>