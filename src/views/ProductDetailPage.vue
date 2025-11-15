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
            class="rounded-lg elevation-2 product-detail-image"
          ></v-img>
        </v-col>
        <v-col cols="12" md="7" lg="8">
          <h1 class="text-h3 font-weight-bold mb-2" style="text-shadow: none">
            {{ product.title }}
          </h1>
          <h2
            v-if="product.author?.name"
            class="text-h6 font-weight-medium text-medium-emphasis mb-4"
          >
            Tác giả: {{ product.author.name }}
          </h2>

          <div class="mb-4">
            <div v-if="isSelling" class="d-flex align-center">
              <div
                class="text-subtitle-1 text-grey me-3"
                style="text-decoration: line-through"
              >
                {{ formatPrice(product.basePrice) }}
              </div>
              <div class="text-h4 font-weight-bold text-error">
                {{ formatPrice(product.salePrice) }}
              </div>
              <v-chip
                color="red-lighten-1"
                size="small"
                variant="flat"
                class="ml-3 font-weight-bold"
              >
                SALE
              </v-chip>
            </div>
            <div v-else class="text-h4 font-weight-bold text-error">
              {{ formatPrice(product.basePrice) }}
            </div>
          </div>
          <v-alert
            v-if="isSelling && formattedSaleEndDate"
            type="warning"
            density="compact"
            variant="tonal"
            class="mb-6"
            icon="mdi-clock-end"
          >
            Ưu đãi kết thúc vào: {{ formattedSaleEndDate }}
          </v-alert>

          <p class="text-body-1 mb-6" style="text-shadow: none">
            {{ product.description }}
          </p>

          <div v-if="stock !== null" class="text-body-1 mb-8">
            <v-chip
              :color="stock > 0 ? 'success' : 'error'"
              variant="tonal"
              label
            >
              <v-icon start>mdi-package-variant</v-icon>
              {{ stock > 0 ? `In Stock: ${stock}` : 'Out of Stock' }}
            </v-chip>
          </div>

          <v-btn
            color="primary"
            size="large"
            prepend-icon="mdi-cart-plus"
            variant="flat"
            @click="handleAddToCart"
            :disabled="stock === 0"
          >
            {{ stock > 0 ? 'Thêm vào giỏ hàng' : 'Hết hàng' }}
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
              v-if="product.publisher?.name"
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

          <v-divider
            v-if="attributesArray.length > 0"
            class="my-4"
          ></v-divider>
          <h4
            v-if="attributesArray.length > 0"
            class="text-h6 font-weight-medium mb-3"
          >
            Thông tin thêm
          </h4>
          <v-list
            v-if="attributesArray.length > 0"
            lines="one"
            class="bg-transparent"
          >
            <v-list-item
              v-for="attr in attributesArray"
              :key="attr.key"
              :title="attr.key"
              :subtitle="attr.value"
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
import { ref, onMounted, computed, nextTick } from 'vue';
import { useRoute } from 'vue-router';
import { getProductByIdApi } from '@/api/productApi';
import { getInventoryApi } from '@/api/inventoryApi';
import { useLoadingStore } from '@/stores/useLoadingStore';
import { useCartStore } from '@/stores/useCartStore';
import { useAnimationStore } from '@/stores/useAnimationStore';
import { format } from 'date-fns';

const route = useRoute();
const loadingStore = useLoadingStore();
const cartStore = useCartStore();
const animationStore = useAnimationStore();

const product = ref(null);
const stock = ref(null);
const loading = ref(true);
const tab = ref('description');

const formatPrice = (value) => {
  if (!value) return '0 ₫';
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(value);
};

const isSelling = computed(() => {
  const productData = product.value;
  if (
    !productData ||
    !productData.salePrice ||
    productData.salePrice <= 0 ||
    productData.salePrice >= productData.basePrice
  ) {
    return false;
  }

  if (productData.saleEndDate) {
    const saleEndTime = new Date(productData.saleEndDate);
    const currentTime = new Date();

    if (currentTime.getTime() >= saleEndTime.getTime()) {
      return false;
    }
  }

  return true;
});

const formattedSaleEndDate = computed(() => {
  const dateString = product.value?.saleEndDate;
  if (!dateString) return null;

  try {
    return format(new Date(dateString), 'dd/MM/yyyy HH:mm:ss');
  } catch (e) {
    console.error('Failed to format sale end date:', e);
    return dateString.split('T')[0];
  }
});

const attributesArray = computed(() => {
  const attributesObj = product.value?.attributes;
  if (!attributesObj || typeof attributesObj !== 'object') return [];

  return Object.keys(attributesObj).map((key) => ({
    key: key.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase()),
    value: attributesObj[key]
  }));
});

const handleAddToCart = async (event) => {
  if (product.value) {
    await nextTick();
    const imgElement = document.querySelector('.product-detail-image');
    if (imgElement) {
      animationStore.startAnimation(imgElement, product.value.imageUrl);
    }
    cartStore.addProduct(product.value, 1);
  }
};

onMounted(async () => {
  loadingStore.showLoading();
  loading.value = true;
  try {
    const productId = route.params.id;
    const productData = await getProductByIdApi(productId);
    product.value = productData;

    try {
      const inventoryData = await getInventoryApi(productId);
      stock.value = inventoryData.stock;
    } catch (invError) {
      console.error('Failed to fetch inventory:', invError);
      stock.value = 0;
    }
  } catch (error) {
    console.error('Failed to fetch product details:', error);
  } finally {
    loading.value = false;
    loadingStore.hideLoading();
  }
});
</script>