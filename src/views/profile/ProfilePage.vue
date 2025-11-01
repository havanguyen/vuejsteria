<template>
  <v-container>
    <v-row justify="center">
      <v-col cols="12" md="8" lg="6">
        <v-card v-if="user" class="elevation-2">
          <v-card-title class="text-h5 text-center pa-4">
            Account Information
          </v-card-title>
          <v-divider></v-divider>

          <v-row justify="center" class="pa-4">
            <v-avatar size="150" class="elevation-2">
              <v-img
                :src="
                  user.profileResponse?.avatarUrl ||
                  'https://via.placeholder.com/150'
                "
                alt="User Avatar"
                cover
              ></v-img>
            </v-avatar>
          </v-row>

          <v-card-text>
            <v-list dense>
              <v-list-item>
                <template v-slot:prepend>
                  <v-icon>mdi-account</v-icon>
                </template>
                <v-list-item-title
                  ><strong>Username:</strong> {{ user.username }}</v-list-item-title
                >
              </v-list-item>

              <v-list-item>
                <template v-slot:prepend>
                  <v-icon>mdi-account-details</v-icon>
                </template>
                <v-list-item-title
                  ><strong>Full Name:</strong>
                  {{ user.profileResponse?.firstName }}
                  {{ user.profileResponse?.lastName }}</v-list-item-title
                >
              </v-list-item>

              <v-list-item>
                <template v-slot:prepend>
                  <v-icon>mdi-email</v-icon>
                </template>
                <v-list-item-title
                  ><strong>Email:</strong> {{ user.profileResponse?.email }}</v-list-item-title
                >
              </v-list-item>

              <v-list-item>
                <template v-slot:prepend>
                  <v-icon>mdi-calendar</v-icon>
                </template>
                <v-list-item-title
                  ><strong>Date of Birth:</strong>
                  {{ formattedDob }}</v-list-item-title
                >
              </v-list-item>

              <v-list-item>
                <template v-slot:prepend>
                  <v-icon>mdi-city</v-icon>
                </template>
                <v-list-item-title
                  ><strong>City:</strong> {{ user.profileResponse?.city }}</v-list-item-title
                >
              </v-list-item>
            </v-list>
          </v-card-text>

          <v-divider></v-divider>

          <v-card-actions class="pa-4">
            <v-btn
              color="primary"
              variant="flat"
              block
              large
              :to="{ name: 'EditProfile' }"
            >
              Edit Profile
            </v-btn>
          </v-card-actions>
        </v-card>

        <v-alert v-else type="info" prominent>
          Loading user data or profile not found...
        </v-alert>
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
          timeZone: 'UTC'
        }
      );
    } catch (e) {
      return user.value.profileResponse.dob;
    }
  }
  return 'Not set';
});
</script>