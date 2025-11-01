<template>
  <v-container class="fill-height" fluid>
    <v-row align="center" justify="center">
      <v-col cols="12" sm="8" md="6" lg="4">
        <v-card class="elevation-12 pa-4 pa-md-6">
          <v-card-title class="text-center text-h5 font-weight-bold mb-6">
            <v-avatar color="secondary" size="large" class="mb-4">
              <v-icon icon="mdi-account-plus" />
            </v-avatar>
            <div>Create Your Account</div>
          </v-card-title>

          <v-card-text>
            <v-form @submit.prevent="onSubmit">
              <v-slide-y-transition>
                <v-alert
                  v-if="errorMessage"
                  type="error"
                  variant="tonal"
                  density="compact"
                  class="mb-4"
                  closable
                  @click:close="errorMessage = ''"
                >
                  {{ errorMessage }}
                </v-alert>
              </v-slide-y-transition>

              <v-row>
                <v-col cols="12" sm="6">
                  <v-text-field
                    v-model="firstName.value.value"
                    :error-messages="firstName.errorMessage.value"
                    label="First Name"
                    variant="outlined"
                    density="comfortable"
                    class="mb-3"
                  ></v-text-field>
                </v-col>
                <v-col cols="12" sm="6">
                  <v-text-field
                    v-model="lastName.value.value"
                    :error-messages="lastName.errorMessage.value"
                    label="Last Name"
                    variant="outlined"
                    density="comfortable"
                    class="mb-3"
                  ></v-text-field>
                </v-col>
              </v-row>

              <v-text-field
                v-model="email.value.value"
                :error-messages="email.errorMessage.value"
                label="Email"
                prepend-inner-icon="mdi-email"
                type="email"
                variant="outlined"
                density="comfortable"
                class="mb-3"
              ></v-text-field>

              <v-text-field
                v-model="username.value.value"
                :error-messages="username.errorMessage.value"
                label="Username"
                prepend-inner-icon="mdi-account"
                type="text"
                variant="outlined"
                density="comfortable"
                class="mb-3"
              ></v-text-field>

              <v-text-field
                v-model="password.value.value"
                :error-messages="password.errorMessage.value"
                label="Password"
                prepend-inner-icon="mdi-lock"
                type="password"
                variant="outlined"
                density="comfortable"
                class="mb-3"
              ></v-text-field>

              <v-text-field
                v-model="confirmPassword.value.value"
                :error-messages="confirmPassword.errorMessage.value"
                label="Confirm Password"
                prepend-inner-icon="mdi-lock-check"
                type="password"
                variant="outlined"
                density="comfortable"
                class="mb-3"
              ></v-text-field>

              <v-row>
                <v-col cols="12" sm="7">
                  <v-text-field
                    v-model="dob.value.value"
                    :error-messages="dob.errorMessage.value"
                    label="Date of Birth"
                    type="date"
                    variant="outlined"
                    density="comfortable"
                    class="mb-3"
                  ></v-text-field>
                </v-col>
                <v-col cols="12" sm="5">
                  <v-text-field
                    v-model="city.value.value"
                    :error-messages="city.errorMessage.value"
                    label="City (Optional)"
                    variant="outlined"
                    density="comfortable"
                    class="mb-3"
                  ></v-text-field>
                </v-col>
              </v-row>

              <v-btn
                type="submit"
                color="primary"
                block
                size="large"
                :loading="isLoading"
                :disabled="isLoading"
                class="mt-4"
              >
                Sign Up
              </v-btn>
            </v-form>
          </v-card-text>
          <v-divider class="my-3"></v-divider>
          <v-card-actions class="justify-center pa-4">
            <router-link to="/login" class="text-body-2 text-decoration-none"
              >Already have an account? Sign In</router-link
            >
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useField, useForm } from 'vee-validate';
import { toTypedSchema } from '@vee-validate/zod'; // Đảm bảo dùng zod
import { registerSchema } from '@/validations/authSchema';
import { registerApi } from '@/api/authApi'; // Import API trực tiếp
import { useNotificationStore } from '@/stores/useNotificationStore';

const isLoading = ref(false);
const errorMessage = ref('');

const router = useRouter();
const notificationStore = useNotificationStore();

const { handleSubmit } = useForm({
  validationSchema: toTypedSchema(registerSchema) // Dùng Zod
});

// SỬA LỖI: Thêm các trường (fields) bị thiếu
const username = useField('username');
const email = useField('email');
const password = useField('password');
const confirmPassword = useField('confirmPassword');
const firstName = useField('firstName');
const lastName = useField('lastName');
const dob = useField('dob');
const city = useField('city');

const onSubmit = handleSubmit(async (values) => {
  isLoading.value = true;
  errorMessage.value = '';
  try {
    await registerApi(values); // Không cần dùng store
    notificationStore.showSuccess('Registration successful! Please log in.');
    router.push('/login');
  } catch (error) {
    const apiError = error?.message || 'An unknown error occurred';
    errorMessage.value = apiError;
  } finally {
    isLoading.value = false;
  }
});
</script>