<template>
  <v-container class="py-4 px-8">
    
    <v-text-field
      v-model="localSearchQuery"
      label="Search for books, authors..."
      prepend-inner-icon="mdi-magnify"
      variant="solo-filled"
      density="comfortable"
      clearable
      rounded="xl"
      class="mb-6 elevation-2"
      @keydown.enter="updateRouteQuery"
      @click:clear="clearSearch"
    ></v-text-field>

    <h1 class="text-h4 font-weight-bold mb-6">
      Search Results for: 
      <span class="text-primary" style="text-shadow: none">"{{ route.query.q }}"</span>
      <span class="text-medium-emphasis text-subtitle-1 ml-2">({{ pagination.totalElements }} items found)</span>
    </h1>

    <ProductGrid
      :products="products"
      :pagination="pagination"
      @page-change="handlePageChange"
    />
  </v-container>
</template>

<script setup>
import { onMounted, watch, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { storeToRefs } from 'pinia';
import { useProductStore } from '@/stores/useProductStore';
import ProductGrid from '@/components/product/ProductGrid.vue';

const route = useRoute();
const router = useRouter();
const productStore = useProductStore();
const { products, pagination } = storeToRefs(productStore);

const localSearchQuery = ref(route.query.q || '');

const performSearch = (query, page = 0) => {
  if (!query) {
    products.value = [];
    pagination.value.totalElements = 0;
    return;
  }
  productStore.searchProducts(
    query,
    page,
    pagination.value.size || 12
  );
};

const handlePageChange = (page) => {
  performSearch(route.query.q, page);
};

const updateRouteQuery = () => {
  if (localSearchQuery.value && localSearchQuery.value !== route.query.q) {
    router.push({
      name: 'Search',
      query: { q: localSearchQuery.value }
    });
  } else if (!localSearchQuery.value) {
    clearSearch();
  }
};

const clearSearch = () => {
    localSearchQuery.value = '';
    router.push({ name: 'Search', query: { q: '' } });
}

onMounted(() => {
  performSearch(route.query.q);
});

watch(
  () => route.query.q,
  (newQuery) => {
    localSearchQuery.value = newQuery || '';
    if (newQuery) {
      performSearch(newQuery, 0);
    } else {
      performSearch('');
    }
  },
  { immediate: true }
);
</script>