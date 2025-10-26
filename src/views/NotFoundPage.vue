<template>
  <v-container class="fill-height">
    <v-row align="center" justify="center" class="text-center">
      <v-col cols="12" sm="8" md="6">
        <v-icon icon="mdi-alert-circle-outline" color="error" size="80" />
        <h1 class="text-h1 font-weight-bold text-primary my-4">
          404
        </h1>
        <h2 class="text-h5 mb-4">
          Oops! Page Not Found.
        </h2>
        <p class="text-medium-emphasis mb-6">
          The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
        </p>
        <v-btn size="large" color="primary" variant="flat" :to="{ name: 'Home' }">
          Go Back Home
        </v-btn>
      </v-col>
    </v-row>
  </v-container>
</template>