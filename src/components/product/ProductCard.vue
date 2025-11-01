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
        height="250px"
        cover
        aspect-ratio="1"
      >
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

      <v-card-subtitle class="pb-2">
        {{ author }}
      </v-card-subtitle>

      <v-card-text class="pt-0 pb-3">
        <div class="text-h6 font-weight-bold text-error">
          {{ formatPrice(product.basePrice) }}
        </div>
      </v-card-text>
    </v-card>
  </v-hover>
</template>

<script setup>
import { computed } from 'vue';
import { useRouter } from 'vue-router';

const props = defineProps({
  product: {
    type: Object,
    required: true
  }
});

const router = useRouter();

// NÂNG CẤP: Xử lý 2 cấu trúc dữ liệu khác nhau
const author = computed(() => {
  if (props.product.authorName) {
    return props.product.authorName; // Cấu trúc từ ProductDocument (Search Service)
  }
  if (props.product.author && props.product.author.name) {
    return props.product.author.name; // Cấu trúc từ ProductResponse (Product Service)
  }
  return 'N/A';
});

const productLink = computed(() => ({
  name: 'ProductDetail',
  params: { id: props.product.id }
}));

const formatPrice = (value) => {
  if (!value) return '0 ₫';
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(value);
};

const addToCart = () => {
  console.log('Added to cart:', props.product.id);
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