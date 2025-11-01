<template>
  <v-layout>
    <Header />
    <v-main>
      <GlobalLoadingIndicator />
      <v-container fluid>
        <router-view />
      </v-container>
    </v-main>
    <Footer />
  </v-layout>
</template>

<script setup>
import Header from './Header.vue';
import Footer from './Footer.vue';
import GlobalLoadingIndicator from './GlobalLoadingIndicator.vue';
</script>