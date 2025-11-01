<template>
  <v-container class="py-4 px-8">
    <h1 class="text-h4 font-weight-bold mb-6">
      Kết quả tìm kiếm cho:
      <span class="text-primary" style="text-shadow: none">{{
        route.query.q
      }}</span>
    </h1>
    <ProductGrid
      :products="products"
      :pagination="pagination"
      @page-change="handlePageChange"
    />
  </v-container>
</template>

<script setup>
import { onMounted, watch } from 'vue';
import { useRoute } from 'vue-router';
import { storeToRefs } from 'pinia';
import { useProductStore } from '@/stores/useProductStore';
import ProductGrid from '@/components/product/ProductGrid.vue';

const route = useRoute();
const productStore = useProductStore();
const { products, pagination } = storeToRefs(productStore);

const performSearch = (query, page = 0) => {
  productStore.searchProducts(
    query,
    page,
    pagination.value.size || 10
  );
};

const handlePageChange = (page) => {
  performSearch(route.query.q, page);
};

onMounted(() => {
  performSearch(route.query.q);
});

watch(
  () => route.query.q,
  (newQuery) => {
    if (newQuery) {
      performSearch(newQuery, 0);
    }
  }
);
</script>