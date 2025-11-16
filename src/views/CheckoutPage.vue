<template>
  <v-container>
    <v-btn
      variant="text"
      prepend-icon="mdi-chevron-left"
      :to="{ name: 'Cart' }"
      class="mb-4"
    >
      Back to Cart
    </v-btn>

    <v-stepper
      v-model="step"
      :items="['Shipping Address', 'Review & Payment']"
      alt-labels
      editable
    >
      <template v-slot:item.1>
        <v-card flat>
          <v-card-title class="text-h6 font-weight-medium text-center">
            Shipping Details
          </v-card-title>
          <v-card-text>
            <v-form @submit.prevent="onStep1Submit">
              <v-row justify="center">
                <v-col cols="12" md="8">
                  <v-alert
                    v-if="serverError"
                    type="error"
                    variant="tonal"
                    density="compact"
                    class="mb-4"
                    closable
                  >
                    {{ serverError }}
                  </v-alert>

                  <v-text-field
                    v-model="stress"
                    :error-messages="stressError"
                    label="Street Address (e.g., 17 Dong Ke)"
                    variant="outlined"
                    density="comfortable"
                    class="mb-3"
                  ></v-text-field>

                  <v-text-field
                    v-model="commune"
                    :error-messages="communeError"
                    label="District / Ward (e.g., Lien Chieu)"
                    variant="outlined"
                    density="comfortable"
                    class="mb-3"
                  ></v-text-field>

                  <v-text-field
                    v-model="city"
                    :error-messages="cityError"
                    label="City / Province (e.g., Da Nang)"
                    variant="outlined"
                    density="comfortable"
                    class="mb-3"
                  ></v-text-field>

                  <v-text-field
                    v-model="phone"
                    :error-messages="phoneError"
                    label="Phone Number"
                    variant="outlined"
                    density="comfortable"
                    type="tel"
                    class="mb-3"
                  ></v-text-field>

                  <v-textarea
                    v-model="note"
                    :error-messages="noteError"
                    label="Order Note (Optional)"
                    variant="outlined"
                    density="comfortable"
                    rows="3"
                  ></v-textarea>
                </v-col>
              </v-row>
            </v-form>
          </v-card-text>
        </v-card>
      </template>

      <template v-slot:item.2>
        <v-card flat>
          <v-card-title class="text-h6 font-weight-medium text-center">
            Review Order
          </v-card-title>
          <v-card-text>
            <v-row>
              <v-col cols="12" md="7">
                <v-card variant="outlined" class="pa-4 mb-4">
                  <h4 class="text-subtitle-1 font-weight-medium mb-3">
                    Shipping To:
                  </h4>
                  <p>{{ stress }}</p>
                  <p>{{ commune }}</p>
                  <p>{{ city }}</p>
                  <p class="mt-2"><b>Phone:</b> {{ phone }}</p>
                  <p><b>Note:</b> {{ note || 'None' }}</p>
                </v-card>
              </v-col>
              <v-col cols="12" md="5">
                <v-card variant="tonal" class="pa-4">
                  <h4 class="text-subtitle-1 font-weight-medium mb-3">
                    Order Summary:
                  </h4>
                  <v-list class="bg-transparent" density="compact">
                    <v-list-item
                      v-for="item in items"
                      :key="item.productResponse.id"
                      class="px-0"
                    >
                      <v-list-item-title class="font-weight-medium">
                        {{ item.productResponse.title }} (x{{ item.quantity }})
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
                  <v-divider class="my-3"></v-divider>
                  <div
                    class="d-flex justify-space-between align-center text-h6"
                  >
                    <span class="font-weight-medium">Total:</span>
                    <span class="font-weight-bold text-primary">{{
                      formatPrice(totalPrice)
                    }}</span>
                  </div>
                </v-card>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </template>

      <template v-slot:actions="{ prev, next }">
        <v-card-actions class="pa-4">
          <v-btn
            variant="text"
            @click="prev"
            :disabled="isSubmitting || step === 1"
          >
            Back
          </v-btn>
          <v-spacer></v-spacer>
          <v-btn
            v-if="step === 1"
            color="primary"
            variant="flat"
            @click="onStep1Submit"
          >
            Continue to Review
          </v-btn>
          <v-btn
            v-if="step === 2"
            color="primary"
            variant="flat"
            size="large"
            @click="onSubmit"
            :loading="isSubmitting"
            :disabled="isSubmitting"
          >
            Confirm & Proceed to Payment
          </v-btn>
        </v-card-actions>
      </template>
    </v-stepper>
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