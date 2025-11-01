<template>
  <v-container class="py-4 px-8">
    <h1 class="text-h4 font-weight-bold mb-6" style="text-shadow: none">
      Sản phẩm nổi bật
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