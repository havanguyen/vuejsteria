<template>
  <v-container>
    <h1 class="text-h4 font-weight-bold mb-6">My Cart</h1>

    <v-skeleton-loader
      v-if="isLoading && items.length === 0"
      type="list-item-avatar-three-line@4"
    ></v-skeleton-loader>

    <v-alert v-else-if="itemCount === 0" type="info" variant="tonal">
      Your cart is empty.
      <v-btn :to="{ name: 'Home' }" color="primary" variant="text" class="ml-2"
        >Start Shopping</v-btn
      >
    </v-alert>

    <v-row v-else>
      <v-col cols="12" md="8">
        <v-card variant="outlined" class="pa-0">
          <v-list lines="three">
            <template v-for="(item, index) in items" :key="item.id">
              <v-list-item>
                <template v-slot:prepend>
                  <v-avatar rounded="lg" size="80" class="mr-4">
                    <v-img
                      :src="
                        item.productResponse.thumbnail ||
                        'https://via.placeholder.com/150'
                      "
                    ></v-img>
                  </v-avatar>
                </template>

                <v-list-item-title class="font-weight-bold mb-1">{{
                  item.productResponse.name
                }}</v-list-item-title>
                <v-list-item-subtitle class="d-flex align-center">
                  <span class="text-body-2 me-4">Quantity:</span>
                  <v-text-field
                    :model-value="item.quantity"
                    @update:modelValue="
                      (val) => updateQuantity(item.productResponse.id, val, item.stock)
                    "
                    type="number"
                    density="compact"
                    variant="outlined"
                    hide-details
                    style="max-width: 100px"
                    :min="1"
                    :max="item.stock"
                    :loading="loadingStates[item.productResponse.id]"
                  ></v-text-field>
                  <span class="text-caption text-grey ml-2"
                    >In stock: {{ item.stock }}</span
                  >
                </v-list-item-subtitle>

                <template v-slot:append>
                  <div class="text-right">
                    <div class="font-weight-bold text-subtitle-1 mb-2">
                      {{
                        formatPrice(
                          item.productResponse.salePrice ||
                            item.productResponse.basePrice
                        )
                      }}
                    </div>
                    <v-btn
                      icon="mdi-delete"
                      variant="text"
                      color="grey"
                      size="small"
                      @click="cartStore.removeProduct(item.productResponse.id)"
                      :disabled="isLoading"
                    ></v-btn>
                  </div>
                </template>
              </v-list-item>
              <v-divider v-if="index < items.length - 1"></v-divider>
            </template>
          </v-list>
          <v-divider></v-divider>
          <v-card-actions class="pa-4">
            <v-spacer></v-spacer>
            <v-btn
              variant="text"
              color="error"
              @click="cartStore.clearCart"
              :disabled="isLoading"
            >
              Clear Cart
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>

      <v-col cols="12" md="4">
        <v-card class="pa-4" style="position: sticky; top: 80px">
          <v-card-title class="text-h6 font-weight-medium">
            Order Summary
          </v-card-title>
          <v-card-text>
            <v-list class="bg-transparent">
              <v-list-item>
                <v-list-item-title
                  >Subtotal ({{ itemCount }} items)</v-list-item-title
                >
                <template v-slot:append>
                  <div class="font-weight-bold">
                    {{ formatPrice(totalPrice) }}
                  </div>
                </template>
              </v-list-item>
              <v-list-item>
                <v-list-item-title>Shipping</v-list-item-title>
                <template v-slot:append>
                  <div class="font-weight-bold">Free</div>
                </template>
              </v-list-item>
            </v-list>
            <v-divider class="my-3"></v-divider>
            <div
              class="d-flex justify-space-between align-center text-h5 mb-4"
            >
              <span class="font-weight-medium">Total:</span>
              <span class="font-weight-bold text-primary">{{
                formatPrice(totalPrice)
              }}</span>
            </div>
            <v-btn
              color="primary"
              block
              size="large"
              variant="flat"
              :to="{ name: 'Checkout' }"
              :disabled="isLoading || itemCount === 0"
            >
              Proceed to Checkout
            </v-btn>
          </v-card-text>
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

const updateQuantity = (productId, value, stock) => {
  let newQuantity = parseInt(value, 10);
  if (isNaN(newQuantity) || newQuantity < 1) {
    newQuantity = 1;
  }
  if (newQuantity > stock) {
    newQuantity = stock;
  }

  loadingStates[productId] = true;

  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(async () => {
    await cartStore.addProduct(productId, newQuantity);
    loadingStates[productId] = false;
  }, 750);
};
</script>