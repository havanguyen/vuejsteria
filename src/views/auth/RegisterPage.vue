<template>
  <v-container class="fill-height" fluid>
    <v-row align="center" justify="center">
      <v-col cols="12" sm="8" md="4">
        <Transition name="fade" appear>
          <v-card class="elevation-12" v-if="showForm">
            <v-toolbar color="primary" dark flat>
              <v-toolbar-title>Đăng ký</v-toolbar-title>
            </v-toolbar>
            <v-card-text>
              <v-form @submit.prevent="onSubmit">
                <v-slide-y-transition>
                  <v-alert
                    v-if="errorMessage"
                    type="error"
                    class="mb-4"
                    density="compact"
                    closable
                    @click:close="errorMessage = ''"
                  >
                    {{ errorMessage }}
                  </v-alert>
                </v-slide-y-transition>

                <v-text-field
                  v-model="username.value.value"
                  :error-messages="username.errorMessage.value"
                  label="Tên đăng nhập"
                  prepend-icon="mdi-account"
                  type="text"
                  variant="underlined"
                ></v-text-field>

                <v-text-field
                  v-model="email.value.value"
                  :error-messages="email.errorMessage.value"
                  label="Email"
                  prepend-icon="mdi-email"
                  type="email"
                  variant="underlined"
                ></v-text-field>

                <v-text-field
                  v-model="password.value.value"
                  :error-messages="password.errorMessage.value"
                  label="Mật khẩu"
                  prepend-icon="mdi-lock"
                  type="password"
                  variant="underlined"
                ></v-text-field>

                <v-text-field
                  v-model="confirmPassword.value.value"
                  :error-messages="confirmPassword.errorMessage.value"
                  label="Xác nhận mật khẩu"
                  prepend-icon="mdi-lock-check"
                  type="password"
                  variant="underlined"
                ></v-text-field>

                <v-card-actions>
                  <v-spacer></v-spacer>
                  <v-btn
                    type="submit"
                    color="primary"
                    :loading="isLoading"
                    :disabled="isLoading"
                  >
                    Đăng ký
                  </v-btn>
                </v-card-actions>
              </v-form>
            </v-card-text>
            <v-card-actions class="justify-center">
              <span
                >Đã có tài khoản?
                <router-link to="/login">Đăng nhập</router-link></span
              >
            </v-card-actions>
          </v-card>
        </Transition>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useField, useForm } from 'vee-validate';
import { registerSchema } from '@/validations/authSchema';
import { useAuthStore } from '@/stores/useAuthStore';
import { useNotificationStore } from '@/stores/useNotificationStore';

const showForm = ref(false);
const isLoading = ref(false);
const errorMessage = ref('');

const router = useRouter();
const authStore = useAuthStore();
const notificationStore = useNotificationStore();

const { handleSubmit } = useForm({
  validationSchema: registerSchema
});

const username = useField('username');
const email = useField('email');
const password = useField('password');
const confirmPassword = useField('confirmPassword');

const onSubmit = handleSubmit(async (values) => {
  isLoading.value = true;
  errorMessage.value = '';
  try {
    await authStore.register(values);
    notificationStore.showSuccess('Đăng ký thành công! Vui lòng đăng nhập.');
    router.push('/login');
  } catch (error) {
    const apiError = error.response?.data?.message || 'Lỗi không xác định';
    errorMessage.value = apiError;
  } finally {
    isLoading.value = false;
  }
});

onMounted(() => {
  showForm.value = true;
});
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition:
    opacity 0.5s ease,
    transform 0.5s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(20px);
}
</style>