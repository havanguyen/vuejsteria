<template>
  <v-container class="fill-height">
    <v-row align="center" justify="center">
      <v-col cols="12" sm="8" md="5" lg="4">
        <v-hover v-slot="{ isHovering, props }">
          <v-card
            v-bind="props"
            class="pa-4 pa-md-8 auth-card"
            :elevation="isHovering ? 16 : 4"
            :class="{ 'on-hover': isHovering }"
          >
            <v-card-title class="text-center text-h5 font-weight-bold mb-6">
              <v-avatar color="transparent" size="80" class="mb-4">
                <v-icon icon="mdi-lock" color="primary" size="48" />
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
                  variant="flat"
                  size="large"
                  :loading="isSubmitting"
                  :disabled="isSubmitting"
                  class="mt-6 hover-lift"
                >
                  Sign In
                </v-btn>
              </v-form>
            </v-card-text>

            <div class="px-4 pb-2">
              <v-btn
                block
                variant="outlined"
                color="error"
                prepend-icon="mdi-google"
                @click="authStore.loginWithGoogle()"
                class="mb-2 hover-lift"
              >
                Sign in with Google
              </v-btn>
            </div>

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
        </v-hover>
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
    password: '',
  },
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
    notificationStore.showSuccess('Login successful!');
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

<style>
.auth-card {
  transition:
    all 0.25s ease-in-out !important;
}
.auth-card.on-hover {
  transform: scale(1.02);
}
.hover-lift {
  transition:
    all 0.2s ease-out !important;
}
.hover-lift:hover {
  transform: translateY(-2px);
  box-shadow: 0px 6px 15px rgba(0, 0, 0, 0.2) !important;
}
</style>