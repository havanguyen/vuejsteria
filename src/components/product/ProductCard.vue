<template>
  <v-hover v-slot="{ isHovering, props }">
    <v-card
      v-bind="props"
      :elevation="isHovering ? 12 : 2"
      class="product-card"
      :to="productLink"
    >
      <v-img
        :src="product.imageUrl || 'https://via.placeholder.com/300'"
        aspect-ratio="0.75"
        cover
      >
        <v-chip
          v-if="isSelling"
          color="red-lighten-1"
          size="small"
          variant="flat"
          class="ma-2 font-weight-bold"
          style="position: absolute; top: 0; right: 0; z-index: 10"
        >
          SALE
        </v-chip>
        <v-fade-transition>
          <div
            v-if="isHovering"
            class="d-flex align-center justify-center fill-height"
            style="background: rgba(0, 0, 0, 0.4)"
          >
            <v-btn
              color="primary"
              variant="flat"
              prepend-icon="mdi-cart-plus"
              @click.prevent="addToCart"
            >
              Thêm vào giỏ
            </v-btn>
          </div>
        </v-fade-transition>
      </v-img>

      <v-card-title class="text-subtitle-1 font-weight-bold pb-1">
        {{ product.title }}
      </v-card-title>

      <v-card-subtitle v-if="author" class="pb-2">
        {{ author }}
      </v-card-subtitle>

      <v-card-text class="pt-0 pb-3">
        <div v-if="isSelling" class="d-flex align-baseline">
          <div class="text-h6 font-weight-bold text-error me-2">
            {{ formatPrice(product.salePrice) }}
          </div>
          <div
            class="text-caption text-grey"
            style="text-decoration: line-through"
          >
            {{ formatPrice(product.basePrice) }}
          </div>
        </div>
        <div v-else class="text-h6 font-weight-bold text-error">
          {{ formatPrice(product.basePrice) }}
        </div>
      </v-card-text>
    </v-card>
  </v-hover>
</template>

<script setup>
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { useCartStore } from '@/stores/useCartStore';

const props = defineProps({
  product: {
    type: Object,
    required: true
  }
});

const router = useRouter();
const cartStore = useCartStore();

const author = computed(() => {
  if (props.product.authorName) {
    return props.product.authorName;
  }
  if (props.product.author && props.product.author.name) {
    return props.product.author.name;
  }
  return null;
});

const productLink = computed(() => ({
  name: 'ProductDetail',
  params: { id: props.product.id }
}));

const isSelling = computed(() => {
  const productData = props.product;
  if (
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

  if (productData.saleStartDate) {
    const saleStartTime = new Date(productData.saleStartDate);
    const currentTime = new Date();
    if (currentTime.getTime() < saleStartTime.getTime()) {
      return false;
    }
  }

  return true;
});

const formatPrice = (value) => {
  if (!value) return '0 ₫';
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(value);
};

const addToCart = async () => {
  await cartStore.addProduct(props.product.id, 1);
};
</script>

<style>
.product-card {
  transition: all 0.2s ease-in-out !important;
}
.product-card .v-card-title {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>