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

const notificationStore = useNotificationStore();
const loadingStore = useLoadingStore();

const users = ref([]);
const loading = ref(true);
const error = ref(null);
const search = ref('');

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

const getFullAvatarUrl = (url) => {
  if (!url) return 'https://via.placeholder.com/40';
  return url.startsWith('http') ? url : `${import.meta.env.VITE_API_BASE_URL}/${url}`;
};

const fetchUsers = async () => {
  loading.value = true;
  error.value = null;
  try {
    const data = await getAllUsersApi();
    users.value = data.content;
  } catch (err) {
    error.value = 'Could not load users.';
  } finally {
    loading.value = false;
  }
};

onMounted(fetchUsers);

const editItem = (item) => {
  editedIndex.value = users.value.findIndex((u) => u.id === item.id);
  editedItem.value = JSON.parse(JSON.stringify(item));
  setupFormValues(editedItem.value);
  dialog.value = true;
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
      // 1. DEACTIVATE: Dùng DELETE API (API docs nói nó chuyển sang inactive)
      await deleteUserByAdminApi(targetUserId);
      
      if (index !== -1) {
        users.value[index].active = false;
      }
      notificationStore.showSuccess('User deactivated successfully.'); 
      
    } else {
      // 2. REACTIVATE: Dùng PUT API (Cập nhật isActive: true)
      
      const fullUser = users.value[index];
      
      // Tạo payload cần thiết cho UserUpdateRequest (bao gồm các trường bắt buộc)
      const updateData = {
        firstName: fullUser.profileResponse?.firstName || '',
        lastName: fullUser.profileResponse?.lastName || '',
        email: fullUser.profileResponse?.email || '',
        
        roles: fullUser.roles.map(r => r.name), 
        isActive: true, // <-- Đã đổi từ 'active' sang 'isActive'
        
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

const close = () => {
  dialog.value = false;
  resetForm();
  editedItem.value = { profileResponse: {}, roles: [] };
  editedIndex.value = -1;
  dobForPicker.value = null;
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
  active: z.boolean(), // Vẫn giữ active ở FE để binding với v-switch
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

const onSubmit = handleSubmit(async (values) => {
  serverError.value = null;
  isSubmitting.value = true;
  loadingStore.showLoading();
  try {
    const updateData = { ...values };
    
    // ÁNH XẠ: Đổi 'active' thành 'isActive' cho payload backend
    if (updateData.active !== undefined) {
        updateData.isActive = updateData.active;
        delete updateData.active;
    }
    
    if (!updateData.password) {
      delete updateData.password;
    }
    // Xóa/Null các trường chuỗi rỗng
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

    // Cập nhật đối tượng trong danh sách
    Object.assign(users.value[editedIndex.value], updatedUser);
    notificationStore.showSuccess('User updated successfully!');
    close();
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
</script>

<template>
  <div> 
    <v-container>
      <v-card class="pa-4 pa-md-6" elevation="2">
        <v-card-title class="text-h4 font-weight-medium mb-4 d-flex align-center">
          <v-icon start color="primary" size="36">mdi-account-group</v-icon>
          User Management
        </v-card-title>
        <v-card-text>
          <v-alert
            v-if="error"
            type="error"
            variant="tonal"
            density="compact"
            class="mb-4"
          >
            {{ error }}
          </v-alert>
  
          <v-text-field
            v-model="search"
            label="Search..."
            prepend-inner-icon="mdi-magnify"
            variant="outlined"
            density="comfortable"
            hide-details
            class="mb-4"
            style="max-width: 400px"
          ></v-text-field>
  
          <v-data-table
            :headers="headers"
            :items="users"
            :loading="loading"
            :search="search"
            item-value="id"
            class="elevation-0 border rounded-lg data-table-hover"
            items-per-page="10"
            hover
          >
            <template v-slot:[`item.profileResponse.avatarUrl`]="{ item }">
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
  
            <template v-slot:item.profileResponse\.firstName="{ item }">
              <div class="d-flex align-center py-2">
                <div>
                  <div class="font-weight-medium">
                    {{ item.profileResponse?.firstName || '' }}
                    {{ item.profileResponse?.lastName || '' }}
                  </div>
                  <div class="text-caption text-grey">
                    {{ item.username }}
                  </div>
                </div>
              </div>
            </template>
            <template v-slot:item.profileResponse\.email="{ item }">
              {{ item.profileResponse?.email || '-' }}
            </template>
            <template v-slot:item.active="{ item }">
              <v-chip
                :color="item.active ? 'success' : 'error'"
                size="small"
                label
              >
                {{ item.active ? 'Active' : 'Inactive' }}
              </v-chip>
            </template>
            <template v-slot:item.roles="{ item }">
              <template v-if="item.roles && item.roles.length > 0">
                <v-chip
                  v-for="role in item.roles"
                  :key="role.name"
                  :color="role.name === 'ADMIN' ? 'error' : 'primary'"
                  size="small"
                  class="mr-1"
                  label
                >
                  {{ role.name }}
                </v-chip>
              </template>
              <span v-else class="text-grey">-</span>
            </template>
  
            <template v-slot:item.actions="{ item }">
              <div class="d-flex justify-end">
                <v-btn
                  variant="tonal"
                  color="primary"
                  size="small"
                  class="me-2"
                  @click="editItem(item)"
                  prepend-icon="mdi-pencil"
                >
                  Edit
                  <v-tooltip activator="parent" location="top">Edit</v-tooltip>
                </v-btn>
                <v-btn
                  variant="tonal"
                  :color="item.active ? 'red-darken-1' : 'success'"
                  size="small"
                  @click="confirmToggleActive(item)"
                  :prepend-icon="item.active ? 'mdi-power-off' : 'mdi-power-on'"
                >
                  {{ item.active ? 'Deactivate' : 'Reactivate' }}
                  <v-tooltip activator="parent" location="top">{{ item.active ? 'Deactivate' : 'Reactivate' }}</v-tooltip>
                </v-btn>
              </div>
            </template>
  
            <template v-slot:loading>
              <div class="d-flex justify-center align-center pa-5">
                <v-progress-circular
                  indeterminate
                  color="primary"
                ></v-progress-circular>
              </div>
            </template>
            <template v-slot:no-data>
              <div class="text-center pa-6 text-grey">
                <v-icon size="large" class="mb-2"
                  >mdi-account-search-outline</v-icon
                >
                <div>No users found.</div>
              </div>
            </template>
          </v-data-table>
        </v-card-text>
      </v-card>
    </v-container>
  
    <v-dialog v-model="dialog" max-width="900px" persistent>
      <v-form @submit.prevent="onSubmit">
        <v-card class="pa-2">
          <v-card-title class="text-h5 font-weight-medium pa-4">
            {{ dialogTitle }}
          </v-card-title>
          <v-divider></v-divider>
  
          <v-card-text style="max-height: 80vh; overflow-y: auto" class="py-6">
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
                  class="mb-4"
                />
                <v-text-field
                  :model-value="editedItem?.username"
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
              </v-col>
            </v-row>
          </v-card-text>
  
          <v-divider></v-divider>
          <v-card-actions class="pa-4">
            <v-spacer></v-spacer>
            <v-btn
              color="blue-darken-1"
              variant="text"
              @click="close"
              :disabled="isSubmitting"
            >
              Cancel
            </v-btn>
            <v-btn
              type="submit"
              color="primary"
              :loading="isSubmitting"
              :disabled="isSubmitting"
              variant="flat"
            >
              Save Changes
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-form>
    </v-dialog>
  
    <v-dialog v-model="deleteDialog" max-width="450px">
      <v-card class="pa-2">
        <v-card-title class="text-h5"
          >Confirm Status Change</v-card-title
        >
        <v-card-text>
          Are you sure you want to change the status of user
          <strong>{{ itemToToggle?.username }}</strong
          > to **{{ itemToToggle?.active ? 'Inactive' : 'Active' }}**?
        </v-card-text>
        <v-card-actions class="pa-4">
          <v-spacer></v-spacer>
          <v-btn color="blue-darken-1" variant="text" @click="closeDelete"
            >Cancel</v-btn
          >
          <v-btn 
            :color="itemToToggle?.active ? 'red-darken-1' : 'success'" 
            variant="flat" 
            @click="toggleActiveStatus"
          >
            Confirm {{ itemToToggle?.active ? 'Deactivation' : 'Reactivation' }}
          </v-btn>
          <v-spacer></v-spacer>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<style>
.data-table-hover tbody tr:hover {
  background-color: #f5f5ff !important;
  transition: background-color 0.2s ease-in-out;
}
</style>