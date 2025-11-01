<template>
  <v-container class="my-8">
    <v-skeleton-loader
      v-if="loading"
      type="article, image"
    ></v-skeleton-loader>

    <v-card v-else-if="product" class="pa-4 pa-md-6" elevation="0">
      <v-row>
        <v-col cols="12" md="5" lg="4">
          <v-img
            :src="product.imageUrl || 'https://via.placeholder.com/400'"
            max-height="500"
            cover
            class="rounded-lg elevation-2"
          ></v-img>
        </v-col>
        <v-col cols="12" md="7" lg="8">
          <h1 class="text-h3 font-weight-bold mb-2" style="text-shadow: none">
            {{ product.title }}
          </h1>
          <h2 class="text-h6 font-weight-medium text-medium-emphasis mb-4">
            Tác giả: {{ product.author.name }}
          </h2>
          <div class="text-h4 font-weight-bold text-error mb-6">
            {{ formatPrice(product.basePrice) }}
          </div>
          <p class="text-body-1 mb-8" style="text-shadow: none">
            {{ product.description }}
          </p>
          <v-btn
            color="primary"
            size="large"
            prepend-icon="mdi-cart-plus"
            variant="flat"
          >
            Thêm vào giỏ hàng
          </v-btn>
        </v-col>
      </v-row>

      <v-tabs v-model="tab" color="primary" class="mt-12" grow>
        <v-tab value="description">Mô tả sản phẩm</v-tab>
        <v-tab value="details">Thông tin chi tiết</v-tab>
        <v-tab value="reviews">Đánh giá (0)</v-tab>
      </v-tabs>

      <v-window v-model="tab" class="mt-6">
        <v-window-item value="description">
          <p v-if="product.description" style="text-shadow: none">
            {{ product.description }}
          </p>
          <p v-else>Không có mô tả chi tiết.</p>
        </v-window-item>

        <v-window-item value="details">
          <v-list lines="one" class="bg-transparent">
            <v-list-item
              title="Nhà xuất bản"
              :subtitle="product.publisher.name"
            ></v-list-item>
            <v-list-item
              title="Ngày xuất bản"
              :subtitle="product.publicationDate"
            ></v-list-item>
            <v-list-item
              title="Số trang"
              :subtitle="product.pageCount"
            ></v-list-item>
            <v-list-item
              title="ISBN"
              :subtitle="product.isbn"
            ></v-list-item>
          </v-list>
        </v-window-item>

        <v-window-item value="reviews">
          <p>Chưa có đánh giá nào cho sản phẩm này.</p>
        </v-window-item>
      </v-window>
    </v-card>

    <v-alert v-else type="error" class="mt-10">
      Không thể tải thông tin sản phẩm.
    </v-alert>
  </v-container>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { getProductByIdApi } from '@/api/productApi';
import { useLoadingStore } from '@/stores/useLoadingStore';

const route = useRoute();
const loadingStore = useLoadingStore();

const product = ref(null);
const loading = ref(true);
const tab = ref('description');

const formatPrice = (value) => {
  if (!value) return '0 ₫';
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(value);
};

onMounted(async () => {
  loadingStore.showLoading();
  loading.value = true;
  try {
    const data = await getProductByIdApi(route.params.id);
    product.value = data;
  } catch (error) {
    console.error('Failed to fetch product details:', error);
  } finally {
    loading.value = false;
    loadingStore.hideLoading();
  }
});
</script>