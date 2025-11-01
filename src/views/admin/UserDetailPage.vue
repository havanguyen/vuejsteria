<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <v-btn
          variant="text"
          prepend-icon="mdi-chevron-left"
          @click="router.push({ name: 'AdminUserList' })"
          class="mb-4"
        >
          Back to User List
        </v-btn>
      </v-col>

      <v-col cols="12" v-if="loading" class="text-center py-10">
        <v-progress-circular
          indeterminate
          color="primary"
          size="50"
        ></v-progress-circular>
      </v-col>

      <v-col cols="12" v-else-if="error" class="text-center py-10">
        <v-alert type="error" variant="tonal" class="mb-4">
          {{ error }}
        </v-alert>
      </v-col>

      <template v-else>
        <v-col cols="12" md="4">
          <v-card class="pa-4 pa-md-6 rounded-lg elevation-4">
            <v-card-title class="text-h6 font-weight-bold mb-4">
              Profile Picture
            </v-card-title>
            <v-card-text class="text-center">
              <v-avatar
                size="180"
                class="elevation-2 mb-4"
                color="grey-lighten-3"
              >
                <v-img
                  :src="
                    avatarUrl ||
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
                class="mb-2 w-100"
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
        </v-col>

        <v-col cols="12" md="8">
          <v-card class="pa-4 pa-md-6 rounded-lg elevation-4">
            <v-card-title class="text-h6 font-weight-bold mb-4">
              User Details & Security
            </v-card-title>
            <v-card-text>
              <v-form @submit.prevent="onSubmit">
                <v-alert
                  v-if="serverError"
                  type="error"
                  variant="tonal"
                  density="compact"
                  class="mb-4"
                  closable
                >
                  {{ serverError }}
                </v-alert>
                <v-alert
                  v-if="serverSuccess"
                  type="success"
                  variant="tonal"
                  density="compact"
                  class="mb-4"
                  closable
                >
                  {{ serverSuccess }}
                </v-alert>

                <v-text-field
                  :model-value="user?.id"
                  label="User ID"
                  readonly
                  disabled
                  variant="filled"
                  density="comfortable"
                  class="mb-4"
                />
                <v-text-field
                  :model-value="user?.username"
                  label="Username"
                  readonly
                  disabled
                  variant="filled"
                  density="comfortable"
                  prepend-inner-icon="mdi-account"
                  class="mb-4"
                />

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
                <h6 class="text-h6 font-weight-medium mb-4">
                  Access Control
                </h6>
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

                <v-select
                  v-model="roles"
                  :items="allRoles"
                  label="Roles"
                  multiple
                  chips
                  closable-chips
                  prepend-inner-icon="mdi-shield-account-outline"
                  :error-messages="errors.roles"
                  :disabled="isSubmitting"
                  class="mb-2"
                  variant="outlined"
                  density="comfortable"
                />

                <v-switch
                  v-model="active"
                  :label="active ? 'Active' : 'Inactive'"
                  color="success"
                  inset
                  :error-messages="errors.active"
                  :disabled="isSubmitting"
                  class="mt-2"
                />

                <v-card-actions class="px-0 pt-4 d-flex justify-end">
                  <v-btn
                    type="submit"
                    color="primary"
                    :loading="isSubmitting"
                    :disabled="isSubmitting || isUploading"
                    variant="flat"
                    size="large"
                    prepend-icon="mdi-content-save-edit-outline"
                  >
                    Save Changes
                  </v-btn>
                </v-card-actions>
              </v-form>
            </v-card-text>
          </v-card>
        </v-col>
      </template>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { getUserByIdApi, updateUserByAdminApi } from '@/api/userApi';
import { uploadImageApi } from '@/api/fileApi';
import { useForm, useField } from 'vee-validate';
import { toTypedSchema } from '@vee-validate/zod';
import * as z from 'zod';
import { format, parseISO, isValid as isDateValid } from 'date-fns';
import { useNotificationStore } from '@/stores/useNotificationStore';
import { useLoadingStore } from '@/stores/useLoadingStore';

const route = useRoute();
const router = useRouter();
const notificationStore = useNotificationStore();
const loadingStore = useLoadingStore();

const user = ref(null);
const loading = ref(true);
const error = ref(null);
const serverError = ref(null);
const serverSuccess = ref(null);
const isSubmitting = ref(false);
const isUploading = ref(false);
const dobMenu = ref(false);
const showPassword = ref(false);
const allRoles = ref(['USER', 'ADMIN']);

const fileInputRef = ref(null);

const userId = computed(() => route.params.id);

const isValidDateFn = (dateString) => {
  if (!dateString) return true;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateString)) return false;
  const date = parseISO(dateString);
  return isDateValid(date);
};

const adminUpdateUserSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z
    .string()
    .email('Invalid email format')
    .optional()
    .nullable()
    .or(z.literal('')),
  dob: z
    .string()
    .nullable()
    .optional()
    .refine((val) => !val || /^\d{4}-\d{2}-\d{2}$/.test(val), {
      message: 'Date must be in YYYY-MM-DD format or empty'
    })
    .refine((val) => !val || isValidDateFn(val), {
      message: 'Invalid date provided'
    }),
  city: z.string().optional().nullable().or(z.literal('')),
  password: z
    .string()
    .min(6, 'Password must be at least 6 characters')
    .or(z.literal(''))
    .optional()
    .nullable(),
  roles: z.array(z.string()).min(1, 'At least one role is required'),
  active: z.boolean(),
  avatarUrl: z
    .string()
    .url('Must be a valid URL')
    .optional()
    .nullable()
    .or(z.literal(''))
});

const { handleSubmit, errors, setValues, resetForm, setFieldValue } = useForm({
  validationSchema: toTypedSchema(adminUpdateUserSchema),
  initialValues: {
    firstName: '',
    lastName: '',
    email: '',
    dob: null,
    city: '',
    password: '',
    roles: [],
    active: true,
    avatarUrl: ''
  }
});

const { value: firstName } = useField('firstName');
const { value: lastName } = useField('lastName');
const { value: email } = useField('email');
const { value: dob } = useField('dob');
const { value: city } = useField('city');
const { value: password } = useField('password');
const { value: roles } = useField('roles');
const { value: active } = useField('active');
const { value: avatarUrl } = useField('avatarUrl');

const dobForPicker = ref(null);

const fetchUser = async () => {
  loading.value = true;
  error.value = null;
  serverError.value = null;
  serverSuccess.value = null;
  if (!userId.value) {
    error.value = 'User ID is missing.';
    loading.value = false;
    return;
  }
  try {
    const data = await getUserByIdApi(userId.value);
    user.value = data;
    resetForm({
      values: {
        firstName: data.profileResponse?.firstName || '',
        lastName: data.profileResponse?.lastName || '',
        email: data.profileResponse?.email || '',
        dob: data.profileResponse?.dob
          ? data.profileResponse.dob.split('T')[0]
          : null,
        city: data.profileResponse?.city || '',
        password: '',
        roles: data.roles?.map((r) => r.name) || [],
        active: data.active === undefined ? true : data.active,
        avatarUrl: data.profileResponse?.avatarUrl || ''
      }
    });
    if (data.profileResponse?.dob) {
      const parsedDate = parseISO(data.profileResponse.dob);
      if (isDateValid(parsedDate)) dobForPicker.value = parsedDate;
    }
  } catch (err) {
    console.error(`Failed to fetch user ${userId.value}:`, err);
    error.value = 'Could not load user details.';
    resetForm();
  } finally {
    loading.value = false;
  }
};

const triggerFileInput = () => {
  fileInputRef.value.click();
};

const handleFileSelected = async (event) => {
  const file = event.target.files[0];
  if (!file) {
    return;
  }

  isUploading.value = true;
  loadingStore.showLoading();
  const formData = new FormData();
  formData.append('file', file);

  try {
    const response = await uploadImageApi(formData);
    setFieldValue('avatarUrl', response.url);
    notificationStore.showSuccess(
      'Avatar uploaded! Click Save Changes to apply.'
    );
  } catch (err) {
    notificationStore.showError(err.message || 'Avatar upload failed', 5000);
    setFieldValue('avatarUrl', null);
  } finally {
    isUploading.value = false;
    loadingStore.hideLoading();
    event.target.value = null;
  }
};

const onSubmit = handleSubmit(async (values) => {
  serverError.value = null;
  serverSuccess.value = null;
  isSubmitting.value = true;
  loadingStore.showLoading();
  try {
    const updateData = { ...values };
    if (!updateData.password) {
      delete updateData.password;
    }
    if (updateData.dob === '') {
      updateData.dob = null;
    }
    if (updateData.city === '') {
      updateData.city = null;
    }
    if (updateData.avatarUrl === '') {
      updateData.avatarUrl = null;
    }

    const updatedUser = await updateUserByAdminApi(userId.value, updateData);
    user.value = updatedUser;
    resetForm({
      values: {
        firstName: updatedUser.profileResponse?.firstName || '',
        lastName: updatedUser.profileResponse?.lastName || '',
        email: updatedUser.profileResponse?.email || '',
        dob: updatedUser.profileResponse?.dob
          ? updatedUser.profileResponse.dob.split('T')[0]
          : null,
        city: updatedUser.profileResponse?.city || '',
        password: '',
        roles: updatedUser.roles?.map((r) => r.name) || [],
        active: updatedUser.active === undefined ? true : updatedUser.active,
        avatarUrl: updatedUser.profileResponse?.avatarUrl || ''
      },
      errors: {}
    });
    if (updatedUser.profileResponse?.dob) {
      const parsedDate = parseISO(updatedUser.profileResponse.dob);
      if (isDateValid(parsedDate)) dobForPicker.value = parsedDate;
    }
    serverSuccess.value = 'User updated successfully!';
  } catch (err) {
    console.error('User update failed:', err);
    serverError.value =
      err?.title || err?.message || 'User update failed. Please try again.';
  } finally {
    isSubmitting.value = false;
    loadingStore.hideLoading();
  }
});

const updateDobField = (newDate) => {
  dob.value = newDate ? format(newDate, 'yyyy-MM-dd') : null;
  dobMenu.value = false;
};

onMounted(fetchUser);

watch(userId, (newId, oldId) => {
  if (newId !== oldId && newId) {
    fetchUser();
  }
});
</script>