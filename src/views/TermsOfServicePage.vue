<template>
  <v-container class="py-10">
    <v-row justify="center">
      <v-col cols="12" md="10" lg="8">
        <v-card class="elevation-2 rounded-lg">
          <v-img
            src="https://images.unsplash.com/photo-1450101499163-c8848c66ca85?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80"
            height="200"
            cover
            class="align-end"
          >
            <v-card-title class="text-h3 text-white font-weight-bold mb-4 ml-4" style="text-shadow: 2px 2px 4px rgba(0,0,0,0.5)">
              Terms of Service
            </v-card-title>
          </v-img>

          <v-card-text class="pa-8">
            <p class="text-body-1 mb-6 text-grey-darken-1">
              Last updated: {{ currentDate }}
            </p>

            <p class="text-body-1 mb-6">
              Please read these Terms of Service ("Terms", "Terms of Service") carefully before using the <strong>Bookteria</strong> website (the "Service") operated by Bookteria ("us", "we", or "our"). Your access to and use of the Service is conditioned on your acceptance of and compliance with these Terms. These Terms apply to all visitors, users, and others who access or use the Service.
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
                  If you have any questions about these Terms, please contact us at 
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
    title: '1. Acceptance of Terms',
    content: `
      <p>By accessing or using the Service you agree to be bound by these Terms. If you disagree with any part of the terms then you may not access the Service.</p>
    `
  },
  {
    title: '2. Accounts',
    content: `
      <p class="mb-2">When you create an account with us, you must provide us information that is accurate, complete, and current at all times. Failure to do so constitutes a breach of the Terms, which may result in immediate termination of your account on our Service.</p>
      <p>You are responsible for safeguarding the password that you use to access the Service and for any activities or actions under your password, whether your password is with our Service or a third-party service.</p>
    `
  },
  {
    title: '3. Intellectual Property',
    content: `
      <p>The Service and its original content, features, and functionality are and will remain the exclusive property of Bookteria and its licensors. The Service is protected by copyright, trademark, and other laws of both the Country and foreign countries. Our trademarks and trade dress may not be used in connection with any product or service without the prior written consent of Bookteria.</p>
    `
  },
  {
    title: '4. Links To Other Web Sites',
    content: `
      <p>Our Service may contain links to third-party web sites or services that are not owned or controlled by Bookteria.</p>
      <p>Bookteria has no control over, and assumes no responsibility for, the content, privacy policies, or practices of any third-party web sites or services. You further acknowledge and agree that Bookteria shall not be responsible or liable, directly or indirectly, for any damage or loss caused or alleged to be caused by or in connection with use of or reliance on any such content, goods or services available on or through any such web sites or services.</p>
    `
  },
  {
    title: '5. Termination',
    content: `
      <p>We may terminate or suspend your account immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms.</p>
      <p>Upon termination, your right to use the Service will immediately cease. If you wish to terminate your account, you may simply discontinue using the Service.</p>
    `
  },
  {
    title: '6. Limitation of Liability',
    content: `
      <p>In no event shall Bookteria, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from (i) your access to or use of or inability to access or use the Service; (ii) any conduct or content of any third party on the Service; (iii) any content obtained from the Service; and (iv) unauthorized access, use or alteration of your transmissions or content, whether based on warranty, contract, tort (including negligence) or any other legal theory, whether or not we have been informed of the possibility of such damage, and even if a remedy set forth herein is found to have failed of its essential purpose.</p>
    `
  },
  {
    title: '7. Disclaimer',
    content: `
      <p>Your use of the Service is at your sole risk. The Service is provided on an "AS IS" and "AS AVAILABLE" basis. The Service is provided without warranties of any kind, whether express or implied, including, but not limited to, implied warranties of merchantability, fitness for a particular purpose, non-infringement or course of performance.</p>
    `
  },
  {
    title: '8. Governing Law',
    content: `
      <p>These Terms shall be governed and construed in accordance with the laws of the Country, without regard to its conflict of law provisions.</p>
      <p>Our failure to enforce any right or provision of these Terms will not be considered a waiver of those rights. If any provision of these Terms is held to be invalid or unenforceable by a court, the remaining provisions of these Terms will remain in effect.</p>
    `
  },
  {
    title: '9. Changes',
    content: `
      <p>We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is material we will try to provide at least 30 days notice prior to any new terms taking effect. What constitutes a material change will be determined at our sole discretion.</p>
      <p>By continuing to access or use our Service after those revisions become effective, you agree to be bound by the revised terms. If you do not agree to the new terms, please stop using the Service.</p>
    `
  }
]);
</script>

<style scoped>
.v-expansion-panel-title {
  font-size: 1.1rem;
}
</style>
