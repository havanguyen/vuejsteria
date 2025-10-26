<script setup>
import { ref } from 'vue';
import { useRouter, useRoute, RouterLink } from 'vue-router';
import { useForm, useField } from 'vee-validate';
import { toTypedSchema } from '@vee-validate/zod';
import { loginSchema } from '@/validations/authSchema';
import { loginApi } from '@/api/authApi';
import { useAuthStore } from '@/stores/useAuthStore';

const authStore = useAuthStore();
const router = useRouter();
const route = useRoute();

const serverError = ref(null);
const isSubmitting = ref(false);

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
    const authData = await loginApi(values);
    authStore.login(authData);
    
    const redirectPath = route.query.redirect || '/';
    router.push(redirectPath);

  } catch (err) {
    console.error('Login failed:', err);
    serverError.value = err?.title || err?.message || 'Login failed. Please check your credentials.';
  } finally {
    isSubmitting.value = false;
  }
});
</script>

<template>
  <v-container class="fill-height">
    <v-row align="center" justify="center">
      <v-col cols="12" sm="8" md="5" lg="4">
        <v-card class="pa-4 pa-md-8">
          <v-card-title class="text-center text-h5 font-weight-medium mb-4">
            <v-avatar color="secondary" class="mb-4">
              <v-icon icon="mdi-lock" />
            </v-avatar>
            <div>Sign in to Bookteria</div>
          </v-card-title>

          <v-card-text>
            <v-alert
              v-if="serverError"
              type="error"
              variant="tonal"
              density="compact"
              class="mb-4"
            >
              {{ serverError }}
            </v-alert>

            <v-form @submit.prevent="onSubmit">
              <v-text-field
                v-model="username"
                label="Username"
                prepend-inner-icon="mdi-account"
                :error-messages="errors.username"
                :disabled="isSubmitting"
                class="mb-2"
              />
              <v-text-field
                v-model="password"
                label="Password"
                type="password"
                prepend-inner-icon="mdi-lock"
                :error-messages="errors.password"
                :disabled="isSubmitting"
                class="mb-2"
              />
              <v-btn
                type="submit"
                block
                color="primary"
                size="large"
                :loading="isSubmitting"
                :disabled="isSubmitting"
                class="mt-4"
              >
                Sign In
              </v-btn>
            </v-form>
          </v-card-text>
          
          <v-card-actions class="d-flex justify-space-between px-4 pb-4">
             <router-link to="#" class="text-body-2 text-decoration-none">
                Forgot password?
             </router-link>
             <router-link :to="{ name: 'Register' }" class="text-body-2 text-decoration-none">
                Don't have an account? Sign Up
             </router-link>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>