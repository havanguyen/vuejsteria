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

    <h1 class="text-h4 font-weight-bold mb-6">Checkout</h1>

    <v-row>
      <v-col cols="12" md="7" order="1" order-md="1">
        <v-card class="pa-4 pa-md-6">
          <v-card-title class="text-h6 font-weight-medium">
            Shipping Details
          </v-card-title>
          <v-card-text>
            <v-form @submit.prevent="onSubmit">
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

              <v-row>
                <v-col cols="12">
                  <v-text-field
                    v-model="stress.value.value"
                    :error-messages="stress.errorMessage.value"
                    label="Street Address (Số nhà, tên đường)"
                    variant="outlined"
                    density="comfortable"
                  ></v-text-field>
                </v-col>
                <v-col cols="12" sm="6">
                  <v-text-field
                    v-model="commune.value.value"
                    :error-messages="commune.errorMessage.value"
                    label="District / Ward (Quận/Huyện, Phường/Xã)"
                    variant="outlined"
                    density="comfortable"
                  ></v-text-field>
                </v-col>
                <v-col cols="12" sm="6">
                  <v-text-field
                    v-model="city.value.value"
                    :error-messages="city.errorMessage.value"
                    label="City / Province (Tỉnh/Thành phố)"
                    variant="outlined"
                    density="comfortable"
                  ></v-text-field>
                </v-col>

                <v-col cols="12">
                  <v-text-field
                    v-model="phone.value.value"
                    :error-messages="phone.errorMessage.value"
                    label="Phone Number"
                    variant="outlined"
                    density="comfortable"
                    type="tel"
                  ></v-text-field>
                </v-col>
                <v-col cols="12">
                  <v-textarea
                    v-model="note.value.value"
                    :error-messages="note.errorMessage.value"
                    label="Order Note (Optional)"
                    variant="outlined"
                    density="comfortable"
                    rows="3"
                  ></v-textarea>
                </v-col>
              </v-row>

              <v-btn
                type="submit"
                color="primary"
                variant="flat"
                size="large"
                block
                :loading="isSubmitting"
                :disabled="isSubmitting"
              >
                Place Order & Proceed to Payment
              </v-btn>
            </v-form>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" md="5" order="2" order-md="2">
        <v-card
          class="pa-4"
          style="position: sticky; top: 80px"
          variant="outlined"
        >
          <v-card-title class="text-h6 font-weight-medium">
            Order Summary
          </v-card-title>
          <v-card-text>
            <v-list class="bg-transparent" lines="two">
              <v-list-item
                v-for="item in items"
                :key="item.productResponse.id"
              >
                <template v-slot:prepend>
                  <v-avatar rounded="lg" size="60" class="mr-4">
                    <v-img
                      :src="
                        item.productResponse.imageUrl ||
                        'https://via.placeholder.com/150'
                      "
                    ></v-img>
                  </v-avatar>
                </template>

                <v-list-item-title class="font-weight-medium">{{
                  item.productResponse.title
                }}</v-list-item-title>
                <v-list-item-subtitle
                  >Qty: {{ item.quantity }}
                </v-list-item-subtitle>

                <template v-slot:append>
                  <div class="font-weight-bold text-body-1">
                    {{
                      formatPrice(
                        (item.productResponse.salePrice ||
                          item.productResponse.basePrice) * item.quantity
                      )
                    }}
                  </div>
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
          </v-card-text>
        </v-card>
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

const { handleSubmit, errors, isSubmitting } = useForm({
  validationSchema: toTypedSchema(shippingSchema),
  initialValues: {
    stress: '',
    commune: '',
    city: 'Đà Nẵng',
    phone: '',
    note: ''
  }
});

const { value: stress } = useField('stress');
const { value: commune } = useField('commune');
const { value: city } = useField('city');
const { value: phone } = useField('phone');
const { value: note } = useField('note');

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
      // Lưu ý: 'phone' được gửi ở root theo schema,
      // API checkout mới của bạn dường như không nhận 'phone' trong 'shippingAddress'
      // Hãy đảm bảo backend xử lý 'phone' nếu cần, hoặc xóa nó khỏi đây và schema
    },
    phone: values.phone, // Gửi ở root nếu backend hỗ trợ
    note: values.note
  };

  // Lọc ra các trường rỗng khỏi shippingAddress nếu cần
  Object.keys(payload.shippingAddress).forEach((key) => {
    if (
      !payload.shippingAddress[key] ||
      payload.shippingAddress[key] === ''
    ) {
      delete payload.shippingAddress[key];
    }
  });

  try {
    const response = await checkoutApi(payload);
    const orderId = response.id;
    await cartStore.fetchCart();
    router.push({ name: 'OrderPending', params: { id: orderId } });
  } catch (err) {
    serverError.value =
      err?.message || 'Failed to place order. Please try again.';
    notificationStore.showError(serverError.value);
  }
});

onMounted(() => {
  if (itemCount.value === 0) {
    router.push({ name: 'Cart' });
    notificationStore.showError('Your cart is empty.');
  }
});
</script>