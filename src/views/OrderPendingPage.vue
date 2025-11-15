<template>
  <v-container class="fill-height">
    <v-row align="center" justify="center">
      <v-col cols="12" md="6" class="text-center">
        <v-card class="pa-8">
          <v-progress-circular
            indeterminate
            color="primary"
            size="64"
            class="mb-6"
          ></v-progress-circular>
          <h1 class="text-h5 font-weight-medium mb-4">
            Processing Your Order
          </h1>
          <p class="text-medium-emphasis">
            We are generating your payment link. Please do not close this window.
          </p>
          <p class="text-caption text-grey mt-2">(Order ID: {{ id }})</p>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
defineProps({
  id: String
});
</script>