<template>
  <v-container max-width="900">
    <v-row justify="center" class="text-center py-8">
      <v-col cols="12">
        <v-sheet class="pa-8" rounded="xl">
          <h1 class="text-h2 font-weight-bold text-primary mb-4">
            Welcome to Bookteria!
          </h1>
          <p class="text-h5 text-medium-emphasis font-weight-regular mb-6" style="max-width: 600px; margin: auto;">
            Discover your next favorite book from our vast collection. Explore genres, bestsellers, and hidden gems.
          </p>
          <v-btn size="large" color="primary" variant="flat" to="/books">
            Browse Books
          </v-btn>
        </v-sheet>
      </v-col>
    </v-row>
  </v-container>
</template>