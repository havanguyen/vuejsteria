<script setup>
import { ref } from 'vue';
import { useRouter, RouterLink } from 'vue-router';
import { useForm, useField } from 'vee-validate';
import { toTypedSchema } from '@vee-validate/zod';
import { registerSchema } from '@/validations/authSchema';
import { registerApi } from '@/api/authApi';
import { useAuthStore } from '@/stores/useAuthStore';

const authStore = useAuthStore();
const router = useRouter();

const serverError = ref(null);
const serverSuccess = ref(null);
const isSubmitting = ref(false);

const { handleSubmit, errors } = useForm({
  validationSchema: toTypedSchema(registerSchema),
  initialValues: {
    username: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    dob: '',
    city: '',
  },
});

const { value: username } = useField('username');
const { value: password } = useField('password');
const { value: confirmPassword } = useField('confirmPassword');
const { value: firstName } = useField('firstName');
const { value: lastName } = useField('lastName');
const { value: dob } = useField('dob');
const { value: city } = useField('city');

const onSubmit = handleSubmit(async (values) => {
  serverError.value = null;
  serverSuccess.value = null;
  isSubmitting.value = true;
  try {
    const { confirmPassword, ...userData } = values;
    await registerApi(userData);
    serverSuccess.value = 'Registration successful! Please log in.';

    setTimeout(() => {
        router.push({ name: 'Login' });
    }, 2000);

  } catch (err) {
    console.error('Registration failed:', err);
    serverError.value = err?.title || err?.message || 'Registration failed. Please try again.';
  } finally {
    isSubmitting.value = false;
  }
});
</script>

<template>
  <v-container class="fill-height">
    <v-row align="center" justify="center">
      <v-col cols="12" sm="10" md="8" lg="6">
        <v-card class="pa-4 pa-md-8">
          <v-card-title class="text-center text-h5 font-weight-medium mb-4">
             <v-avatar color="primary" class="mb-4">
              <v-icon icon="mdi-account-plus" />
            </v-avatar>
            <div>Create your Bookteria Account</div>
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
             <v-alert
              v-if="serverSuccess"
              type="success"
              variant="tonal"
              density="compact"
              class="mb-4"
            >
              {{ serverSuccess }}
            </v-alert>

            <v-form @submit.prevent="onSubmit">
              <v-row>
                 <v-col cols="12" md="6">
                    <v-text-field
                      v-model="firstName"
                      label="First Name"
                      prepend-inner-icon="mdi-account-outline"
                      :error-messages="errors.firstName"
                      :disabled="isSubmitting"
                      class="mb-2"
                    />
                 </v-col>
                 <v-col cols="12" md="6">
                    <v-text-field
                      v-model="lastName"
                      label="Last Name"
                      prepend-inner-icon="mdi-account-outline"
                      :error-messages="errors.lastName"
                      :disabled="isSubmitting"
                      class="mb-2"
                    />
                 </v-col>
                 <v-col cols="12">
                   <v-text-field
                      v-model="username"
                      label="Username"
                      prepend-inner-icon="mdi-account"
                      :error-messages="errors.username"
                      :disabled="isSubmitting"
                      class="mb-2"
                    />
                 </v-col>
                 <v-col cols="12">
                    <v-text-field
                      v-model="password"
                      label="Password"
                      type="password"
                      prepend-inner-icon="mdi-lock-outline"
                      :error-messages="errors.password"
                      :disabled="isSubmitting"
                      class="mb-2"
                    />
                 </v-col>
                 <v-col cols="12">
                    <v-text-field
                      v-model="confirmPassword"
                      label="Confirm Password"
                      type="password"
                      prepend-inner-icon="mdi-lock-check-outline"
                      :error-messages="errors.confirmPassword"
                      :disabled="isSubmitting"
                      class="mb-2"
                    />
                 </v-col>
                 <v-col cols="12" md="6">
                    <v-text-field
                      v-model="dob"
                      label="Date of Birth (YYYY-MM-DD)"
                      prepend-inner-icon="mdi-calendar"
                      :error-messages="errors.dob"
                      :disabled="isSubmitting"
                      placeholder="YYYY-MM-DD"
                      class="mb-2"
                    />
                 </v-col>
                 <v-col cols="12" md="6">
                    <v-text-field
                      v-model="city"
                      label="City (Optional)"
                      prepend-inner-icon="mdi-city-variant-outline"
                      :error-messages="errors.city"
                      :disabled="isSubmitting"
                      class="mb-2"
                    />
                 </v-col>
              </v-row>

              <v-btn
                type="submit"
                block
                color="primary"
                size="large"
                :loading="isSubmitting"
                :disabled="isSubmitting"
                class="mt-4"
              >
                Sign Up
              </v-btn>
            </v-form>
          </v-card-text>

           <v-card-actions class="d-flex justify-center px-4 pb-4">
             <router-link :to="{ name: 'Login' }" class="text-body-2 text-decoration-none">
                Already have an account? Sign In
             </router-link>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>