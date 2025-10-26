<script setup>
</script>

<template>
  <v-app style="height: 100vh;">
    <router-view />
  </v-app>
</template>

<style>
html, body {
  height: 100%;
  margin: 0;
  padding: 0;
}

#app {
  height: 100%;
}

.fill-height {
  min-height: 100vh;
}
</style>