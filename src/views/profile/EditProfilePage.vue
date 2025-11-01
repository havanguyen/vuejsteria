<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useForm, useField } from 'vee-validate';
import { toTypedSchema } from '@vee-validate/zod';
import { activeProfileSchema } from '@/validations/profileSchema';
import { useAuthStore } from '@/stores/useAuthStore';
import { storeToRefs } from 'pinia';
import { updateMyInfoApi } from '@/api/userApi';
import { updateMyAvatarApi } from '@/api/profileApi';
import { useNotificationStore } from '@/stores/useNotificationStore';

const router = useRouter();
const authStore = useAuthStore();
const notificationStore = useNotificationStore();
const { user: userProfile } = storeToRefs(authStore);

const isSubmitting = ref(false);
const isUploadingAvatar = ref(false);
const avatarFile = ref([]);
const avatarPreview = ref(null);
const avatarInput = ref(null);

const { handleSubmit, errors, setValues } = useForm({
  validationSchema: toTypedSchema(activeProfileSchema),
  initialValues: {
    firstName: '',
    lastName: '',
    dob: null,
    city: '',
    email: '',
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

onMounted(() => {
  if (userProfile.value?.profile) {
    setValues({
      firstName: userProfile.value.profile.firstName,
      lastName: userProfile.value.profile.lastName,
      dob: userProfile.value.profile.dob,
      city: userProfile.value.profile.city,
      email: userProfile.value.profile.email
    });
  }
});

const onSubmit = handleSubmit(async (values) => {
  isSubmitting.value = true;
  const updateData = { ...values };
  if (!updateData.password) {
    delete updateData.password;
    delete updateData.confirmPassword;
  } else {
    delete updateData.confirmPassword;
  }

  if (updateData.dob === '') {
    updateData.dob = null;
  }
  if (updateData.city === '') {
    updateData.city = null;
  }
  if (updateData.email === '') {
    updateData.email = null;
  }

  try {
    await updateMyInfoApi(updateData);
    await authStore.fetchMyInfo();
    notificationStore.showSuccess('Cập nhật hồ sơ thành công!');
    router.push({ name: 'Profile' });
  } catch (error) {
    notificationStore.showError(
      error.response?.data?.message || 'Lỗi cập nhật hồ sơ'
    );
  } finally {
    isSubmitting.value = false;
  }
});

const triggerAvatarUpload = () => {
  if (avatarInput.value) {
    avatarInput.value.$el.querySelector('input').click();
  }
};

const onFileChange = (event) => {
  const file = event.target.files[0];
  if (file) {
    avatarFile.value = [file];
    const reader = new FileReader();
    reader.onload = (e) => {
      avatarPreview.value = e.target.result;
    };
    reader.readAsDataURL(file);
  } else {
    avatarFile.value = [];
    avatarPreview.value = null;
  }
};

const onUploadAvatar = async () => {
  if (!avatarFile.value || avatarFile.value.length === 0) return;

  isUploadingAvatar.value = true;
  const formData = new FormData();
  formData.append('file', avatarFile.value[0]);

  try {
    await updateMyAvatarApi(formData);
    await authStore.fetchMyInfo();
    notificationStore.showSuccess('Cập nhật avatar thành công!');
    avatarFile.value = [];
    avatarPreview.value = null;
  } catch (error) {
    notificationStore.showError('Lỗi tải lên avatar');
  } finally {
    isUploadingAvatar.value = false;
  }
};
</script>

<template>
  <v-container>
    <v-row justify="center">
      <v-col cols="12" md="8">
        <v-card class="pa-4 pa-md-6">
          <v-card-title>Chỉnh sửa hồ sơ</v-card-title>
          <v-divider></v-divider>

          <v-card-text>
            <v-row justify="center">
              <v-col cols="12" sm="4" class="text-center">
                <v-avatar
                  size="120"
                  class="mb-4 elevation-2"
                  style="cursor: pointer"
                  @click="triggerAvatarUpload"
                  color="grey-lighten-3"
                >
                  <v-img
                    :src="avatarPreview || userProfile?.profile?.avatarUrl"
                  >
                    <template v-slot:placeholder>
                      <v-icon size="60" color="grey">mdi-account-circle</v-icon>
                    </template>
                    <template v-slot:error>
                       <v-icon size="60" color="grey">mdi-account-circle</v-icon>
                    </template>
                  </v-img>
                  <v-overlay
                    v-model="isUploadingAvatar"
                    contained
                    class="align-center justify-center"
                    scrim="true"
                  >
                    <v-progress-circular
                      indeterminate
                      color="white"
                    ></v-progress-circular>
                  </v-overlay>
                </v-avatar>
                
                <v-file-input
                  ref="avatarInput"
                  v-model="avatarFile"
                  @update:modelValue="onFileChange"
                  accept="image/*"
                  class="d-none"
                ></v-file-input>
                
                <v-btn
                  :disabled="!avatarFile || avatarFile.length === 0 || isUploadingAvatar"
                  :loading="isUploadingAvatar"
                  @click="onUploadAvatar"
                  color="primary"
                  size="small"
                  class="mt-2"
                >
                  Lưu Avatar
                </v-btn>
              </v-col>
            </v-row>

            <v-form @submit.prevent="onSubmit" class="mt-6">
              <v-text-field
                v-model="firstName"
                label="First Name"
                :error-messages="errors.firstName"
                density="comfortable"
                variant="outlined"
              ></v-text-field>

              <v-text-field
                v-model="lastName"
                label="Last Name"
                :error-messages="errors.lastName"
                density="comfortable"
                variant="outlined"
              ></v-text-field>

              <v-text-field
                v-model="dob"
                label="Date of Birth"
                :error-messages="errors.dob"
                type="date"
                density="comfortable"
                variant="outlined"
              ></v-text-field>

              <v-text-field
                v-model="city"
                label="City"
                :error-messages="errors.city"
                density="comfortable"
                variant="outlined"
              ></v-text-field>

              <v-text-field
                v-model="email"
                label="Email"
                :error-messages="errors.email"
                type="email"
                density="comfortable"
                variant="outlined"
              ></v-text-field>

              <v-text-field
                v-model="password"
                label="New Password (optional)"
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
                >
                  Hủy
                </v-btn>
                <v-btn
                  type="submit"
                  color="primary"
                  :loading="isSubmitting"
                  :disabled="isSubmitting"
                  variant="flat"
                >
                  Lưu thay đổi
                </v-btn>
              </v-card-actions>
            </v-form>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>