<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <v-btn
          variant="text"
          prepend-icon="mdi-arrow-left"
          @click="router.push({ name: 'AdminUserList' })"
          class="mb-4 text-capitalize"
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
        <v-alert type="error" variant="tonal" class="mb-4 glass-card">
          {{ error }}
        </v-alert>
      </v-col>

      <template v-else>
        <v-col cols="12" md="4">
          <v-card class="glass-card pa-4 pa-md-6 rounded-xl elevation-4 mb-6">
            <v-card-title class="text-h6 font-weight-bold mb-4">
              Profile Picture
            </v-card-title>
            <v-card-text class="text-center">
              <v-avatar
                size="180"
                class="elevation-2 mb-4 avatar-glow"
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
                class="mb-2 w-100 rounded-lg text-capitalize"
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
                class="mt-2"
              ></v-text-field>
            </v-card-text>
          </v-card>
        </v-col>

        <v-col cols="12" md="8">
          <v-card class="glass-card rounded-xl elevation-4 overflow-hidden">
            <v-tabs
              v-model="activeTab"
              color="primary"
              align-tabs="start"
              class="border-bottom"
            >
              <v-tab value="details" class="text-capitalize">User Details</v-tab>
              <v-tab value="history" class="text-capitalize">Purchase History</v-tab>
            </v-tabs>

            <v-window v-model="activeTab">
              <v-window-item value="details">
                <div class="pa-4 pa-md-6">
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

                    <v-row>
                      <v-col cols="12" sm="6">
                        <v-text-field
                          :model-value="user?.id"
                          label="User ID"
                          readonly
                          disabled
                          variant="filled"
                          density="comfortable"
                        />
                      </v-col>
                      <v-col cols="12" sm="6">
                        <v-text-field
                          :model-value="user?.username"
                          label="Username"
                          readonly
                          disabled
                          variant="filled"
                          density="comfortable"
                          prepend-inner-icon="mdi-account"
                        />
                      </v-col>
                    </v-row>

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
                      class="mb-2"
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

                    <v-divider class="my-6 opacity-20"></v-divider>
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
                      class="mb-2"
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
                        class="text-capitalize rounded-lg"
                      >
                        Save Changes
                      </v-btn>
                    </v-card-actions>
                  </v-form>
                </div>
              </v-window-item>

              <v-window-item value="history">
                <div class="pa-4">
                  <v-skeleton-loader
                    v-if="loadingOrders"
                    type="table-heading, list-item-two-line@3"
                    class="bg-transparent"
                  ></v-skeleton-loader>
                  
                  <div v-else-if="userOrders.length === 0" class="text-center py-8">
                    <v-icon size="48" color="grey-lighten-1" class="mb-2">mdi-cart-off</v-icon>
                    <div class="text-body-1 text-medium-emphasis">No orders found for this user.</div>
                  </div>

                  <v-data-table
                    v-else
                    :headers="orderHeaders"
                    :items="userOrders"
                    :sort-by="[{ key: 'createdAt', order: 'desc' }]"
                    class="bg-transparent"
                    hover
                  >
                    <template v-slot:item.id="{ item }">
                      <span class="font-weight-medium text-primary">#{{ item.id.substring(0, 8) }}...</span>
                    </template>

                    <template v-slot:item.createdAt="{ item }">
                      {{ formatDateTime(item.createdAt) }}
                    </template>

                    <template v-slot:item.totalAmount="{ item }">
                      <span class="font-weight-bold">{{ formatPrice(item.totalAmount) }}</span>
                    </template>

                    <template v-slot:item.orderStatus="{ item }">
                      <v-chip
                        :color="getStatusColor(item.orderStatus)"
                        size="small"
                        label
                        class="font-weight-medium"
                      >
                        {{ item.orderStatus }}
                      </v-chip>
                    </template>

                    <template v-slot:item.actions="{ item }">
                      <div class="d-flex gap-2">
                        <v-btn
                          :to="{ name: 'OrderDetail', params: { id: item.id } }"
                          variant="tonal"
                          color="primary"
                          size="small"
                          icon="mdi-eye"
                          v-tooltip="'View Details'"
                        ></v-btn>
                        <v-btn
                          variant="tonal"
                          color="error"
                          size="small"
                          icon="mdi-delete"
                          @click="confirmDeleteOrder(item)"
                          v-tooltip="'Delete Order'"
                        ></v-btn>
                      </div>
                    </template>
                  </v-data-table>
                </div>
              </v-window-item>
            </v-window>
          </v-card>
        </v-col>
      </template>
    </v-row>

    <!-- Delete Order Confirmation Dialog -->
    <v-dialog v-model="deleteDialog" max-width="400" class="glass-dialog">
      <v-card class="rounded-xl pa-4">
        <v-card-title class="text-h6 font-weight-bold">Confirm Delete</v-card-title>
        <v-card-text>
          Are you sure you want to delete order <span class="font-weight-bold">#{{ orderToDelete?.id.substring(0, 8) }}</span>? This action cannot be undone.
        </v-card-text>
        <v-card-actions class="justify-end pt-4">
          <v-btn
            variant="text"
            color="grey-darken-1"
            @click="deleteDialog = false"
            class="text-capitalize"
          >
            Cancel
          </v-btn>
          <v-btn
            color="error"
            variant="flat"
            :loading="isDeleting"
            @click="handleDeleteOrder"
            class="text-capitalize rounded-lg"
          >
            Delete
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { getUserByIdApi, updateUserByAdminApi } from '@/api/userApi';
import { uploadImageApi } from '@/api/fileApi';
import { getAllOrdersApi, deleteOrderApi } from '@/api/orderApi';
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
const activeTab = ref('details');

// Order History State
const userOrders = ref([]);
const loadingOrders = ref(false);
const deleteDialog = ref(false);
const orderToDelete = ref(null);
const isDeleting = ref(false);

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

const orderHeaders = [
  { title: 'Order ID', key: 'id', align: 'start' },
  { title: 'Date', key: 'createdAt', align: 'start' },
  { title: 'Total', key: 'totalAmount', align: 'end' },
  { title: 'Status', key: 'orderStatus', align: 'center' },
  { title: 'Actions', key: 'actions', align: 'end', sortable: false },
];

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

const fetchUserOrders = async () => {
  if (!userId.value) return;
  loadingOrders.value = true;
  try {
    const allOrders = await getAllOrdersApi();
    // Filter orders for the current user
    userOrders.value = allOrders.filter(order => order.userId === userId.value);
  } catch (err) {
    console.error('Failed to fetch orders:', err);
    notificationStore.showError('Failed to load user purchase history');
  } finally {
    loadingOrders.value = false;
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
      err?.title || err?.message || (typeof err === 'string' ? err : 'User update failed. Please try again.');
  } finally {
    isSubmitting.value = false;
    loadingStore.hideLoading();
  }
});

const updateDobField = (newDate) => {
  dob.value = newDate ? format(newDate, 'yyyy-MM-dd') : null;
  dobMenu.value = false;
};

const confirmDeleteOrder = (order) => {
  orderToDelete.value = order;
  deleteDialog.value = true;
};

const handleDeleteOrder = async () => {
  if (!orderToDelete.value) return;
  isDeleting.value = true;
  try {
    await deleteOrderApi(orderToDelete.value.id);
    notificationStore.showSuccess('Order deleted successfully');
    await fetchUserOrders(); // Refresh list
    deleteDialog.value = false;
  } catch (err) {
    notificationStore.showError(err.message || 'Failed to delete order');
  } finally {
    isDeleting.value = false;
    orderToDelete.value = null;
  }
};

const formatPrice = (value) => {
  if (!value) return '0 ₫';
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(value);
};

const formatDateTime = (dateTimeString) => {
  if (!dateTimeString) return 'N/A';
  try {
    return new Date(dateTimeString).toLocaleString('vi-VN');
  } catch (e) {
    return dateTimeString;
  }
};

const getStatusColor = (status) => {
  switch (status) {
    case 'PENDING': return 'warning';
    case 'SUCCESS':
    case 'COMPLETED': return 'success';
    case 'CANCELLED':
    case 'FAILED': return 'error';
    default: return 'grey';
  }
};

onMounted(() => {
  fetchUser();
});

watch(userId, (newId, oldId) => {
  if (newId !== oldId && newId) {
    fetchUser();
    if (activeTab.value === 'history') {
      fetchUserOrders();
    }
  }
});

watch(activeTab, (newTab) => {
  if (newTab === 'history') {
    fetchUserOrders();
  }
});
</script>

<style scoped>
.glass-card {
  background: rgba(255, 255, 255, 0.6) !important;
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.5);
  border-radius: 16px !important;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.05) !important;
}

.glass-dialog {
  backdrop-filter: blur(10px);
}

.avatar-glow {
  box-shadow: 0 0 0 4px rgba(var(--v-theme-primary), 0.1);
}

.opacity-20 {
  opacity: 0.2;
}

.gap-2 {
  gap: 8px;
}

.border-bottom {
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}
</style>