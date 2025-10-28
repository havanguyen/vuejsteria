<script setup>
import { ref, onMounted, computed } from 'vue';
import { useAuthStore } from '@/stores/useAuthStore';
import { format, parseISO } from 'date-fns';
import { useRouter } from 'vue-router';

const authStore = useAuthStore();
const router = useRouter();
const profile = ref(null);
const loading = ref(true);
const serverError = ref(null);

const dobFormatted = computed(() => {
    if (profile.value?.dob) {
        try {
            const date = parseISO(profile.value.dob);
            if (!isNaN(date.getTime())) {
                 return format(date, 'MMMM d, yyyy');
            }
        } catch(e) {
            console.error("Error parsing date:", profile.value.dob, e);
        }
         return profile.value.dob;
    }
    return 'Not set';
});

const fetchProfileData = () => {
  loading.value = true;
  serverError.value = null;
  if (authStore.user) {
    profile.value = {
      firstName: authStore.user.firstName,
      lastName: authStore.user.lastName,
      email: authStore.user.email,
      dob: authStore.user.dob,
      city: authStore.user.city,
    };
    loading.value = false;
  } else {
      const unsubscribe = authStore.$subscribe((mutation, state) => {
         if (state.user) {
             profile.value = {
                firstName: state.user.firstName,
                lastName: state.user.lastName,
                email: state.user.email,
                dob: state.user.dob,
                city: state.user.city,
             };
             loading.value = false;
             unsubscribe();
         }
      });

      setTimeout(() => {
          if (loading.value && !profile.value) {
             loading.value = false;
             serverError.value = 'Could not load profile data. User info not available.';
             unsubscribe();
          }
      }, 5000);
  }
};

onMounted(() => {
  if (authStore.isAuthenticated) {
    fetchProfileData();
  } else {
    loading.value = false;
    serverError.value = 'User not authenticated.';
  }
});

authStore.$subscribe((mutation, state) => {
    if(state.user && authStore.isAuthenticated) {
         profile.value = {
            firstName: state.user.firstName,
            lastName: state.user.lastName,
            email: state.user.email,
            dob: state.user.dob,
            city: state.user.city,
         };
    } else {
        profile.value = null;
    }
});

</script>

<template>
  <v-container max-width="960">
    <v-card class="pa-6 elevation-1">
      <v-card-title class="text-h4 font-weight-medium mb-2 d-flex justify-space-between align-center">
        <span>User Profile</span>
         <v-btn
           color="primary"
           variant="outlined"
           prepend-icon="mdi-pencil"
           :to="{ name: 'EditProfile' }"
           :disabled="loading || serverError || !profile"
         >
           Edit Profile
         </v-btn>
      </v-card-title>
      <v-card-text>
        <div v-if="loading" class="text-center py-10">
          <v-progress-circular indeterminate color="primary" size="64"/>
        </div>
        <v-alert
            v-else-if="serverError"
            type="error"
            variant="tonal"
            class="mb-6"
          >
            {{ serverError }}
          </v-alert>
        <div v-else-if="profile">
          <v-list lines="two">
            <v-list-item>
              <template v-slot:prepend>
                <v-icon color="primary">mdi-account</v-icon>
              </template>
              <v-list-item-title class="font-weight-medium">Username</v-list-item-title>
              <v-list-item-subtitle>{{ authStore.user?.username }}</v-list-item-subtitle>
            </v-list-item>
             <v-divider inset></v-divider>
            <v-list-item>
              <template v-slot:prepend>
                <v-icon color="primary">mdi-account-details</v-icon>
              </template>
              <v-list-item-title class="font-weight-medium">Full Name</v-list-item-title>
              <v-list-item-subtitle>{{ profile.firstName || 'Not set' }} {{ profile.lastName || '' }}</v-list-item-subtitle>
            </v-list-item>
             <v-divider inset></v-divider>
            <v-list-item>
                <template v-slot:prepend>
                  <v-icon color="primary">mdi-email</v-icon>
                </template>
                <v-list-item-title class="font-weight-medium">Email</v-list-item-title>
                <v-list-item-subtitle>{{ profile.email || 'Not set' }}</v-list-item-subtitle>
            </v-list-item>
             <v-divider inset></v-divider>
             <v-list-item>
                <template v-slot:prepend>
                  <v-icon color="primary">mdi-calendar</v-icon>
                </template>
                <v-list-item-title class="font-weight-medium">Date of Birth</v-list-item-title>
                <v-list-item-subtitle>{{ dobFormatted }}</v-list-item-subtitle>
            </v-list-item>
             <v-divider inset></v-divider>
            <v-list-item>
              <template v-slot:prepend>
                <v-icon color="primary">mdi-city-variant</v-icon>
              </template>
              <v-list-item-title class="font-weight-medium">City</v-list-item-title>
              <v-list-item-subtitle>{{ profile.city || 'Not set' }}</v-list-item-subtitle>
            </v-list-item>
          </v-list>

        </div>
        <div v-else>
            <p class="text-center text-grey">Profile information is not available.</p>
        </div>
      </v-card-text>
    </v-card>
  </v-container>
</template>