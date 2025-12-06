<template>
  <v-container class="py-10">
    <v-row justify="center">
      <v-col cols="12" md="10" lg="8">
        <v-card class="elevation-2 rounded-lg">
          <v-img
            src="https://images.unsplash.com/photo-1507925921958-8a62f3d1a50d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80"
            height="200"
            cover
            class="align-end"
          >
            <v-card-title class="text-h3 text-white font-weight-bold mb-4 ml-4" style="text-shadow: 2px 2px 4px rgba(0,0,0,0.5)">
              Privacy Policy
            </v-card-title>
          </v-img>

          <v-card-text class="pa-8">
            <p class="text-body-1 mb-6 text-grey-darken-1">
              Last updated: {{ currentDate }}
            </p>

            <p class="text-body-1 mb-6">
              At <strong>Bookteria</strong>, we take your privacy seriously. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website. Please read this privacy policy carefully. If you do not agree with the terms of this privacy policy, please do not access the site.
            </p>

            <v-expansion-panels variant="accordion" class="mb-6">
              <v-expansion-panel v-for="(section, index) in sections" :key="index">
                <v-expansion-panel-title class="text-h6 font-weight-medium text-primary">
                  {{ section.title }}
                </v-expansion-panel-title>
                <v-expansion-panel-text class="text-body-1 py-4">
                  <div v-html="section.content"></div>
                </v-expansion-panel-text>
              </v-expansion-panel>
            </v-expansion-panels>

            <v-divider class="my-6"></v-divider>

            <div class="d-flex align-center bg-grey-lighten-4 pa-4 rounded">
              <v-icon icon="mdi-email-outline" size="large" color="primary" class="mr-4"></v-icon>
              <div>
                <div class="text-subtitle-1 font-weight-bold">Have questions?</div>
                <div class="text-body-2">
                  If you have any questions or comments about this policy, please contact us at 
                  <a href="mailto:support@bookteria.com" class="text-decoration-none font-weight-bold">support@bookteria.com</a>.
                </div>
              </div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref, computed } from 'vue';

const currentDate = computed(() => {
  return new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
});

const sections = ref([
  {
    title: '1. Information We Collect',
    content: `
      <p class="mb-2">We may collect information about you in a variety of ways. The information we may collect on the Site includes:</p>
      <ul class="ml-4 mb-2">
        <li><strong>Personal Data:</strong> Personally identifiable information, such as your name, shipping address, email address, and telephone number, and demographic information, such as your age, gender, hometown, and interests, that you voluntarily give to us when you register with the Site or when you choose to participate in various activities related to the Site.</li>
        <li><strong>Derivative Data:</strong> Information our servers automatically collect when you access the Site, such as your IP address, your browser type, your operating system, your access times, and the pages you have viewed directly before and after accessing the Site.</li>
        <li><strong>Financial Data:</strong> Financial information, such as data related to your payment method (e.g., valid credit card number, card brand, expiration date) that we may collect when you purchase, order, return, exchange, or request information about our services from the Site.</li>
      </ul>
    `
  },
  {
    title: '2. How We Use Your Information',
    content: `
      <p class="mb-2">Having accurate information about you permits us to provide you with a smooth, efficient, and customized experience. Specifically, we may use information collected about you via the Site to:</p>
      <ul class="ml-4 mb-2">
        <li>Create and manage your account.</li>
        <li>Process your orders and deliver products.</li>
        <li>Email you regarding your account or order.</li>
        <li>Fulfill and manage purchases, orders, payments, and other transactions related to the Site.</li>
        <li>Generate a personal profile about you to make future visits to the Site more personalized.</li>
        <li>Increase the efficiency and operation of the Site.</li>
        <li>Monitor and analyze usage and trends to improve your experience with the Site.</li>
        <li>Notify you of updates to the Site.</li>
        <li>Offer new products, services, and/or recommendations to you.</li>
      </ul>
    `
  },
  {
    title: '3. Disclosure of Your Information',
    content: `
      <p class="mb-2">We may share information we have collected about you in certain situations. Your information may be disclosed as follows:</p>
      <ul class="ml-4 mb-2">
        <li><strong>By Law or to Protect Rights:</strong> If we believe the release of information about you is necessary to respond to legal process, to investigate or remedy potential violations of our policies, or to protect the rights, property, and safety of others, we may share your information as permitted or required by any applicable law, rule, or regulation.</li>
        <li><strong>Third-Party Service Providers:</strong> We may share your information with third parties that perform services for us or on our behalf, including payment processing, data analysis, email delivery, hosting services, customer service, and marketing assistance.</li>
        <li><strong>Business Transfers:</strong> We may share or transfer your information in connection with, or during negotiations of, any merger, sale of company assets, financing, or acquisition of all or a portion of our business to another company.</li>
      </ul>
    `
  },
  {
    title: '4. Security of Your Information',
    content: `
      <p>We use administrative, technical, and physical security measures to help protect your personal information. While we have taken reasonable steps to secure the personal information you provide to us, please be aware that despite our efforts, no security measures are perfect or impenetrable, and no method of data transmission can be guaranteed against any interception or other type of misuse.</p>
    `
  },
  {
    title: '5. Policy for Children',
    content: `
      <p>We do not knowingly solicit information from or market to children under the age of 13. If you become aware that any data we have collected comes from children under the age of 13, please contact us using the contact information provided below.</p>
    `
  },
  {
    title: '6. Controls for Do-Not-Track Features',
    content: `
      <p>Most web browsers and some mobile operating systems and mobile applications include a Do-Not-Track ("DNT") feature or setting you can activate to signal your privacy preference not to have data about your online browsing activities monitored and collected. No uniform technology standard for recognizing and implementing DNT signals has been finalized. As such, we do not currently respond to DNT browser signals or any other mechanism that automatically communicates your choice not to be tracked online.</p>
    `
  }
]);
</script>

<style scoped>
.v-expansion-panel-title {
  font-size: 1.1rem;
}
</style>
