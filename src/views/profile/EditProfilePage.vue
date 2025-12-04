<template>
  <v-container class="py-8">
    <v-row justify="center">
      <v-col cols="12" md="10" lg="8">
        <!-- Back Button -->
        <v-btn
          variant="text"
          prepend-icon="mdi-arrow-left"
          @click="router.push({ name: 'Profile' })"
          class="mb-6 text-white font-weight-bold"
          style="text-shadow: 0 2px 4px rgba(0,0,0,0.3)"
        >
          Back to Profile
        </v-btn>

        <v-slide-x-transition appear>
          <v-card class="glass-card overflow-visible">
            <!-- Decorative Banner -->
            <div class="profile-banner"></div>

            <v-card-text class="pt-0 relative px-4 px-md-8 pb-8">
              <v-form @submit.prevent="onSubmit">
                <v-row>
                  <!-- Left Column: Avatar -->
                  <v-col cols="12" md="4" class="text-center">
                    <div class="avatar-wrapper mt-n16">
                      <v-hover v-slot="{ isHovering, props }">
                        <div 
                          class="avatar-container cursor-pointer" 
                          v-bind="props"
                          @click="triggerFileInput"
                        >
                          <v-avatar size="180" class="profile-avatar elevation-6">
                            <v-img
                              :src="
                                avatarUrl ||
                                user?.profileResponse?.avatarUrl ||
                                'https://via.placeholder.com/200/E0E0E0/FFFFFF?text=No+Avatar'
                              "
                              alt="User Avatar"
                              cover
                            >
                              <template v-slot:placeholder>
                                <div class="d-flex align-center justify-center fill-height bg-grey-lighten-3">
                                  <v-icon size="80" color="grey-darken-1">mdi-account</v-icon>
                                </div>
                              </template>
                            </v-img>
                            
                            <!-- Upload Overlay -->
                            <v-overlay
                              :model-value="isHovering"
                              contained
                              class="align-center justify-center"
                              scrim="rgba(0,0,0,0.4)"
                            >
                              <v-icon color="white" size="48">mdi-camera-plus</v-icon>
                              <div class="text-white font-weight-bold mt-2">Change Photo</div>
                            </v-overlay>
                          </v-avatar>
                          
                          <div class="edit-badge">
                            <v-icon color="white" size="16">mdi-pencil</v-icon>
                          </div>
                        </div>
                      </v-hover>
                      
                      <input
                        type="file"
                        ref="fileInputRef"
                        @change="handleFileSelected"
                        accept="image/*"
                        hidden
                      />
                      
                      <div class="text-caption text-medium-emphasis mt-4">
                        Allowed *.jpeg, *.jpg, *.png, *.gif
                        <br>Max size of 3 MB
                      </div>
                    </div>
                  </v-col>

                  <!-- Right Column: Form Fields -->
                  <v-col cols="12" md="8" class="pt-md-12">
                    <h2 class="text-h5 font-weight-bold mb-6 d-flex align-center">
                      <v-icon color="primary" class="mr-2">mdi-account-details-outline</v-icon>
                      Personal Details
                    </h2>

                    <v-row>
                      <v-col cols="12" sm="6">
                        <v-text-field
                          v-model="firstName"
                          label="First Name"
                          :error-messages="errors.firstName"
                          variant="outlined"
                          density="comfortable"
                          color="primary"
                          bg-color="rgba(255,255,255,0.5)"
                        ></v-text-field>
                      </v-col>
                      <v-col cols="12" sm="6">
                        <v-text-field
                          v-model="lastName"
                          label="Last Name"
                          :error-messages="errors.lastName"
                          variant="outlined"
                          density="comfortable"
                          color="primary"
                          bg-color="rgba(255,255,255,0.5)"
                        ></v-text-field>
                      </v-col>
                    </v-row>

                    <v-text-field
                      v-model="email"
                      label="Email Address"
                      :error-messages="errors.email"
                      variant="outlined"
                      density="comfortable"
                      prepend-inner-icon="mdi-email-outline"
                      color="primary"
                      bg-color="rgba(255,255,255,0.5)"
                      class="mb-2"
                    ></v-text-field>

                    <v-row>
                      <v-col cols="12" sm="6">
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
                              variant="outlined"
                              density="comfortable"
                              prepend-inner-icon="mdi-calendar"
                              color="primary"
                              bg-color="rgba(255,255,255,0.5)"
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
                          variant="outlined"
                          density="comfortable"
                          prepend-inner-icon="mdi-city-variant-outline"
                          color="primary"
                          bg-color="rgba(255,255,255,0.5)"
                        ></v-text-field>
                      </v-col>
                    </v-row>

                    <v-divider class="my-8 opacity-20"></v-divider>

                    <h2 class="text-h5 font-weight-bold mb-6 d-flex align-center">
                      <v-icon color="primary" class="mr-2">mdi-shield-check-outline</v-icon>
                      Security
                    </h2>

                    <v-text-field
                      v-model="password"
                      label="New Password"
                      :error-messages="errors.password"
                      :type="showPassword ? 'text' : 'password'"
                      :append-inner-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
                      @click:append-inner="showPassword = !showPassword"
                      variant="outlined"
                      density="comfortable"
                      prepend-inner-icon="mdi-lock-outline"
                      placeholder="Leave blank to keep current password"
                      color="primary"
                      bg-color="rgba(255,255,255,0.5)"
                      class="mb-2"
                    ></v-text-field>

                    <v-text-field
                      v-model="confirmPassword"
                      label="Confirm New Password"
                      :error-messages="errors.confirmPassword"
                      :type="showPassword ? 'text' : 'password'"
                      variant="outlined"
                      density="comfortable"
                      prepend-inner-icon="mdi-lock-check-outline"
                      color="primary"
                      bg-color="rgba(255,255,255,0.5)"
                    ></v-text-field>

                    <div class="d-flex justify-end mt-8">
                      <v-btn
                        variant="text"
                        class="mr-4"
                        @click="router.push({ name: 'Profile' })"
                      >
                        Cancel
                      </v-btn>
                      <v-btn
                        type="submit"
                        color="primary"
                        :loading="isSubmitting"
                        :disabled="isSubmitting || isUploading"
                        size="large"
                        rounded="xl"
                        elevation="4"
                        prepend-icon="mdi-content-save-outline"
                        class="px-8 font-weight-bold"
                      >
                        Save Changes
                      </v-btn>
                    </div>
                  </v-col>
                </v-row>
              </v-form>
            </v-card-text>
          </v-card>
        </v-slide-x-transition>
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
  if (!file) return;

  isUploading.value = true;
  loadingStore.showLoading();
  const formData = new FormData();
  formData.append('file', file);

  try {
    const response = await uploadImageApi(formData);
    setFieldValue('avatarUrl', response.url);
    notificationStore.showSuccess('Avatar uploaded successfully! Click Save to apply.');
  } catch (error) {
    notificationStore.showError(error.message || 'Avatar upload failed');
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
    router.push({ name: 'Profile' });
  } catch (error) {
    const errorMessage = error?.message || (typeof error === 'string' ? error : 'Failed to update profile');
    notificationStore.showError(errorMessage);
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

<style scoped>
.glass-card {
  background: rgba(255, 255, 255, 0.85) !important;
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.5);
  border-radius: 24px !important;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1) !important;
}

.profile-banner {
  height: 160px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 24px 24px 0 0;
  margin: -1px -1px 0;
}

.avatar-container {
  position: relative;
  display: inline-block;
  border-radius: 50%;
  transition: transform 0.2s ease;
}

.avatar-container:hover {
  transform: scale(1.02);
}

.profile-avatar {
  border: 4px solid white;
}

.edit-badge {
  position: absolute;
  bottom: 10px;
  right: 10px;
  width: 32px;
  height: 32px;
  background: #2196f3;
  border: 3px solid white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 4px rgba(0,0,0,0.2);
}

.opacity-20 {
  opacity: 0.2;
}
</style>