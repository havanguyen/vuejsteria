<template>
  <v-container class="py-8">
    <v-row justify="center">
      <v-col cols="12" md="10" lg="8">
        <v-btn
          variant="text"
          prepend-icon="mdi-arrow-left"
          :to="{ name: 'Cart' }"
          class="mb-6 font-weight-bold"
        >
          Back to Cart
        </v-btn>

        <v-stepper
          v-model="step"
          :items="['Shipping Address', 'Review & Payment']"
          alt-labels
          class="glass-stepper bg-transparent elevation-0"
        >
          <template v-slot:item.1>
            <v-card class="glass-card mt-4">
              <v-card-title class="text-h5 font-weight-bold pa-6 pb-0 d-flex align-center">
                <v-icon color="primary" class="mr-3">mdi-truck-delivery-outline</v-icon>
                Shipping Details
              </v-card-title>
              
              <v-card-text class="pa-6">
                <v-form @submit.prevent="onStep1Submit">
                  <v-alert
                    v-if="serverError"
                    type="error"
                    variant="tonal"
                    density="compact"
                    class="mb-6"
                    closable
                  >
                    {{ serverError }}
                  </v-alert>

                  <v-row>
                    <v-col cols="12">
                      <v-text-field
                        v-model="stress"
                        :error-messages="stressError"
                        label="Street Address"
                        placeholder="e.g., 17 Dong Ke"
                        variant="outlined"
                        density="comfortable"
                        color="primary"
                        bg-color="rgba(255,255,255,0.5)"
                      ></v-text-field>
                    </v-col>
                    
                    <v-col cols="12" sm="6">
                      <v-text-field
                        v-model="commune"
                        :error-messages="communeError"
                        label="District / Ward"
                        placeholder="e.g., Lien Chieu"
                        variant="outlined"
                        density="comfortable"
                        color="primary"
                        bg-color="rgba(255,255,255,0.5)"
                      ></v-text-field>
                    </v-col>
                    
                    <v-col cols="12" sm="6">
                      <v-text-field
                        v-model="city"
                        :error-messages="cityError"
                        label="City / Province"
                        placeholder="e.g., Da Nang"
                        variant="outlined"
                        density="comfortable"
                        color="primary"
                        bg-color="rgba(255,255,255,0.5)"
                      ></v-text-field>
                    </v-col>

                    <v-col cols="12">
                      <v-text-field
                        v-model="phone"
                        :error-messages="phoneError"
                        label="Phone Number"
                        variant="outlined"
                        density="comfortable"
                        type="tel"
                        prepend-inner-icon="mdi-phone-outline"
                        color="primary"
                        bg-color="rgba(255,255,255,0.5)"
                      ></v-text-field>
                    </v-col>

                    <v-col cols="12">
                      <v-textarea
                        v-model="note"
                        :error-messages="noteError"
                        label="Order Note (Optional)"
                        variant="outlined"
                        density="comfortable"
                        rows="3"
                        color="primary"
                        bg-color="rgba(255,255,255,0.5)"
                        prepend-inner-icon="mdi-note-text-outline"
                      ></v-textarea>
                    </v-col>
                  </v-row>
                </v-form>
              </v-card-text>
            </v-card>
          </template>

          <template v-slot:item.2>
            <v-card class="glass-card mt-4">
              <v-card-title class="text-h5 font-weight-bold pa-6 pb-0 d-flex align-center">
                <v-icon color="primary" class="mr-3">mdi-clipboard-check-outline</v-icon>
                Review Order
              </v-card-title>
              
              <v-card-text class="pa-6">
                <v-row>
                  <v-col cols="12" md="7">
                    <div class="pa-4 rounded-xl bg-surface-variant-lighten fill-height">
                      <h4 class="text-h6 font-weight-bold mb-4 text-primary">
                        Shipping To
                      </h4>
                      <div class="d-flex align-start mb-3">
                        <v-icon class="mr-3 mt-1" color="grey">mdi-map-marker</v-icon>
                        <div>
                          <div class="font-weight-medium">{{ stress }}</div>
                          <div class="text-medium-emphasis">{{ commune }}, {{ city }}</div>
                        </div>
                      </div>
                      <div class="d-flex align-center mb-3">
                        <v-icon class="mr-3" color="grey">mdi-phone</v-icon>
                        <div class="font-weight-medium">{{ phone }}</div>
                      </div>
                      <div class="d-flex align-start">
                        <v-icon class="mr-3 mt-1" color="grey">mdi-message-text</v-icon>
                        <div class="text-medium-emphasis font-italic">{{ note || 'No note provided' }}</div>
                      </div>
                    </div>
                  </v-col>
                  
                  <v-col cols="12" md="5">
                    <div class="pa-4 rounded-xl border-thin fill-height">
                      <h4 class="text-h6 font-weight-bold mb-4">
                        Order Summary
                      </h4>
                      <v-list class="bg-transparent" density="compact">
                        <v-list-item
                          v-for="item in items"
                          :key="item.productResponse.id"
                          class="px-0"
                        >
                          <v-list-item-title class="font-weight-medium">
                            {{ item.productResponse.title }} 
                            <span class="text-grey ml-1">x{{ item.quantity }}</span>
                          </v-list-item-title>
                          <template v-slot:append>
                            <div class="font-weight-bold">
                              {{
                                formatPrice(
                                  (item.productResponse.salePrice ||
                                    item.productResponse.basePrice) *
                                    item.quantity
                                )
                              }}
                            </div>
                          </template>
                        </v-list-item>
                      </v-list>
                      
                      <v-divider class="my-4 border-dashed"></v-divider>
                      
                      <div class="d-flex justify-space-between align-center">
                        <span class="text-h6 font-weight-medium">Total</span>
                        <span class="text-h5 font-weight-bold text-primary">{{
                          formatPrice(totalPrice)
                        }}</span>
                      </div>
                    </div>
                  </v-col>
                </v-row>
              </v-card-text>
            </v-card>
          </template>

          <!-- Navigation Actions -->
          <template v-slot:actions="{ prev, next }">
            <div class="d-flex justify-space-between pa-6 pt-0">
              <v-btn
                variant="text"
                @click="prev"
                :disabled="isSubmitting || step === 1"
                class="px-6"
              >
                Back
              </v-btn>
              
              <v-btn
                v-if="step === 1"
                color="primary"
                rounded="xl"
                size="large"
                elevation="4"
                @click="onStep1Submit"
                class="px-8 font-weight-bold hover-lift"
              >
                Continue to Review
              </v-btn>
              
              <v-btn
                v-if="step === 2"
                color="primary"
                rounded="xl"
                size="large"
                elevation="4"
                @click="onSubmit"
                :loading="isSubmitting"
                :disabled="isSubmitting"
                class="px-8 font-weight-bold hover-lift"
                prepend-icon="mdi-check-all"
              >
                Confirm & Pay
              </v-btn>
            </div>
          </template>
        </v-stepper>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useCartStore } from '@/stores/useCartStore';
import { useNotificationStore } from '@/stores/useNotificationStore';
import { storeToRefs } from 'pinia';
import { useForm, useField } from 'vee-validate';
import { toTypedSchema } from '@vee-validate/zod';
import { shippingSchema } from '@/validations/shippingSchema';
import { checkoutApi } from '@/api/orderApi';
import { useAuthStore } from '@/stores/useAuthStore';

const router = useRouter();
const cartStore = useCartStore();
const authStore = useAuthStore();
const notificationStore = useNotificationStore();
const { user } = storeToRefs(authStore);
const { items, totalPrice, itemCount } = storeToRefs(cartStore);

const serverError = ref(null);
const step = ref(1);

const { handleSubmit, isSubmitting, validate } = useForm({
  validationSchema: toTypedSchema(shippingSchema),
  initialValues: {
    stress: '',
    commune: '',
    city: 'Vietnam',
    phone: '',
    note: ''
  }
});

const { value: stress, errorMessage: stressError } = useField('stress');
const { value: commune, errorMessage: communeError } = useField('commune');
const { value: city, errorMessage: cityError } = useField('city');
const { value: phone, errorMessage: phoneError } = useField('phone');
const { value: note, errorMessage: noteError } = useField('note');

const onStep1Submit = async () => {
  const { valid } = await validate();
  if (valid) {
    step.value = 2;
  } else {
    notificationStore.showError(
      'Please fill out all required shipping fields.'
    );
  }
};

const formatPrice = (value) => {
  if (!value) return '0 ₫';
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(value);
};

const onSubmit = handleSubmit(async (values) => {
  serverError.value = null;
  const payload = {
    shippingAddress: {
      stress: values.stress,
      commune: values.commune,
      city: values.city
    },
    phone: values.phone,
    note: values.note
  };

  Object.keys(payload.shippingAddress).forEach((key) => {
    if (
      !payload.shippingAddress[key] ||
      payload.shippingAddress[key] === ''
    ) {
      delete payload.shippingAddress[key];
    }
  });
  if (payload.note === '') delete payload.note;

  try {
    const response = await checkoutApi(payload);
    const orderId = response.id;
    await cartStore.fetchCart();
    router.push({ name: 'OrderPending', params: { id: orderId } });
  } catch (err) {
    serverError.value =
      err?.message || 'Failed to place order. Please try again.';
    notificationStore.showError(serverError.value);
    step.value = 1;
  }
});

onMounted(() => {
  if (itemCount.value === 0) {
    router.push({ name: 'Cart' });
    notificationStore.showError('Your cart is empty.');
  }
});
</script>

<style scoped>
.glass-stepper {
  background: transparent !important;
}

.glass-card {
  background: rgba(255, 255, 255, 0.85) !important;
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.5);
  border-radius: 24px !important;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1) !important;
}

.bg-surface-variant-lighten {
  background-color: rgba(var(--v-theme-surface-variant), 0.05);
}

.border-thin {
  border: 1px solid rgba(0,0,0,0.1);
}

.border-dashed {
  border-style: dashed !important;
}

.hover-lift {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.hover-lift:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(var(--v-theme-primary), 0.4) !important;
}
</style>