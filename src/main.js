import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import pinia from './plugins/pinia';
import vuetify from './plugins/vuetify';
import { useAuthStore } from './stores/useAuthStore';

const app = createApp(App);

app.use(pinia);

const authStore = useAuthStore();

app.use(router);
app.use(vuetify);

router.isReady().then(() => {
  app.mount('#app');
});