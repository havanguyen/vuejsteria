<template>
  <v-container class="fill-height">
    <v-row align="center" justify="center">
      <v-col cols="12" sm="8" md="5" lg="4">
        <v-card class="pa-4 pa-md-8 elevation-2">
          <v-card-title class="text-center text-h5 font-weight-bold mb-6">
            <v-avatar color="secondary" size="large" class="mb-4">
              <v-icon icon="mdi-lock" />
            </v-avatar>
            <div>Sign in to Bookteria</div>
          </v-card-title>

          <v-card-text>
            <v-slide-y-transition>
              <v-alert
                v-if="serverError"
                type="error"
                variant="tonal"
                density="compact"
                class="mb-4"
              >
                {{ serverError }}
              </v-alert>
            </v-slide-y-transition>

            <v-form @submit.prevent="onSubmit">
              <v-text-field
                v-model="username"
                label="Username"
                prepend-inner-icon="mdi-account"
                :error-messages="errors.username"
                :disabled="isSubmitting"
                class="mb-3"
                variant="outlined"
                density="comfortable"
              />
              <v-text-field
                v-model="password"
                label="Password"
                :type="showPassword ? 'text' : 'password'"
                prepend-inner-icon="mdi-lock-outline"
                :append-inner-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
                @click:append-inner="showPassword = !showPassword"
                :error-messages="errors.password"
                :disabled="isSubmitting"
                class="mb-3"
                variant="outlined"
                density="comfortable"
              />
              <v-btn
                type="submit"
                block
                color="primary"
                size="large"
                :loading="isSubmitting"
                :disabled="isSubmitting"
                class="mt-6"
              >
                Sign In
              </v-btn>
            </v-form>
          </v-card-text>

          <v-divider class="my-3"></v-divider>

          <v-card-actions class="d-flex flex-column align-center px-4 pb-4">
            <router-link
              :to="{ name: 'Register' }"
              class="text-body-2 text-decoration-none mb-2"
            >
              Don't have an account? Sign Up
            </router-link>
            <router-link
              to="#"
              class="text-caption text-decoration-none text-grey"
            >
              Forgot password?
            </router-link>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter, useRoute, RouterLink } from 'vue-router';
import { useForm, useField } from 'vee-validate';
import { toTypedSchema } from '@vee-validate/zod';
import { loginSchema } from '@/validations/authSchema';
import { useAuthStore } from '@/stores/useAuthStore';
import { useNotificationStore } from '@/stores/useNotificationStore';

const authStore = useAuthStore();
const notificationStore = useNotificationStore();
const router = useRouter();
const route = useRoute();

const serverError = ref(null);
const isSubmitting = ref(false);
const showPassword = ref(false);

const { handleSubmit, errors } = useForm({
  validationSchema: toTypedSchema(loginSchema),
  initialValues: {
    username: '',
    password: ''
  }
});

const { value: username } = useField('username');
const { value: password } = useField('password');

const onSubmit = handleSubmit(async (values) => {
  serverError.value = null;
  isSubmitting.value = true;
  try {
    await authStore.login(values);

    const redirectPath = route.query.redirect || '/';
    router.push(redirectPath);
    notificationStore.showSuccess('Đăng nhập thành công!');
  } catch (err) {
    serverError.value =
      err?.title ||
      err?.message ||
      'Login failed. Please check your credentials.';
  } finally {
    isSubmitting.value = false;
  }
});
</script>