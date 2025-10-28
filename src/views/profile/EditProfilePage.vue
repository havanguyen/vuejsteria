<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useForm, useField } from 'vee-validate';
import { toTypedSchema } from '@vee-validate/zod';
import { format, parseISO, isValid as isDateValid } from 'date-fns';
import { useAuthStore } from '@/stores/useAuthStore';
import { getMyInfoApi, updateMyInfoApi } from '@/api/userApi';
import { activeProfileSchema } from '@/validations/profileSchema';

const router = useRouter();
const authStore = useAuthStore();

const loading = ref(true);
const serverError = ref(null);
const serverSuccess = ref(null);
const isSubmitting = ref(false);
const dobMenu = ref(false);
const showPassword = ref(false);
const showConfirmPassword = ref(false);

const { handleSubmit, errors, setValues, resetForm } = useForm({
  validationSchema: toTypedSchema(activeProfileSchema),
  initialValues: {
    firstName: '',
    lastName: '',
    email: '',
    dob: null,
    city: '',
    password: '',
    confirmPassword: '',
  }
});

const { value: firstName } = useField('firstName');
const { value: lastName } = useField('lastName');
const { value: email } = useField('email');
const { value: dob } = useField('dob');
const { value: city } = useField('city');
const { value: password } = useField('password');
const { value: confirmPassword } = useField('confirmPassword');

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

const fetchInitialData = async () => {
  loading.value = true;
  serverError.value = null;
  try {
    const userInfo = await getMyInfoApi();
    setValues({
      firstName: userInfo.profileResponse?.firstName || '',
      lastName: userInfo.profileResponse?.lastName || '',
      email: userInfo.profileResponse?.email || '',
      dob: userInfo.profileResponse?.dob || null,
      city: userInfo.profileResponse?.city || '',
      password: '',
      confirmPassword: '',
    });
  } catch (err) {
    console.error('Failed to fetch user info for editing:', err);
    serverError.value = 'Could not load profile data for editing.';
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

    const updatedUser = await updateMyInfoApi(updateData);

    await authStore.fetchAndSetUser();

    serverSuccess.value = 'Profile updated successfully!';
    resetForm({
        values: {
            firstName: authStore.user?.firstName || '',
            lastName: authStore.user?.lastName || '',
            email: authStore.user?.email || '',
            dob: authStore.user?.dob || null,
            city: authStore.user?.city || '',
            password: '',
            confirmPassword: '',
        },
         errors: {}
    });

  } catch (err) {
    console.error('Profile update failed:', err);
    serverError.value = err?.title || err?.message || 'Profile update failed. Please try again.';
  } finally {
    isSubmitting.value = false;
  }
});

onMounted(fetchInitialData);

</script>

<template>
  <v-container max-width="960">
    <v-btn @click="router.back()" prepend-icon="mdi-arrow-left" variant="text" color="grey-darken-1" class="mb-4">
      Back to Profile
    </v-btn>

    <v-card class="pa-4 pa-md-6">
       <v-card-title class="text-h5 font-weight-medium mb-4 d-flex align-center">
         <v-icon start color="primary">mdi-account-edit-outline</v-icon>
         Edit Your Profile
       </v-card-title>

       <v-card-text>
         <div v-if="loading" class="text-center py-10">
           <v-progress-circular indeterminate color="primary" size="50"/>
         </div>
         <v-alert v-else-if="serverError && !firstName" type="error" variant="tonal" class="mb-4">
           {{ serverError }}
         </v-alert>
          <v-form v-else @submit.prevent="onSubmit">
            <v-snackbar
              v-model="serverSuccess"
              color="success"
              timeout="3000"
              location="top right"
              variant="tonal"
            >
              {{ serverSuccess }}
               <template v-slot:actions>
                  <v-btn icon @click="serverSuccess = null" size="small"><v-icon>mdi-close</v-icon></v-btn>
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
                       max="2020-01-01"
                       min="1920-01-01"
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
              <v-text-field
                v-if="password"
                v-model="confirmPassword"
                label="Confirm New Password"
                 :type="showConfirmPassword ? 'text' : 'password'"
                 prepend-inner-icon="mdi-lock-check-outline"
                 :append-inner-icon="showConfirmPassword ? 'mdi-eye-off' : 'mdi-eye'"
                 @click:append-inner="showConfirmPassword = !showConfirmPassword"
                :error-messages="errors.confirmPassword"
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