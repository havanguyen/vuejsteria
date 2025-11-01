<template>
  <v-container>
    <v-row justify="center">
      <v-col cols="12" md="8">
        <v-card class="pa-4 pa-md-6">
          <v-card-title class="text-h5 font-weight-medium mb-4 d-flex justify-space-between align-center">
            <span>Thông tin cá nhân</span>
            <v-btn
              color="primary"
              variant="outlined"
              :to="{ name: 'EditProfile' }"
            >
              Chỉnh sửa
            </v-btn>
          </v-card-title>
          <v-divider></v-divider>

          <template v-if="authStore.isProfileLoading">
            <v-skeleton-loader
              class="pa-4"
              type="list-item-avatar-two-line, list-item-two-line, list-item-two-line"
            ></v-skeleton-loader>
          </template>

          <template v-else-if="userProfile">
             <v-card-text class="d-flex flex-column align-center pa-6">
                <v-avatar size="100" class="mb-4 elevation-2" color="grey-lighten-3">
                  <v-img 
                    :src="userProfile.profile?.avatarUrl" 
                    :alt="userProfile.username"
                  >
                    <template v-slot:placeholder>
                      <v-icon size="60" color="grey">mdi-account-circle</v-icon>
                    </template>
                    <template v-slot:error>
                       <v-icon size="60" color="grey">mdi-account-circle</v-icon>
                    </template>
                  </v-img>
                </v-avatar>
                <h2 class="text-h5 font-weight-medium">{{ userProfile.username }}</h2>
                <div class="text-medium-emphasis">{{ userProfile.profile?.email || 'Chưa cập nhật email' }}</div>
             </v-card-text>

            <v-divider></v-divider>

            <v-list density="compact" lines="two">
              <v-list-item>
                <template v-slot:prepend>
                  <v-icon color="primary">mdi-account-outline</v-icon>
                </template>
                <v-list-item-title>Họ</v-list-item-title>
                <v-list-item-subtitle>{{
                  userProfile.profile?.firstName || 'Chưa cập nhật'
                }}</v-list-item-subtitle>
              </v-list-item>
              
              <v-list-item>
                <template v-slot:prepend>
                  <v-icon color="primary">mdi-account-outline</v-icon>
                </template>
                <v-list-item-title>Tên</v-list-item-title>
                <v-list-item-subtitle>{{
                  userProfile.profile?.lastName || 'Chưa cập nhật'
                }}</v-list-item-subtitle>
              </v-list-item>
              
              <v-list-item>
                <template v-slot:prepend>
                  <v-icon color="primary">mdi-calendar</v-icon>
                </template>
                <v-list-item-title>Ngày sinh</v-list-item-title>
                <v-list-item-subtitle>{{
                  userProfile.profile?.dob || 'Chưa cập nhật'
                }}</v-list-item-subtitle>
              </v-list-item>
              
              <v-list-item>
                <template v-slot:prepend>
                  <v-icon color="primary">mdi-city-variant-outline</v-icon>
                </template>
                <v-list-item-title>Thành phố</v-list-item-title>
                <v-list-item-subtitle>{{
                  userProfile.profile?.city || 'Chưa cập nhật'
                }}</v-list-item-subtitle>
              </v-list-item>
            </v-list>
          </template>

          <v-card-text v-else>
            <v-alert type="warning">Không tải được thông tin hồ sơ.</v-alert>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { useAuthStore } from '@/stores/useAuthStore';
import { storeToRefs } from 'pinia';

const authStore = useAuthStore();
const { user: userProfile } = storeToRefs(authStore);
</script>