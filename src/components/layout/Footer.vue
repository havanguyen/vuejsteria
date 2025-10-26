<script setup>
const currentYear = new Date().getFullYear();
</script>

<template>
  <v-footer app border class="d-flex flex-column pa-4" style="flex-grow: 0;">
    <div class="text-center w-100 mb-2">
      Bookteria - Your favorite online bookstore.
    </div>
    <div class="text-center w-100 text-grey">
      &copy; {{ currentYear }} 
      <a href="#" class="text-decoration-none text-grey-darken-1 font-weight-bold">Bookteria</a>. 
      All Rights Reserved.
    </div>
  </v-footer>
</template>