<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { getUserByIdApi, updateUserByAdminApi } from '@/api/userApi';
import { uploadImageApi } from '@/api/fileApi';
import { useForm, useField } from 'vee-validate';
import { toTypedSchema } from '@vee-validate/zod';
import * as z from 'zod';
import { format, parseISO, isValid as isDateValid } from 'date-fns';

const route = useRoute();
const router = useRouter();
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

const avatarFileInput = ref([]);
const avatarFileInputRef = ref(null);

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
  email: z.string().email('Invalid email format').optional().nullable().or(z.literal('')),
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
  avatarUrl: z.string().url('Must be a valid URL').optional().nullable().or(z.literal(''))
});

const { handleSubmit, errors, setValues, resetForm } = useForm({
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

const dobForPicker = computed({
  get: () => {
    try {
      return dob.value ? parseISO(dob.value) : null;
    } catch {
      return null;
    }
  },
  set: (val) => {
    dob.value = val ? format(val, 'yyyy-MM-dd') : null;
    dobMenu.value = false;
  }
});

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
        dob: data.profileResponse?.dob || null,
        city: data.profileResponse?.city || '',
        password: '',
        roles: data.roles?.map((r) => r.name) || [],
        active: data.active === undefined ? true : data.active,
        avatarUrl: data.profileResponse?.avatarUrl || ''
      }
    });
  } catch (err) {
    console.error(`Failed to fetch user ${userId.value}:`, err);
    error.value = 'Could not load user details.';
    resetForm();
  } finally {
    loading.value = false;
  }
};

const triggerAvatarUpload = () => {
  if (isUploading.value) return;
  avatarFileInputRef.value.$el.querySelector('input').click();
};

const handleFileSelect = async (files) => {
  const file = files[0];
  if (!file) {
    avatarFileInput.value = [];
    return;
  }

  isUploading.value = true;
  serverError.value = null;
  const formData = new FormData();
  formData.append('file', file);

  try {
    const uploadResult = await uploadImageApi(formData);
    avatarUrl.value = uploadResult.url;
    serverSuccess.value = "Tải ảnh thành công. Nhấn 'Save Changes' để áp dụng.";
  } catch (err) {
    serverError.value = 'Tải ảnh thất bại. Vui lòng thử lại.';
    console.error('Failed to upload image:', err);
  } finally {
    isUploading.value = false;
    avatarFileInput.value = [];
  }
};

const onSubmit = handleSubmit(async (values) => {
  serverError.value = null;
  serverSuccess.value = null;
  isSubmitting.value = true;
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
        dob: updatedUser.profileResponse?.dob || null,
        city: updatedUser.profileResponse?.city || '',
        password: '',
        roles: updatedUser.roles?.map((r) => r.name) || [],
        active: updatedUser.active === undefined ? true : updatedUser.active,
        avatarUrl: updatedUser.profileResponse?.avatarUrl || ''
      },
      errors: {}
    });
    serverSuccess.value = 'Cập nhật user thành công!';
  } catch (err) {
    console.error('User update failed:', err);
    serverError.value =
      err?.title || err?.message || 'User update failed. Please try again.';
  } finally {
    isSubmitting.value = false;
  }
});

onMounted(fetchUser);

watch(userId, (newId, oldId) => {
  if (newId !== oldId && newId) {
    fetchUser();
  }
});
</script>

<template>
  <v-container>
    <v-btn
      @click="router.back()"
      prepend-icon="mdi-arrow-left"
      variant="text"
      color="grey-darken-1"
      class="mb-4"
    >
      Back to User List
    </v-btn>

    <v-card class="pa-4 pa-md-6">
      <v-card-title
        class="text-h5 font-weight-medium mb-4 d-flex align-center"
      >
        <v-icon start color="primary">mdi-account-edit</v-icon>
        Edit User Details
      </v-card-title>

      <v-card-text>
        <div v-if="loading" class="text-center py-10">
          <v-progress-circular
            indeterminate
            color="primary"
            size="50"
          />
        </div>
        <v-alert v-else-if="error" type="error" variant="tonal" class="mb-4">
          {{ error }}
        </v-alert>
        
        <v-form v-else @submit.prevent="onSubmit">
          <v-snackbar
            v-model="serverSuccess"
            color="success"
            timeout="4000"
            location="top right"
            variant="tonal"
          >
            {{ serverSuccess }}
            <template v-slot:actions>
              <v-btn icon @click="serverSuccess = null" size="small"
                ><v-icon>mdi-close</v-icon></v-btn
              >
            </template>
          </v-snackbar>
          <v-alert
            v-if="serverError"
            type="error"
            variant="tonal"
            density="compact"
            class="mb-4"
          >
            {{ serverError }}
          </v-alert>

          <v-row>
            <v-col cols="12" md="3" class="text-center align-self-start pt-6">
              <v-avatar
                size="120"
                class="elevation-2"
                color="grey-lighten-3"
                style="cursor: pointer"
                @click="triggerAvatarUpload"
              >
                 <v-img 
                    :src="avatarUrl"
                    :alt="user?.username"
                    cover
                  >
                    <template v-slot:placeholder>
                      <v-icon size="50" color="grey">mdi-account-circle</v-icon>
                    </template>
                    <template v-slot:error>
                       <v-icon size="50" color="grey">mdi-account-circle</v-icon>
                    </template>
                  </v-img>
                  
                   <v-overlay
                    v-model="isUploading"
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
              <div class="text-caption text-grey mt-2">Click to upload</div>
              
              <v-file-input
                ref="avatarFileInputRef"
                v-model="avatarFileInput"
                class="d-none"
                accept="image/*"
                @update:modelValue="handleFileSelect"
              />
            </v-col>
            
            <v-col cols="12" md="9">
              <v-text-field
                :model-value="user?.id"
                label="User ID"
                readonly
                disabled
                variant="filled"
                density="comfortable"
              />
              <v-text-field
                :model-value="user?.username"
                label="Username"
                readonly
                disabled
                variant="filled"
                density="comfortable"
                prepend-inner-icon="mdi-account"
                class="mt-4"
              />
            </v-col>
          </v-row>

          <v-text-field
            v-model="avatarUrl"
            label="Avatar URL"
            prepend-inner-icon="mdi-link"
            :error-messages="errors.avatarUrl"
            :disabled="isSubmitting || isUploading"
            variant="outlined"
            density="comfortable"
            placeholder="Upload image or paste URL"
            clearable
            class="mt-4"
          />

          <v-divider class="my-6"></v-divider>

          <v-row>
            <v-col cols="12" md="6">
              <v-text-field
                v-model="firstName"
                label="First Name"
                prepend-inner-icon="mdi-account-outline"
                :error-messages="errors.firstName"
                :disabled="isSubmitting"
                class="mb-2"
                variant="outlined"
                density="comfortable"
              />
            </v-col>Do you see this?
            <v-col cols="12" md="6">
              <v-text-field
                v-model="lastName"
                label="Last Name"
                prepend-inner-icon="mdi-account-outline"
                :error-messages="errors.lastName"
                :disabled="isSubmitting"
                class="mb-2"
                variant="outlined"
                density="comfortable"
              />
            </v-col>
          </v-row>

          <v-text-field
            v-model="email"
            label="Email"
            prepend-inner-icon="mdi-email-outline"
            :error-messages="errors.email"
            :disabled="isSubmitting"
            class="mb-2"
            variant="outlined"
            density="comfortable"
            type="email"
          />

          <v-row>
            <v-col cols="12" md="6">
              <v-menu
                v-model="dobMenu"
                :close-on-content-click="false"
                location="bottom"
              >
                <template v-slot:activator="{ props }">
                  <v-text-field
                    v-model="dob"
                    label="Date of Birth"
                    prepend-inner-icon="mdi-calendar"
                    readonly
                    v-bind="props"
                    :error-messages="errors.dob"
                    :disabled="isSubmitting"
                    placeholder="YYYY-MM-DD"
                    class="mb-2"
                    variant="outlined"
                    density="comfortable"
                    clearable
                    @click:clear="dob = null"
                  />
                </template>
                <v-date-picker
                  v-model="dobForPicker"
                  show-adjacent-months
                  hide-header
                  color="primary"
                />
              </v-menu>
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field
                v-model="city"
                label="City (Optional)"
                prepend-inner-icon="mdi-city-variant-outline"
                :error-messages="errors.city"
                :disabled="isSubmitting"
                class="mb-2"
                variant="outlined"
                density="comfortable"
              />
            </v-col>
          </v-row>

          <v-text-field
            v-model="password"
            label="New Password (optional)"
            placeholder="Leave blank to keep current password"
            :type="showPassword ? 'text' : 'password'"
            prepend-inner-icon="mdi-lock-outline"
            :append-inner-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
            @click:append-inner="showPassword = !showPassword"
            :error-messages="errors.password"
            :disabled="isSubmitting"
            class="mb-2"
            variant="outlined"
            density="comfortable"
            clearable
          />

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

          <v-btn
            type="submit"
            color="primary"
            size="large"
            :loading="isSubmitting"
            :disabled="isSubmitting"
            class="mt-6"
            prepend-icon="mdi-content-save-edit-outline"
          >
            Save Changes
          </v-btn>
        </v-form>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<style scoped>
.v-text-field[readonly='true'] {
  pointer-events: none;
  background-color: #f5f5f5;
}
</style>