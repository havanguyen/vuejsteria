<template>
  <v-container class="py-8">
    <v-row justify="center">
      <!-- Left Column: Profile Card -->
      <v-col cols="12" md="4">
        <v-slide-x-transition appear>
          <v-card class="glass-card profile-card text-center overflow-visible mt-12">
            <!-- Decorative Banner -->
            <div class="profile-banner"></div>

            <v-card-text class="pt-0 relative">
              <!-- Avatar -->
              <div class="avatar-wrapper">
                <v-avatar size="160" class="profile-avatar elevation-6">
                  <v-img
                    :src="
                      user?.profileResponse?.avatarUrl ||
                      'https://via.placeholder.com/200/E0E0E0/FFFFFF?text=No+Avatar'
                    "
                    alt="User Avatar"
                    cover
                  >
                    <template v-slot:placeholder>
                      <div class="d-flex align-center justify-center fill-height bg-grey-lighten-3">
                        <v-icon size="80" color="grey-darken-1">mdi-account</v-icon>
                      </div>
                    </template>
                    <template v-slot:error>
                      <div class="d-flex align-center justify-center fill-height bg-grey-lighten-3">
                        <v-icon size="80" color="grey-darken-1">mdi-account-off</v-icon>
                      </div>
                    </template>
                  </v-img>
                </v-avatar>
                <div class="status-indicator"></div>
              </div>

              <!-- Name & Username -->
              <h2 class="text-h4 font-weight-bold mt-4 text-truncate">
                {{ user?.profileResponse?.firstName }} {{ user?.profileResponse?.lastName }}
              </h2>
              <p class="text-subtitle-1 text-medium-emphasis mb-2">@{{ user?.username }}</p>

              <!-- Roles -->
              <div class="d-flex justify-center gap-2 mb-6 flex-wrap">
                <v-chip
                  v-for="role in userRoles"
                  :key="role"
                  color="primary"
                  variant="flat"
                  size="small"
                  class="font-weight-bold text-uppercase px-4"
                  elevation="2"
                >
                  {{ role }}
                </v-chip>
              </div>

              <!-- Edit Button -->
              <v-btn
                color="primary"
                block
                size="large"
                rounded="xl"
                :to="{ name: 'EditProfile' }"
                class="hover-lift font-weight-bold"
                prepend-icon="mdi-account-edit-outline"
                elevation="4"
              >
                Edit Profile
              </v-btn>
            </v-card-text>
          </v-card>
        </v-slide-x-transition>
      </v-col>

      <!-- Right Column: Details -->
      <v-col cols="12" md="8">
        <v-slide-x-reverse-transition appear>
          <v-card class="glass-card fill-height pa-2 pa-md-4 mt-md-12">
            <v-card-title class="d-flex align-center text-h5 font-weight-bold mb-2 px-4 pt-4">
              <v-icon color="primary" class="mr-3" size="32">mdi-shield-account-outline</v-icon>
              Account Information
            </v-card-title>
            
            <v-divider class="mx-4 mb-4 opacity-20"></v-divider>

            <v-card-text v-if="user">
              <v-row>
                <v-col cols="12" sm="6">
                  <div class="info-item pa-4 rounded-lg bg-surface-variant-lighten">
                    <div class="d-flex align-center mb-2 text-primary">
                      <v-icon class="mr-2">mdi-email-outline</v-icon>
                      <span class="text-caption font-weight-bold text-uppercase">Email Address</span>
                    </div>
                    <div class="text-body-1 font-weight-medium text-truncate">
                      {{ user.profileResponse?.email || 'Not set' }}
                    </div>
                  </div>
                </v-col>

                <v-col cols="12" sm="6">
                  <div class="info-item pa-4 rounded-lg bg-surface-variant-lighten">
                    <div class="d-flex align-center mb-2 text-primary">
                      <v-icon class="mr-2">mdi-cake-variant-outline</v-icon>
                      <span class="text-caption font-weight-bold text-uppercase">Date of Birth</span>
                    </div>
                    <div class="text-body-1 font-weight-medium">
                      {{ formattedDob }}
                    </div>
                  </div>
                </v-col>

                <v-col cols="12" sm="6">
                  <div class="info-item pa-4 rounded-lg bg-surface-variant-lighten">
                    <div class="d-flex align-center mb-2 text-primary">
                      <v-icon class="mr-2">mdi-city-variant-outline</v-icon>
                      <span class="text-caption font-weight-bold text-uppercase">City</span>
                    </div>
                    <div class="text-body-1 font-weight-medium">
                      {{ user.profileResponse?.city || 'Not set' }}
                    </div>
                  </div>
                </v-col>

                <v-col cols="12" sm="6">
                  <div class="info-item pa-4 rounded-lg bg-surface-variant-lighten">
                    <div class="d-flex align-center mb-2 text-primary">
                      <v-icon class="mr-2">mdi-clock-outline</v-icon>
                      <span class="text-caption font-weight-bold text-uppercase">Member Since</span>
                    </div>
                    <div class="text-body-1 font-weight-medium">
                      Just now
                    </div>
                  </div>
                </v-col>
              </v-row>
            </v-card-text>

            <v-alert v-else type="info" variant="tonal" class="mx-4" icon="mdi-loading mdi-spin">
              Loading user profile...
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
const { user, userRoles } = storeToRefs(authStore);

const formattedDob = computed(() => {
  if (user.value && user.value.profileResponse?.dob) {
    try {
      return new Date(user.value.profileResponse.dob).toLocaleDateString(
        'en-US',
        {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        }
      );
    } catch (e) {
      return user.value.profileResponse.dob;
    }
  }
  return 'Not set';
});
</script>

<style scoped>
.glass-card {
  background: rgba(255, 255, 255, 0.8) !important;
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.5);
  border-radius: 24px !important;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1) !important;
}

.profile-banner {
  height: 140px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 24px 24px 0 0;
  margin: -1px -1px 0; /* Fix border radius clipping */
}

.avatar-wrapper {
  margin-top: -80px;
  position: relative;
  display: inline-block;
}

.profile-avatar {
  border: 4px solid white;
}

.status-indicator {
  position: absolute;
  bottom: 10px;
  right: 10px;
  width: 24px;
  height: 24px;
  background: #4caf50;
  border: 3px solid white;
  border-radius: 50%;
  box-shadow: 0 2px 4px rgba(0,0,0,0.2);
}

.bg-surface-variant-lighten {
  background-color: rgba(var(--v-theme-surface-variant), 0.05);
  transition: all 0.2s ease;
}

.info-item:hover {
  background-color: rgba(var(--v-theme-surface-variant), 0.1);
  transform: translateY(-2px);
}

.gap-2 {
  gap: 8px;
}

.hover-lift {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.hover-lift:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(var(--v-theme-primary), 0.3) !important;
}
</style>