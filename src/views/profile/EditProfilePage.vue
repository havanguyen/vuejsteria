<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <v-btn
          variant="text"
          prepend-icon="mdi-chevron-left"
          @click="router.push({ name: 'Profile' })"
          class="mb-4 text-white"
          style="text-shadow: 0 1px 3px rgba(0, 0, 0, 0.2)"
        >
          Back to Profile
        </v-btn>
      </v-col>

      <v-col cols="12" md="4">
        <v-slide-x-transition appear>
          <v-card class="pa-4 pa-md-6 rounded-lg">
            <v-card-title class="text-h6 font-weight-bold mb-4">
              Profile Picture
            </v-card-title>
            <v-card-text class="text-center">
              <v-avatar
                size="180"
                class="elevation-2 mb-4 avatar-glow-edit"
                color="grey-lighten-3"
              >
                <v-img
                  :src="
                    avatarUrl ||
                    user?.profileResponse?.avatarUrl ||
                    'https://via.placeholder.com/180/E0E0E0/FFFFFF?text=No+Avatar'
                  "
                  cover
                >
                  <template v-slot:placeholder>
                    <v-icon size="80" color="grey-darken-1"
                      >mdi-account-circle</v-icon
                    >
                  </template>
                  <template v-slot:error>
                    <v-icon size="80" color="grey-darken-1"
                      >mdi-account-circle</v-icon
                    >
                  </template>
                </v-img>
              </v-avatar>

              <input
                type="file"
                ref="fileInputRef"
                @change="handleFileSelected"
                accept="image/*"
                hidden
              />

              <v-btn
                @click="triggerFileInput"
                color="primary"
                variant="flat"
                prepend-icon="mdi-camera"
                :loading="isUploading"
                :disabled="isUploading || isSubmitting"
                class="mb-2 w-100 hover-lift"
              >
                Upload Image
              </v-btn>

              <v-text-field
                v-model="avatarUrl"
                label="Or paste Avatar URL"
                :error-messages="errors.avatarUrl"
                density="comfortable"
                variant="outlined"
                placeholder="Upload or paste URL"
                clearable
                prepend-inner-icon="mdi-link-variant"
              ></v-text-field>
            </v-card-text>
          </v-card>
        </v-slide-x-transition>
      </v-col>

      <v-col cols="12" md="8">
        <v-slide-x-reverse-transition appear>
          <v-card class="pa-4 pa-md-6 rounded-lg">
            <v-card-title class="text-h6 font-weight-bold mb-4">
              Personal Details & Security
            </v-card-title>
            <v-card-text>
              <v-form @submit.prevent="onSubmit">
                <v-row>
                  <v-col cols="12" sm="6">
                    <v-text-field
                      v-model="firstName"
                      label="First Name"
                      :error-messages="errors.firstName"
                      density="comfortable"
                      variant="outlined"
                      prepend-inner-icon="mdi-account-box-outline"
                      clearable
                    ></v-text-field>
                  </v-col>
                  <v-col cols="12" sm="6">
                    <v-text-field
                      v-model="lastName"
                      label="Last Name"
                      :error-messages="errors.lastName"
                      density="comfortable"
                      variant="outlined"
                      prepend-inner-icon="mdi-account-box-outline"
                      clearable
                    ></v-text-field>
                  </v-col>
                </v-row>

                <v-text-field
                  v-model="email"
                  label="Email Address"
                  :error-messages="errors.email"
                  type="email"
                  density="comfortable"
                  variant="outlined"
                  prepend-inner-icon="mdi-email-outline"
                  clearable
                ></v-text-field>

                <v-row>
                  <v-col cols="12" sm="7">
                    <v-menu
                      v-model="dobMenu"
                      :close-on-content-click="false"
                      location="bottom start"
                    >
                      <template v-slot:activator="{ props }">
                        <v-text-field
                          v-model="dob"
                          label="Date of Birth"
                          :error-messages="errors.dob"
                          readonly
                          v-bind="props"
                          density="comfortable"
                          variant="outlined"
                          prepend-inner-icon="mdi-calendar"
                          clearable
                          @click:clear="dob = null; dobForPicker = null"
                        ></v-text-field>
                      </template>
                      <v-date-picker
                        v-model="dobForPicker"
                        @update:modelValue="updateDobField"
                        show-adjacent-months
                        hide-header
                        color="primary"
                      />
                    </v-menu>
                  </v-col>
                  <v-col cols="12" sm="5">
                    <v-text-field
                      v-model="city"
                      label="City"
                      :error-messages="errors.city"
                      density="comfortable"
                      variant="outlined"
                      prepend-inner-icon="mdi-city-outline"
                      clearable
                    ></v-text-field>
                  </v-col>
                </v-row>

                <v-divider class="my-6"></v-divider>
                <h6 class="text-h6 font-weight-medium mb-4">Security</h6>
                <v-text-field
                  v-model="password"
                  label="New Password"
                  :error-messages="errors.password"
                  :type="showPassword ? 'text' : 'password'"
                  :append-inner-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
                  @click:append-inner="showPassword = !showPassword"
                  density="comfortable"
                  variant="outlined"
                  prepend-inner-icon="mdi-lock-outline"
                  placeholder="Leave blank to keep current password"
                  clearable
                ></v-text-field>
                <v-text-field
                  v-model="confirmPassword"
                  label="Confirm New Password"
                  :error-messages="errors.confirmPassword"
                  :type="showPassword ? 'text' : 'password'"
                  density="comfortable"
                  variant="outlined"
                  prepend-inner-icon="mdi-lock-check-outline"
                  clearable
                ></v-text-field>

                <v-card-actions class="px-0 pt-4 d-flex justify-end">
                  <v-btn
                    type="submit"
                    color="primary"
                    :loading="isSubmitting"
                    :disabled="isSubmitting || isUploading"
                    variant="flat"
                    size="large"
                    prepend-icon="mdi-content-save-edit-outline"
                    class="hover-lift"
                  >
                    Save Changes
                  </v-btn>
                </v-card-actions>
              </v-form>
            </v-card-text>
          </v-card>
        </v-slide-x-reverse-transition>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useForm, useField } from 'vee-validate';
import { toTypedSchema } from '@vee-validate/zod';
import { profileSchema } from '@/validations/profileSchema';
import { useAuthStore } from '@/stores/useAuthStore';
import { storeToRefs } from 'pinia';
import { updateMyInfoApi } from '@/api/userApi';
import { uploadImageApi } from '@/api/fileApi';
import { useNotificationStore } from '@/stores/useNotificationStore';
import { useLoadingStore } from '@/stores/useLoadingStore';
import { format, parseISO, isValid as isDateValid } from 'date-fns';

const router = useRouter();
const authStore = useAuthStore();
const notificationStore = useNotificationStore();
const loadingStore = useLoadingStore();
const { user } = storeToRefs(authStore);

const isSubmitting = ref(false);
const isUploading = ref(false);
const showPassword = ref(false);
const dobMenu = ref(false);

const fileInputRef = ref(null);

const { handleSubmit, errors, setValues, setFieldValue } = useForm({
  validationSchema: toTypedSchema(profileSchema),
  initialValues: {
    firstName: '',
    lastName: '',
    dob: '',
    city: '',
    email: '',
    avatarUrl: null,
    password: '',
    confirmPassword: '',
  },
});

const { value: firstName } = useField('firstName');
const { value: lastName } = useField('lastName');
const { value: dob } = useField('dob');
const { value: city } = useField('city');
const { value: email } = useField('email');
const { value: avatarUrl } = useField('avatarUrl');
const { value: password } = useField('password');
const { value: confirmPassword } = useField('confirmPassword');

const dobForPicker = ref(null);

onMounted(() => {
  if (user.value && user.value.profileResponse) {
    const profile = user.value.profileResponse;
    setValues({
      firstName: profile.firstName || '',
      lastName: profile.lastName || '',
      dob: profile.dob ? profile.dob.split('T')[0] : '',
      city: profile.city || '',
      email: profile.email || '',
      avatarUrl: profile.avatarUrl || null,
    });
    if (profile.dob) {
      const parsedDate = parseISO(profile.dob);
      if (isDateValid(parsedDate)) dobForPicker.value = parsedDate;
    }
  } else if (user.value) {
    setValues({ email: user.value.email || user.value.username });
  }
});

const triggerFileInput = () => {
  fileInputRef.value.click();
};

const handleFileSelected = async (event) => {
  const file = event.target.files[0];
  if (!file) {
    console.log('Sự kiện @change ĐÃ CHẠY: Không có tệp nào được chọn.');
    return;
  }
  console.log(`Sự kiện @change ĐÃ CHẠY: Đã chọn tệp: ${file.name}`);

  isUploading.value = true;
  loadingStore.showLoading();
  const formData = new FormData();
  formData.append('file', file);

  try {
    const response = await uploadImageApi(formData);
    setFieldValue('avatarUrl', response.url);
    notificationStore.showSuccess('Avatar uploaded successfully! Click Save.');
  } catch (error) {
    notificationStore.showError(error.message || 'Avatar upload failed', 5000);
    setFieldValue('avatarUrl', null);
  } finally {
    isUploading.value = false;
    loadingStore.hideLoading();
    event.target.value = null;
  }
};

const onSubmit = handleSubmit(async (values) => {
  isSubmitting.value = true;
  loadingStore.showLoading();
  const updateData = { ...values };

  if (!updateData.password) {
    delete updateData.password;
    delete updateData.confirmPassword;
  } else {
    delete updateData.confirmPassword;
  }

  if (updateData.city === '') updateData.city = null;
  if (updateData.dob === '') updateData.dob = null;
  if (updateData.avatarUrl === '') updateData.avatarUrl = null;

  try {
    const updatedUser = await updateMyInfoApi(updateData);
    authStore.setUser(updatedUser);
    notificationStore.showSuccess('Profile details updated!');
  } catch (error) {
    notificationStore.showError(error.message || 'Failed to update profile');
  } finally {
    isSubmitting.value = false;
    loadingStore.hideLoading();
  }
});

const updateDobField = (newDate) => {
  dob.value = newDate ? format(newDate, 'yyyy-MM-dd') : null;
  dobMenu.value = false;
};
</script>

<style>
.avatar-glow-edit {
  border: 3px solid rgba(255, 255, 255, 0.5);
  box-shadow: 0 0 15px rgba(11, 87, 208, 0.3);
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