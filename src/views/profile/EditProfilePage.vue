<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useForm, useField } from 'vee-validate';
import { toTypedSchema } from '@vee-validate/zod';
import { profileSchema } from '@/validations/profileSchema'; // SỬA LỖI: Import đúng schema
import { useAuthStore } from '@/stores/useAuthStore';
import { storeToRefs } from 'pinia';
import { updateMyInfoApi } from '@/api/userApi'; // Import API submit
import { uploadImageApi } from '@/api/fileApi'; // Import API upload
import { useNotificationStore } from '@/stores/useNotificationStore';
import { useLoadingStore } from '@/stores/useLoadingStore';

const router = useRouter();
const authStore = useAuthStore();
const notificationStore = useNotificationStore();
const loadingStore = useLoadingStore();
const { user } = storeToRefs(authStore);

const isSubmitting = ref(false);
const isUploading = ref(false);
const avatarPreview = ref(null);

// SỬA LỖI: Sử dụng 'profileSchema'
const { handleSubmit, errors, setValues, setFieldValue } = useForm({
  validationSchema: toTypedSchema(profileSchema),
  initialValues: {
    firstName: '',
    lastName: '',
    dob: '',
    city: '',
    email: '',
    avatarUrl: '', // Trường này sẽ giữ URL ảnh
    password: '',
    confirmPassword: ''
  }
});

const { value: firstName } = useField('firstName');
const { value: lastName } = useField('lastName');
const { value: dob } = useField('dob');
const { value: city } = useField('city');
const { value: email } = useField('email');
const { value: password } = useField('password');
const { value: confirmPassword } = useField('confirmPassword');
// avatarUrl được quản lý bằng setFieldValue

onMounted(() => {
  // SỬA LỖI: Đọc từ 'user.profileResponse' thay vì 'user.profile'
  if (user.value && user.value.profileResponse) {
    const profile = user.value.profileResponse;
    setValues({
      firstName: profile.firstName || '',
      lastName: profile.lastName || '',
      dob: profile.dob ? profile.dob.split('T')[0] : '', // Format date
      city: profile.city || '',
      email: profile.email || '',
      avatarUrl: profile.avatarUrl || ''
    });
    avatarPreview.value = profile.avatarUrl;
  } else if (user.value) {
    // Fallback nếu profileResponse bị null (chỉ có data từ token)
    setValues({
      email: user.value.email || user.value.username
    });
  }
});

// SỬA LỖI LOGIC UPLOAD: Triển khai luồng 1-form
const onFileChange = async (files) => {
  const file = files[0]; // v-file-input trả về một mảng
  if (!file) return;

  isUploading.value = true;
  loadingStore.showLoading();
  const formData = new FormData();
  formData.append('file', file);

  try {
    const response = await uploadImageApi(formData); // 1. Gọi file-service
    const imageUrl = response.url;

    setFieldValue('avatarUrl', imageUrl); // 2. Gán URL vào form
    avatarPreview.value = imageUrl;
    notificationStore.showSuccess('Avatar uploaded successfully!');
  } catch (error) {
    notificationStore.showError(error.message || 'Avatar upload failed');
  } finally {
    isUploading.value = false;
    loadingStore.hideLoading();
  }
};

// SỬA LỖI LOGIC SUBMIT
const onSubmit = handleSubmit(async (values) => {
  isSubmitting.value = true;

  const updateData = { ...values };

  if (!updateData.password) {
    delete updateData.password;
    delete updateData.confirmPassword;
  } else {
    delete updateData.confirmPassword;
  }

  try {
    // 3. Gửi 1 API duy nhất chứa cả avatarUrl dạng text
    await updateMyInfoApi(updateData);
    await authStore.fetchMyInfo(); // Tải lại state
    notificationStore.showSuccess('Profile updated successfully!');
    router.push({ name: 'Profile' });
  } catch (error) {
    notificationStore.showError(error.message || 'Failed to update profile');
  } finally {
    isSubmitting.value = false;
  }
});
</script>

<template>
  <v-container>
    <v-row justify="center">
      <v-col cols="12" md="8" lg="6">
        <v-card class="pa-4 pa-md-6">
          <v-card-title class="text-h5 mb-4">Edit Profile</v-card-title>
          <v-divider></v-divider>

          <v-card-text>
            <v-form @submit.prevent="onSubmit">
              <v-row justify="center">
                <v-col cols="12" sm="5" class="text-center">
                  <v-avatar
                    size="150"
                    class="mb-4 elevation-3"
                    color="grey-lighten-3"
                  >
                    <v-img
                      :src="avatarPreview || 'https://via.placeholder.com/150'"
                      cover
                    >
                      <template v-slot:placeholder>
                        <v-icon size="70" color="grey"
                          >mdi-account-circle</v-icon
                        >
                      </template>
                      <template v-slot:error>
                        <v-icon size="70" color="grey"
                          >mdi-account-circle</v-icon
                        >
                      </template>
                    </v-img>
                  </v-avatar>

                  <v-file-input
                    label="Choose new avatar"
                    @update:modelValue="onFileChange"
                    accept="image/*"
                    :loading="isUploading"
                    :disabled="isUploading || isSubmitting"
                    variant="outlined"
                    density="compact"
                    prepend-icon="mdi-camera"
                  ></v-file-input>
                  </v-col>
              </v-row>

              <v-divider class="my-6"></v-divider>
              <h6 class="text-h6 mb-4">Personal Information</h6>

              <v-row>
                <v-col cols="12" sm="6">
                  <v-text-field
                    v-model="firstName"
                    label="First Name"
                    :error-messages="errors.firstName"
                    density="comfortable"
                    variant="outlined"
                  ></v-text-field>
                </v-col>
                <v-col cols="12" sm="6">
                  <v-text-field
                    v-model="lastName"
                    label="Last Name"
                    :error-messages="errors.lastName"
                    density="comfortable"
                    variant="outlined"
                  ></v-text-field>
                </v-col>
              </v-row>

              <v-text-field
                v-model="email"
                label="Email"
                :error-messages="errors.email"
                type="email"
                density="comfortable"
                variant="outlined"
              ></v-text-field>

              <v-row>
                <v-col cols="12" sm="7">
                  <v-text-field
                    v-model="dob"
                    label="Date of Birth"
                    :error-messages="errors.dob"
                    type="date"
                    density="comfortable"
                    variant="outlined"
                  ></v-text-field>
                </v-col>
                <v-col cols="12" sm="5">
                  <v-text-field
                    v-model="city"
                    label="City"
                    :error-messages="errors.city"
                    density="comfortable"
                    variant="outlined"
                  ></v-text-field>
                </v-col>
              </v-row>

              <v-divider class="my-6"></v-divider>
              <h6 class="text-h6 mb-4">Change Password (Optional)</h6>

              <v-text-field
                v-model="password"
                label="New Password"
                :error-messages="errors.password"
                type="password"
                density="comfortable"
                variant="outlined"
              ></v-text-field>

              <v-text-field
                v-model="confirmPassword"
                label="Confirm New Password"
                :error-messages="errors.confirmPassword"
                type="password"
                density="comfortable"
                variant="outlined"
              ></v-text-field>

              <v-card-actions class="pa-0 mt-4">
                <v-spacer></v-spacer>
                <v-btn
                  variant="text"
                  @click="router.push({ name: 'Profile' })"
                  :disabled="isSubmitting"
                >
                  Cancel
                </v-btn>
                <v-btn
                  type="submit"
                  color="primary"
                  :loading="isSubmitting"
                  :disabled="isSubmitting || isUploading"
                  variant="flat"
                  size="large"
                >
                  Save Changes
                </v-btn>
              </v-card-actions>
            </v-form>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>