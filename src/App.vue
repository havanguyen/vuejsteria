<script setup>
import { computed } from 'vue';
import { useAuthStore } from '@/stores/useAuthStore';

const authStore = useAuthStore();
const isHydrated = computed(() => authStore._hasHydrated);
</script>

<template>
  <v-app>
    <template v-if="!isHydrated">
      <v-main>
        <v-container fluid fill-height>
          <v-row class="fill-height" align="center" justify="center">
            <v-col cols="auto">
              <v-progress-circular indeterminate color="primary" size="64" />
            </v-col>
          </v-row>
        </v-container>
      </v-main>
    </template>
    <template v-else>
      <router-view />
    </template>
  </v-app>
</template>

<style>
html, body, #app, .v-application {
  height: 100%;
}
.fill-height {
  min-height: 100vh;
}
</style>