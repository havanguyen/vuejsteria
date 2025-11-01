import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import pinia from './plugins/pinia';
import vuetify from './plugins/vuetify';
import axiosPlugin from './plugins/axios';

const app = createApp(App);

app.use(pinia);
app.use(axiosPlugin);
app.use(router);
app.use(vuetify);

router.isReady().then(() => {
  app.mount('#app');
});