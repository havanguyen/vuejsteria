<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { getUserByIdApi, updateUserByAdminApi } from '@/api/userApi';
import { useForm, useField } from 'vee-validate';
import { toTypedSchema } from '@vee-validate/zod';
import * as z from 'zod';
import { format, parseISO, isValid } from 'date-fns';

const route = useRoute();
const router = useRouter();
const user = ref(null);
const loading = ref(true);
const error = ref(null);
const serverError = ref(null);
const serverSuccess = ref(null);
const isSubmitting = ref(false);
const dobMenu = ref(false);
const showPassword = ref(false);
const allRoles = ref(['USER', 'ADMIN']);

const userId = computed(() => route.params.id);

const isValidDate = (dateString) => {
  if (!dateString) return true;

  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateString)) return false;

  const parts = dateString.split('-');
  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10);
  const day = parseInt(parts[2], 10);

  const date = new Date(Date.UTC(year, month - 1, day));

  return (
    !isNaN(date.getTime()) &&
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
};

const adminUpdateUserSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  dob: z.string()
       .regex(/^\d{4}-\d{2}-\d{2}$/, { message: 'Date of birth must be in YYYY-MM-DD format' })
       .refine(isValidDate, { message: 'Invalid date provided' })
       .nullable().optional(),
  city: z.string().optional(),
  password: z.string().min(6, 'Password must be at least 6 characters').or(z.literal('')).optional(),
  roles: z.array(z.string()).min(1, 'At least one role is required'),
});

const { handleSubmit, errors, setValues, resetForm } = useForm({
  validationSchema: toTypedSchema(adminUpdateUserSchema),
  initialValues: {
    firstName: '',
    lastName: '',
    dob: null,
    city: '',
    password: '',
    roles: [],
  }
});

const { value: firstName } = useField('firstName');
const { value: lastName } = useField('lastName');
const { value: dob } = useField('dob');
const { value: city } = useField('city');
const { value: password } = useField('password');
const { value: roles } = useField('roles');

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
            dob: data.profileResponse?.dob || null,
            city: data.profileResponse?.city || '',
            password: '',
            roles: data.roles?.map(r => r.name) || [],
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

const onSubmit = handleSubmit(async (values) => {
  serverError.value = null;
  serverSuccess.value = null;
  isSubmitting.value = true;
  try {

    const updateData = { ...values };
    if (!updateData.password) {
      delete updateData.password;
    }

    const updatedUser = await updateUserByAdminApi(userId.value, updateData);
    user.value = updatedUser;
     resetForm({
        values: {
            firstName: updatedUser.profileResponse?.firstName || '',
            lastName: updatedUser.profileResponse?.lastName || '',
            dob: updatedUser.profileResponse?.dob || null,
            city: updatedUser.profileResponse?.city || '',
            password: '',
            roles: updatedUser.roles?.map(r => r.name) || [],
        },
        errors: {}
    });
    serverSuccess.value = 'User updated successfully!';

  } catch (err) {
    console.error('User update failed:', err);
    serverError.value = err?.title || err?.message || 'User update failed. Please try again.';
  } finally {
    isSubmitting.value = false;
  }
});


onMounted(fetchUser);


watch(userId, (newId, oldId) => {
    if (newId !== oldId) {
        fetchUser();
    }
});
</script>

<template>
  <v-container>
    <v-btn @click="router.back()" prepend-icon="mdi-arrow-left" variant="text" color="grey-darken-1" class="mb-4">
      Back to User List
    </v-btn>

    <v-card class="pa-4 pa-md-6">
       <v-card-title class="text-h5 font-weight-medium mb-4 d-flex align-center">
         <v-icon start color="primary">mdi-account-edit</v-icon>
         Edit User Details
       </v-card-title>

       <v-card-text>
         <div v-if="loading" class="text-center py-10">
           <v-progress-circular indeterminate color="primary" size="50"/>
         </div>
         <v-alert v-else-if="error" type="error" variant="tonal" class="mb-4">
           {{ error }}
         </v-alert>
          <v-form v-else @submit.prevent="onSubmit">
            <v-snackbar
              v-model="serverSuccess"
              color="success"
              timeout="3000"
              location="top right"
            >
              {{ serverSuccess }}
               <template v-slot:actions>
                  <v-btn icon @click="serverSuccess = null"><v-icon>mdi-close</v-icon></v-btn>
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

            <v-text-field
              :model-value="user?.id"
              label="User ID"
              readonly
              disabled
              variant="filled"
              density="comfortable"
              class="mb-3"
            />
            <v-text-field
              :model-value="user?.username"
              label="Username"
              readonly
              disabled
              variant="filled"
              density="comfortable"
              prepend-inner-icon="mdi-account"
              class="mb-3"
            />

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
                </v-col>
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
.v-text-field[readonly="true"]{
    pointer-events: none;
    background-color: #f5f5f5;
}
</style>