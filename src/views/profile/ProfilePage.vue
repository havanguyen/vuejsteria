<script setup>
import { ref, onMounted, computed } from 'vue';
import { useForm, useField } from 'vee-validate';
import { toTypedSchema } from '@vee-validate/zod';
import { profileUpdateSchema } from '@/validations/profileSchema';
import { getProfileApi, updateProfileApi } from '@/api/profileApi';
import { useAuthStore } from '@/stores/useAuthStore';
import { format, parseISO } from 'date-fns';

const authStore = useAuthStore();
const profile = ref(null);
const loading = ref(true);
const serverError = ref(null);
const serverSuccess = ref(null);
const isSubmitting = ref(false);
const dobMenu = ref(false);

const { handleSubmit, errors, setValues, resetForm } = useForm({
  validationSchema: toTypedSchema(profileUpdateSchema),
  initialValues: {
    firstName: '',
    lastName: '',
    dob: '',
    city: '',
  }
});

const { value: firstName } = useField('firstName');
const { value: lastName } = useField('lastName');
const { value: dob } = useField('dob');
const { value: city } = useField('city');

const dobForPicker = computed({
  get: () => {
    try {
      return dob.value ? parseISO(dob.value) : null;
    } catch {
      return null;
    }
  },
  set: (val) => {
    dob.value = val ? format(val, 'yyyy-MM-dd') : '';
    dobMenu.value = false;
  }
});

const fetchProfile = async () => {
  loading.value = true;
  serverError.value = null;
  try {
    const profileId = authStore.profileId;
    if (!profileId) {
       console.log('No profile ID found in store, attempting to use initial user info or defaults.');
       setValues({
            firstName: authStore.user?.firstName || '',
            lastName: authStore.user?.lastName || '',
            dob: '',
            city: '',
       });
       loading.value = false;
       return;
    }
    
    const profileData = await getProfileApi(profileId);
    profile.value = profileData;
    setValues({
      firstName: profileData.firstName || '',
      lastName: profileData.lastName || '',
      dob: profileData.dob || '',
      city: profileData.city || '',
    });
  } catch (err) {
    console.error('Failed to fetch profile:', err);
    serverError.value = 'Could not load profile data.';
     setValues({
        firstName: authStore.user?.firstName || '',
        lastName: authStore.user?.lastName || '',
        dob: '',
        city: '',
     });
  } finally {
    loading.value = false;
  }
};

const onSubmit = handleSubmit(async (values) => {
  serverError.value = null;
  serverSuccess.value = null;
  isSubmitting.value = true;
  try {
    const userId = authStore.userId;

    if (!userId) {
         throw new Error('User ID not found in auth store. Cannot update profile.');
    }

    const updatedProfileData = await updateProfileApi(userId, values);
    serverSuccess.value = 'Profile updated successfully!';
    
    await authStore.fetchAndSetUser();

    setValues({
        firstName: updatedProfileData.firstName || '',
        lastName: updatedProfileData.lastName || '',
        dob: updatedProfileData.dob || '',
        city: updatedProfileData.city || '',
    });
    profile.value = updatedProfileData;

  } catch (err) {
    console.error('Profile update failed:', err);
    serverError.value = err?.title || err?.message || 'Profile update failed. Please try again.';
  } finally {
    isSubmitting.value = false;
  }
});

onMounted(() => {
  if (authStore.isAuthenticated) {
    if (authStore.userId) {
        fetchProfile();
    } else {
        const unsubscribe = authStore.$subscribe((mutation, state) => {
            if (state.user?.id) {
                fetchProfile();
                unsubscribe();
            }
        });
        if (authStore.userId) {
             fetchProfile();
             unsubscribe();
        }
    }
  } else {
    loading.value = false;
    serverError.value = 'User not authenticated.';
    resetForm();
  }
});
</script>

<template>
  <v-container max-width="960">
    <v-card class="pa-6 elevation-1">
      <v-card-title class="text-h4 font-weight-medium mb-6">
        User Profile
      </v-card-title>
      <v-card-text>
        <div v-if="loading" class="text-center py-10">
          <v-progress-circular indeterminate color="primary" size="64"/>
        </div>
        <v-alert
            v-else-if="serverError && !profile && !firstName && !lastName"
            type="error"
            variant="tonal"
            class="mb-6"
          >
            {{ serverError }}
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

          <div class="mb-5">
             <div class="text-caption text-grey">Username</div>
             <div class="d-flex align-center">
                 <v-icon start color="grey-darken-1">mdi-account</v-icon>
                 <span class="font-weight-medium">{{ authStore.user?.username }}</span>
             </div>
          </div>

          <v-row>
            <v-col cols="12" md="6">
              <v-text-field
                v-model="firstName"
                label="First Name"
                prepend-inner-icon="mdi-account-outline"
                :error-messages="errors.firstName"
                :disabled="isSubmitting"
                class="mb-3"
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
                class="mb-3"
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
                       class="mb-3"
                       variant="outlined"
                       density="comfortable"
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
                class="mb-3"
                variant="outlined"
                density="comfortable"
              />
            </v-col>
          </v-row>

          <v-btn
            type="submit"
            color="primary"
            size="large"
            :loading="isSubmitting"
            :disabled="isSubmitting"
            class="mt-6"
            prepend-icon="mdi-check-circle-outline"
          >
            {{ profile ? 'Update Profile' : 'Create Profile' }}
          </v-btn>
        </v-form>
      </v-card-text>
    </v-card>
  </v-container>
</template>