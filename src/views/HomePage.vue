<template>
  <v-container class="fill-height">
    <v-row justify="center" class="text-center py-8">
      <v-col cols="12" md="10" lg="8">
        <v-slide-y-transition appear>
          <v-card
            variant="transparent"
            class="pa-8"
            elevation="0"
            style="
              background: transparent;
              backdrop-filter: none;
              border: none;
            "
          >
            <h1
              class="text-h1 font-weight-bold mb-6"
              style="
                color: white;
                text-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
              "
            >
              Welcome to Bookteria!
            </h1>
            <p
              class="text-h5 font-weight-regular mb-10"
              style="
                max-width: 650px;
                margin: auto;
                color: rgba(255, 255, 255, 0.9);
                text-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
              "
            >
              Discover your next favorite book from our vast collection. Explore
              genres, bestsellers, and hidden gems.
            </p>
            <v-btn
              size="x-large"
              color="primary"
              variant="flat"
              to="/books"
              class="hover-lift"
              elevation="8"
            >
              <v-icon start>mdi-book-search-outline</v-icon>
              Browse All Books
            </v-btn>
          </v-card>
        </v-slide-y-transition>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup></script>

<style>
.hover-lift {
  transition:
    all 0.2s ease-out !important;
}
.hover-lift:hover {
  transform: translateY(-2px);
  box-shadow: 0px 6px 15px rgba(0, 0, 0, 0.2) !important;
}
</style>