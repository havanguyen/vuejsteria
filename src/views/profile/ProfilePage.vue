<template>
  <v-container>
    <v-row justify="center">
      <v-col cols="12" md="4">
        <v-slide-x-transition appear>
          <v-card class="pa-4 pa-md-6 text-center">
            <v-card-text>
              <v-avatar size="200" class="avatar-glow mb-6">
                <v-img
                  :src="
                    user?.profileResponse?.avatarUrl ||
                    'https://via.placeholder.com/200/E0E0E0/FFFFFF?text=No+Avatar'
                  "
                  alt="User Avatar"
                  cover
                >
                  <template v-slot:placeholder>
                    <v-icon size="100" color="grey-darken-1"
                      >mdi-account-circle</v-icon
                    >
                  </template>
                  <template v-slot:error>
                    <v-icon size="100" color="grey-darken-1"
                      >mdi-account-circle</v-icon
                    >
                  </template>
                </v-img>
              </v-avatar>

              <h2 class="text-h4 font-weight-bold">
                {{ user?.profileResponse?.firstName }}
                {{ user?.profileResponse?.lastName }}
              </h2>
              <p class="text-h6 text-medium-emphasis font-weight-light mb-8">
                {{ user?.username }}
              </p>

              <v-btn
                color="primary"
                variant="flat"
                block
                size="large"
                :to="{ name: 'EditProfile' }"
                class="hover-lift"
                prepend-icon="mdi-account-edit"
              >
                Edit Profile
              </v-btn>
            </v-card-text>
          </v-card>
        </v-slide-x-transition>
      </v-col>

      <v-col cols="12" md="8">
        <v-slide-x-reverse-transition appear>
          <v-card class="pa-4 pa-md-6">
            <v-card-title class="text-h5 font-weight-bold mb-4">
              Account Information
            </v-card-title>
            <v-divider class="mb-4"></v-divider>

            <v-card-text v-if="user">
              <v-list lines="two" class="bg-transparent">
                <v-list-item class="mb-2">
                  <template v-slot:prepend>
                    <v-avatar
                      color="primary"
                      variant="tonal"
                      icon="mdi-email-outline"
                    ></v-avatar>
                  </template>
                  <v-list-item-title class="font-weight-bold"
                    >Email Address</v-list-item-title
                  >
                  <v-list-item-subtitle>{{
                    user.profileResponse?.email || 'Not set'
                  }}</v-list-item-subtitle>
                </v-list-item>

                <v-divider inset class="my-2"></v-divider>

                <v-list-item class="mb-2">
                  <template v-slot:prepend>
                    <v-avatar
                      color="primary"
                      variant="tonal"
                      icon="mdi-calendar-blank-outline"
                    ></v-avatar>
                  </template>
                  <v-list-item-title class="font-weight-bold"
                    >Date of Birth</v-list-item-title
                  >
                  <v-list-item-subtitle>{{
                    formattedDob
                  }}</v-list-item-subtitle>
                </v-list-item>

                <v-divider inset class="my-2"></v-divider>

                <v-list-item>
                  <template v-slot:prepend>
                    <v-avatar
                      color="primary"
                      variant="tonal"
                      icon="mdi-city-variant-outline"
                    ></v-avatar>
                  </template>
                  <v-list-item-title class="font-weight-bold"
                    >City</v-list-item-title
                  >
                  <v-list-item-subtitle>{{
                    user.profileResponse?.city || 'Not set'
                  }}</v-list-item-subtitle>
                </v-list-item>
              </v-list>
            </v-card-text>

            <v-alert v-else type="info" variant="tonal" prominent>
              Loading user data or profile not found...
            </v-alert>
          </v-card>
        </v-slide-x-reverse-transition>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { computed } from 'vue';
import { storeToRefs } from 'pinia';
import { useAuthStore } from '@/stores/useAuthStore';

const authStore = useAuthStore();
const { user } = storeToRefs(authStore);

const formattedDob = computed(() => {
  if (user.value && user.value.profileResponse?.dob) {
    try {
      return new Date(user.value.profileResponse.dob).toLocaleDateString(
        'en-US',
        {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          timeZone: 'UTC',
        }
      );
    } catch (e) {
      return user.value.profileResponse.dob;
    }
  }
  return 'Not set';
});
</script>

<style>
.avatar-glow {
  border: 4px solid rgba(255, 255, 255, 0.7);
  box-shadow:
    0 0 20px rgba(255, 255, 255, 0.5),
    0 0 30px rgba(11, 87, 208, 0.4);
}

.hover-lift {
  transition:
    all 0.2s ease-out !important;
}
.hover-lift:hover {
  transform: translateY(-2px);
  box-shadow: 0px 6px 15px rgba(0, 0, 0, 0.2) !important;
}
</style>