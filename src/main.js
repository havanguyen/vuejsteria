import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import pinia from './plugins/pinia';
import vuetify from './plugins/vuetify';

const app = createApp(App);

app.use(pinia);
app.use(router);
app.use(vuetify);

router.isReady().then(() => {
    console.log('🚀 App mount: Router is ready.');
    app.mount('#app');
}).catch(err => {
     console.error("🚦 App mount failed:", err);
});