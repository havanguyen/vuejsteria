<template>
  <v-container class="py-8">
    <h1 class="text-h4 font-weight-bold mb-6 d-flex align-center">
      <v-icon class="mr-3" color="primary">mdi-cart-outline</v-icon>
      My Cart
    </h1>

    <v-skeleton-loader
      v-if="isLoading && items.length === 0"
      type="list-item-avatar-three-line@4"
      class="bg-transparent"
    ></v-skeleton-loader>

    <v-alert 
      v-else-if="itemCount === 0" 
      type="info" 
      variant="tonal" 
      class="glass-card"
      icon="mdi-cart-off"
    >
      <div class="text-h6 font-weight-medium">Your cart is empty</div>
      <div class="mb-4">Looks like you haven't added anything to your cart yet.</div>
      <v-btn :to="{ name: 'Home' }" color="primary" prepend-icon="mdi-shopping">
        Start Shopping
      </v-btn>
    </v-alert>

    <v-row v-else>
      <v-col cols="12" md="8">
        <v-card class="glass-card pa-0 overflow-hidden">
          <v-list lines="three" class="bg-transparent pa-2">
            <template v-for="(item, index) in items" :key="item.id">
              <v-list-item class="cart-item rounded-lg mb-2 pa-4">
                <template v-slot:prepend>
                  <v-avatar rounded="lg" size="100" class="mr-6 elevation-2">
                    <v-img
                      :src="
                        item.productResponse.imageUrl ||
                        'https://via.placeholder.com/150'
                      "
                      cover
                    ></v-img>
                  </v-avatar>
                </template>

                <v-list-item-title class="text-h6 font-weight-bold mb-2 text-primary">
                  {{ item.productResponse.title }}
                </v-list-item-title>
                
                <v-list-item-subtitle>
                  <div class="d-flex align-center flex-wrap gap-4 mt-2">
                    <div class="d-flex align-center quantity-control rounded-pill bg-surface-variant-lighten px-2">
                      <v-btn
                        icon="mdi-minus"
                        variant="text"
                        density="compact"
                        size="small"
                        @click="updateQuantity(item.productResponse.id, item.quantity - 1, item.stock)"
                        :disabled="item.quantity <= 1 || loadingStates[item.productResponse.id]"
                      ></v-btn>
                      
                      <input 
                        type="number" 
                        class="quantity-input text-center font-weight-bold mx-2"
                        :value="item.quantity"
                        @input="(e) => updateQuantity(item.productResponse.id, e.target.value, item.stock)"
                        style="width: 40px; border: none; outline: none; background: transparent;"
                      >
                      
                      <v-btn
                        icon="mdi-plus"
                        variant="text"
                        density="compact"
                        size="small"
                        @click="updateQuantity(item.productResponse.id, item.quantity + 1, item.stock)"
                        :disabled="item.quantity >= item.stock || loadingStates[item.productResponse.id]"
                      ></v-btn>
                    </div>

                    <v-chip
                      v-if="item.stock !== null && item.stock !== undefined"
                      size="small"
                      :color="item.stock < 10 ? 'warning' : 'success'"
                      variant="tonal"
                      class="font-weight-medium"
                    >
                      In stock: {{ item.stock }}
                    </v-chip>
                  </div>
                </v-list-item-subtitle>

                <template v-slot:append>
                  <div class="text-right d-flex flex-column align-end justify-space-between fill-height">
                    <div class="text-h6 font-weight-bold text-primary mb-2">
                      {{
                        formatPrice(
                          item.productResponse.salePrice ||
                            item.productResponse.basePrice
                        )
                      }}
                    </div>
                    <v-btn
                      icon="mdi-delete-outline"
                      variant="text"
                      color="error"
                      class="hover-scale"
                      @click="cartStore.removeProduct(item.productResponse.id)"
                      :disabled="isLoading"
                    ></v-btn>
                  </div>
                </template>
              </v-list-item>
              <v-divider v-if="index < items.length - 1" class="mx-4 opacity-20"></v-divider>
            </template>
          </v-list>
          
          <v-divider class="opacity-20"></v-divider>
          
          <v-card-actions class="pa-4 bg-surface-variant-lighten">
            <v-spacer></v-spacer>
            <v-btn
              variant="text"
              color="error"
              prepend-icon="mdi-delete-sweep"
              @click="cartStore.clearCart"
              :disabled="isLoading"
              class="font-weight-medium"
            >
              Clear Cart
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>

      <v-col cols="12" md="4">
        <v-card class="glass-card pa-6 sticky-summary">
          <v-card-title class="text-h5 font-weight-bold mb-4 px-0">
            Order Summary
          </v-card-title>
          
          <v-list class="bg-transparent px-0">
            <v-list-item class="px-0">
              <v-list-item-title class="text-body-1">Subtotal ({{ itemCount }} items)</v-list-item-title>
              <template v-slot:append>
                <div class="font-weight-bold">{{ formatPrice(totalPrice) }}</div>
              </template>
            </v-list-item>
            
            <v-list-item class="px-0">
              <v-list-item-title class="text-body-1">Shipping</v-list-item-title>
              <template v-slot:append>
                <div class="text-success font-weight-bold">Free</div>
              </template>
            </v-list-item>
          </v-list>
          
          <v-divider class="my-4 opacity-20"></v-divider>
          
          <div class="d-flex justify-space-between align-center mb-6">
            <span class="text-h6 font-weight-medium">Total</span>
            <span class="text-h4 font-weight-bold text-primary">{{ formatPrice(totalPrice) }}</span>
          </div>
          
          <v-btn
            color="primary"
            block
            size="x-large"
            rounded="xl"
            elevation="4"
            :to="{ name: 'Checkout' }"
            :disabled="isLoading || itemCount === 0"
            class="font-weight-bold hover-lift"
            prepend-icon="mdi-check-decagram"
          >
            Proceed to Checkout
          </v-btn>
          
          <div class="text-caption text-center text-medium-emphasis mt-4">
            <v-icon size="small" class="mr-1">mdi-shield-check</v-icon>
            Secure Checkout
          </div>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { useCartStore } from '@/stores/useCartStore';
import { storeToRefs } from 'pinia';
import { useRouter } from 'vue-router';
import { ref, reactive } from 'vue';

const cartStore = useCartStore();
const router = useRouter();
const { items, isLoading, itemCount, totalPrice } = storeToRefs(cartStore);

const loadingStates = reactive({});
let debounceTimer = null;

const formatPrice = (value) => {
  if (!value) return '0 ₫';
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(value);
};

const updateQuantity = (bookId, value, stock) => {
  let newQuantity = parseInt(value, 10);
  if (isNaN(newQuantity) || newQuantity < 1) {
    newQuantity = 1;
  }
  if (stock !== null && stock !== undefined && newQuantity > stock) {
    newQuantity = stock;
  }

  loadingStates[bookId] = true;

  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(async () => {
    await cartStore.updateProductQuantity(bookId, newQuantity);
    loadingStates[bookId] = false;
  }, 750);
};
</script>

<style scoped>
.glass-card {
  background: rgba(255, 255, 255, 0.85) !important;
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.5);
  border-radius: 24px !important;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1) !important;
}

.cart-item {
  transition: background-color 0.2s ease;
}

.cart-item:hover {
  background-color: rgba(var(--v-theme-primary), 0.05);
}

.bg-surface-variant-lighten {
  background-color: rgba(var(--v-theme-surface-variant), 0.05);
}

.quantity-control {
  border: 1px solid rgba(0,0,0,0.1);
}

/* Chrome, Safari, Edge, Opera */
.quantity-input::-webkit-outer-spin-button,
.quantity-input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

/* Firefox */
.quantity-input {
  -moz-appearance: textfield;
  appearance: textfield;
}

.sticky-summary {
  position: sticky;
  top: 100px;
}

.hover-lift {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.hover-lift:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(var(--v-theme-primary), 0.4) !important;
}

.hover-scale:hover {
  transform: scale(1.1);
}

.opacity-20 {
  opacity: 0.2;
}

.gap-4 {
  gap: 16px;
}
</style>