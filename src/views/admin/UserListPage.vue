<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import { useForm, useField } from 'vee-validate';
import { toTypedSchema } from '@vee-validate/zod';
import * as z from 'zod';
import { format, parseISO, isValid as isDateValid } from 'date-fns';
import {
  getAllUsersApi,
  updateUserByAdminApi,
  deleteUserByAdminApi,
} from '@/api/userApi';
import { useNotificationStore } from '@/stores/useNotificationStore';
import { useLoadingStore } from '@/stores/useLoadingStore';
import ImageUploader from './shared/ImageUploader.vue';
import ManagementPage from './shared/ManagementPage.vue';

const notificationStore = useNotificationStore();
const loadingStore = useLoadingStore();

const users = ref([]);
const loading = ref(true);
const error = ref(null);
const search = ref('');

const pagination = ref({
  page: 1,
  size: 10,
  totalPages: 0,
  totalElements: 0,
});

const dialog = ref(false);
const dialogTitle = computed(() =>
  editedItem.value.id ? 'Edit User' : 'Create User'
);
const editedItem = ref({
  profileResponse: {},
  roles: [],
});
const editedIndex = ref(-1);

const deleteDialog = ref(false);
const itemToToggle = ref(null);
const isSubmitting = ref(false);

const headers = [
  { title: 'Avatar', key: 'profileResponse.avatarUrl', sortable: false, width: '100px' },
  { title: 'Full Name', key: 'profileResponse.firstName' },
  { title: 'Email', key: 'profileResponse.email', sortable: false },
  { title: 'Status', key: 'active', sortable: true },
  { title: 'Roles', key: 'roles', sortable: false },
  { title: 'Actions', key: 'actions', sortable: false, align: 'end' },
];

const api = {
  list: getAllUsersApi,
  // search: searchUsersApi, // Assuming search API exists or will be added
  delete: deleteUserByAdminApi, // This might need adjustment if delete logic is complex
};

const defaultItem = {
  profileResponse: {},
  roles: [],
  active: true
};

const getFullAvatarUrl = (url) => {
  if (!url) return 'https://via.placeholder.com/40';
  return url.startsWith('http') ? url : `${import.meta.env.VITE_API_BASE_URL}/${url}`;
};

// Reuse existing logic but adapt for ManagementPage
const loadUsers = async ({ page, itemsPerPage, sortBy }) => {
  loading.value = true;
  error.value = null;
  try {
    const sort = sortBy.length
      ? `${sortBy[0].key},${sortBy[0].order}`
      : 'id,desc';
    
    const apiPage = page - 1;

    const data = await getAllUsersApi(apiPage, itemsPerPage, sort);
    
    users.value = data.content;
    pagination.value.totalElements = data.totalElements;
    pagination.value.totalPages = data.totalPages;
    pagination.value.page = data.pageable?.pageNumber + 1 || page;
    pagination.value.size = data.pageable?.pageSize || itemsPerPage;
    
    return data; // Return data for ManagementPage
  } catch (err) {
    error.value = 'Could not load users.';
    throw err;
  } finally {
    loading.value = false;
  }
};

const handleOpenDialog = (item) => {
  editedItem.value = item ? JSON.parse(JSON.stringify(item)) : { ...defaultItem };
  setupFormValues(editedItem.value);
};

const confirmToggleActive = (item) => {
  itemToToggle.value = item;
  deleteDialog.value = true;
};

const toggleActiveStatus = async () => {
  if (!itemToToggle.value) return;
  loadingStore.showLoading();
  
  const isCurrentlyActive = itemToToggle.value.active;
  const targetUserId = itemToToggle.value.id;
  const index = users.value.findIndex((u) => u.id === targetUserId);

  try {
    if (isCurrentlyActive) {
      await deleteUserByAdminApi(targetUserId);
      
      if (index !== -1) {
        users.value[index].active = false;
      }
      notificationStore.showSuccess('User deactivated successfully.'); 
      
    } else {
      
      const fullUser = users.value[index];
      
      const updateData = {
        firstName: fullUser.profileResponse?.firstName || '',
        lastName: fullUser.profileResponse?.lastName || '',
        email: fullUser.profileResponse?.email || '',
        
        roles: fullUser.roles.map(r => r.name), 
        isActive: true, 
        
        password: '', 
        dob: fullUser.profileResponse?.dob ? fullUser.profileResponse.dob.split('T')[0] : null,
        city: fullUser.profileResponse?.city || null,
        avatarUrl: fullUser.profileResponse?.avatarUrl || null,
      };
      
      const updatedUser = await updateUserByAdminApi(targetUserId, updateData);
      
      if (index !== -1) {
        Object.assign(users.value[index], updatedUser);
      }
      notificationStore.showSuccess('User reactivated successfully.');
    }
    
  } catch (err) {
    notificationStore.showError(err.message || (isCurrentlyActive ? 'Error deactivating user.' : 'Error reactivating user.'));
  } finally {
    closeDelete();
    loadingStore.hideLoading();
  }
};

const closeDelete = () => {
  deleteDialog.value = false;
  itemToToggle.value = null;
};

const serverError = ref(null);
const dobMenu = ref(false);
const showPassword = ref(false);
const allRoles = ref(['USER', 'ADMIN']);

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
      message: 'Date must be in YYYY-MM-DD format or empty',
    })
    .refine((val) => !val || isValidDateFn(val), {
      message: 'Invalid date provided',
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
    .or(z.literal('')),
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
    avatarUrl: '',
  },
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

const setupFormValues = (data) => {
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
      avatarUrl: data.profileResponse?.avatarUrl || '',
    },
  });
  if (data.profileResponse?.dob) {
    const parsedDate = parseISO(data.profileResponse.dob);
    if (isDateValid(parsedDate)) dobForPicker.value = parsedDate;
  }
};

const onSave = async (item, showError) => {
  serverError.value = null;
  
  const { valid } = await handleSubmit(() => {})(); // Validate form
  if (!valid) return false;

  try {
    const values = {
        firstName: firstName.value,
        lastName: lastName.value,
        email: email.value,
        dob: dob.value,
        city: city.value,
        password: password.value,
        roles: roles.value,
        active: active.value,
        avatarUrl: avatarUrl.value
    };

    const updateData = { ...values };
    
    if (updateData.active !== undefined) {
        updateData.isActive = updateData.active;
        delete updateData.active;
    }
    
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

    const updatedUser = await updateUserByAdminApi(
      editedItem.value.id,
      updateData
    );

    // Update local list
    const index = users.value.findIndex(u => u.id === editedItem.value.id);
    if (index !== -1) {
        Object.assign(users.value[index], updatedUser);
    }
    
    return true;
  } catch (err) {
    console.error('User update failed:', err);
    showError(err?.title || err?.message || (typeof err === 'string' ? err : 'User update failed. Please try again.'));
    return false;
  }
};

const updateDobField = (newDate) => {
  dob.value = newDate ? format(newDate, 'yyyy-MM-dd') : null;
  dobMenu.value = false;
};
</script>

<template>
  <div> 
    <ManagementPage
      title="User Management"
      icon="mdi-account-group"
      :headers="headers"
      :api="api"
      :defaultItem="defaultItem"
      dialogWidth="900px"
      :onSave="onSave"
      :onOpenDialog="handleOpenDialog"
    >
      <template #item.profileResponse.avatarUrl="{ item }">
        <v-avatar size="40" class="my-2" rounded="lg">
          <v-img
            :src="getFullAvatarUrl(item.profileResponse?.avatarUrl)"
            alt="Avatar"
            cover
          >
            <template v-slot:placeholder>
              <v-icon>mdi-account</v-icon>
            </template>
          </v-img>
          <v-tooltip activator="parent" location="end">
            <v-img
              :src="getFullAvatarUrl(item.profileResponse?.avatarUrl)"
              height="150"
              width="150"
              contain
              alt="Avatar preview"
            ></v-img>
          </v-tooltip>
        </v-avatar>
      </template>

      <template #item.profileResponse.firstName="{ item }">
        <div class="d-flex align-center py-2">
          <div>
            <div class="font-weight-medium text-primary">
              {{ item.profileResponse?.firstName || '' }}
              {{ item.profileResponse?.lastName || '' }}
            </div>
            <div class="text-caption text-medium-emphasis">
              @{{ item.username }}
            </div>
          </div>
        </div>
      </template>

      <template #item.profileResponse.email="{ item }">
        <span class="text-body-2">{{ item.profileResponse?.email || '-' }}</span>
      </template>

      <template #item.active="{ item }">
        <v-chip
          :color="item.active ? 'success' : 'error'"
          size="small"
          variant="tonal"
          class="font-weight-bold"
          label
        >
          {{ item.active ? 'Active' : 'Inactive' }}
        </v-chip>
      </template>

      <template #item.roles="{ item }">
        <template v-if="item.roles && item.roles.length > 0">
          <v-chip
            v-for="role in item.roles"
            :key="role.name"
            :color="role.name === 'ADMIN' ? 'error' : 'primary'"
            size="small"
            class="mr-1"
            variant="flat"
          >
            {{ role.name }}
          </v-chip>
        </template>
        <span v-else class="text-medium-emphasis">-</span>
      </template>

      <template #item.actions="{ item }">
        <div class="d-flex justify-end gap-2">
          <v-btn
            icon="mdi-pencil"
            variant="tonal"
            color="primary"
            size="small"
            class="action-btn"
            @click="handleOpenDialog(item)"
          >
            <v-tooltip activator="parent" location="top">Edit</v-tooltip>
          </v-btn>
          <v-btn
            icon="mdi-power"
            variant="tonal"
            :color="item.active ? 'error' : 'success'"
            size="small"
            class="action-btn"
            @click="confirmToggleActive(item)"
          >
            <v-tooltip activator="parent" location="top">{{ item.active ? 'Deactivate' : 'Reactivate' }}</v-tooltip>
          </v-btn>
        </div>
      </template>

      <template #form="{ isSubmitting }">
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

        <v-row>
          <v-col cols="12" md="4">
            <ImageUploader
              label="Avatar"
              v-model="avatarUrl"
              placeholderIcon="mdi-account-circle"
            />
          </v-col>

          <v-col cols="12" md="8">
            <v-text-field
              :model-value="editedItem?.id"
              label="User ID"
              readonly
              disabled
              variant="filled"
              density="comfortable"
              class="mb-4 glass-input"
            />
            <v-text-field
              :model-value="editedItem?.username"
              label="Username"
              readonly
              disabled
              variant="filled"
              density="comfortable"
              prepend-inner-icon="mdi-account"
              class="mb-4 glass-input"
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
                  class="glass-input"
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
                  class="glass-input"
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
              class="glass-input"
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
                      class="glass-input"
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
                  class="glass-input"
                ></v-text-field>
              </v-col>
            </v-row>

            <v-divider class="my-6 opacity-20"></v-divider>
            <h6 class="text-h6 font-weight-medium mb-4 text-primary">
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
              class="glass-input"
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
              class="mb-2 glass-input"
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
          </v-col>
        </v-row>
      </template>
    </ManagementPage>
  
    <v-dialog v-model="deleteDialog" max-width="450px" transition="scale-transition">
      <v-card class="glass-dialog text-center pa-6">
        <v-icon 
          :icon="itemToToggle?.active ? 'mdi-power-off' : 'mdi-power-on'" 
          :color="itemToToggle?.active ? 'error' : 'success'" 
          size="64" 
          class="mb-4 mx-auto"
        ></v-icon>
        <v-card-title class="text-h5 font-weight-bold px-0">Confirm Status Change</v-card-title>
        <v-card-text class="px-0 pb-6 text-medium-emphasis">
          Are you sure you want to change the status of user
          <strong>{{ itemToToggle?.username }}</strong> to <strong>{{ itemToToggle?.active ? 'Inactive' : 'Active' }}</strong>?
        </v-card-text>
        <v-card-actions class="justify-center pa-0 gap-4">
          <v-btn 
            color="grey-darken-1" 
            variant="outlined" 
            @click="closeDelete"
            class="px-6"
            rounded="lg"
          >Cancel</v-btn>
          <v-btn 
            :color="itemToToggle?.active ? 'error' : 'success'" 
            variant="flat" 
            @click="toggleActiveStatus"
            class="px-6"
            rounded="lg"
            elevation="2"
          >
            Confirm {{ itemToToggle?.active ? 'Deactivation' : 'Reactivation' }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<style scoped>
.glass-input :deep(.v-field) {
  background-color: rgba(255, 255, 255, 0.5) !important;
  backdrop-filter: blur(4px);
}

.glass-dialog {
  background: rgba(255, 255, 255, 0.95) !important;
  backdrop-filter: blur(20px);
  border-radius: 24px !important;
}

.action-btn {
  opacity: 0.7;
  transition: all 0.2s ease;
}

.action-btn:hover {
  opacity: 1;
  transform: scale(1.1);
  background-color: rgba(var(--v-theme-primary), 0.1);
}

.gap-2 {
  gap: 8px;
}

.gap-4 {
  gap: 16px;
}

.opacity-20 {
  opacity: 0.2;
}
</style>