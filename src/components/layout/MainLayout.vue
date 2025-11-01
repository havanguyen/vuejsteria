<template>
  <v-app>
    <Header/>
    
    <v-main>
      <v-container fluid class="pa-4 pa-md-8">
        <router-view />
      </v-container>
    </v-main>
    
    <Footer/>
  </v-app>
</template>

<script setup>
import Header from './Header.vue';
import Footer from './Footer.vue';
</script>