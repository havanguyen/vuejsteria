<script setup>
import Header from './Header.vue';
import Footer from './Footer.vue';
</script>

<template>
  <v-layout class="d-flex flex-column" style="min-height: 100vh;">
    <Header />
    <v-main style="flex-grow: 1;">
      <v-container fluid class="pa-4 pa-md-6">
        <router-view />
      </v-container>
    </v-main>
    <Footer />
  </v-layout>
</template>