<template>
  <v-container class="py-4 px-8">
    <v-alert
      type="info"
      variant="tonal"
      class="mb-6 elevation-2"
      color="primary"
      icon="mdi-fire"
    >
      <div class="text-h6 font-weight-bold text-primary">
        🔥 FLASH SALE ALERT!
      </div>
      <div class="text-body-2">
        Thousands of featured products are on discount. Don't miss out!
      </div>
    </v-alert>
    
    <h1 class="text-h4 font-weight-bold mb-6" style="text-shadow: none">
      Featured Products
    </h1>
    <ProductGrid
      :products="products"
      :pagination="pagination"
      @page-change="handlePageChange"
    />
  </v-container>
</template>

<script setup>
import { onMounted } from 'vue';
import { storeToRefs } from 'pinia';
import { useProductStore } from '@/stores/useProductStore';
import ProductGrid from '@/components/product/ProductGrid.vue';

const productStore = useProductStore();
const { products, pagination } = storeToRefs(productStore);

const handlePageChange = (page) => {
  productStore.fetchProducts(page, pagination.value.size);
};

onMounted(() => {
  productStore.fetchProducts();
});
</script>

<style>
.hover-lift {
  transition:
    all 0.2s ease-out !important;
}
.hover-lift:hover {
  transform: translateY(-2px);
  box-shadow: 0px 6px 15px rgba(0, 0, 0, 0.2) !important;
}
</style>