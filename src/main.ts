import { createApp } from 'vue';
import App from './App.vue';
import { createCds, components } from '@central-design-system/components';
import { icons } from '@central-design-system/icons';

import '@vue/repl/style.css';
import '@central-design-system/components/dist/cds.css';
import { createPinia } from 'pinia';

const app = createApp(App);

const pinia = createPinia();
const cds = createCds({ components, icons, theme: { defaultTheme: 'cdsDark' } });


app.use(pinia)
app.use(cds);
app.mount('#app');
